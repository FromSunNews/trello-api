import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'

// Define Card collection
const cardCollectionName = 'cards'
const cardCollectionSchema = Joi.object({
  boardId: Joi.string().required(), // also ObjectId when create new
  columnId: Joi.string().required(), // also ObjectId when create new
  title: Joi.string().required().min(1).max(50).trim(),
  description: Joi.string().optional(),
  memberIds: Joi.array().items(Joi.string()).default([]),
  comments: Joi.array().items({
    userId: Joi.string(),
    userEmail: Joi.string(),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    createdAt: Joi.date().timestamp()  // vì chỗ này sau sẽ dùng hàm $push nên nó không ăn giá trị default giống hàm insertOne được
  }).default([]),
  cover: Joi.string().default(null),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FILEDS = ['_id','createdAt','boardId']

const validateSchema = async (data) => {
  return await cardCollectionSchema.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id) => {
  try {
    const result = await getDB().collection(cardCollectionName).findOne({ _id: ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createNew = async (data) => {
  try {
    const validatedValue = await validateSchema(data)
    const insertValue = {
      ...validatedValue,
      boardId: ObjectId(validatedValue.boardId),
      columnId: ObjectId(validatedValue.columnId)
    }
    const result = await getDB().collection(cardCollectionName).insertOne(insertValue)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    
    const updateData = { ...data }

    
    if ( updateData.comments ) {
      
      let newComments = []

      updateData.comments.forEach( comment => {
        comment = {
          ...comment,
          userId: new ObjectId(comment.userId)
        }
        newComments.push(comment)
      })

      updateData.comments = newComments
    }

    console.log("goi ham update card", updateData)


    Object.keys(updateData).forEach(fieldName => {
      if(INVALID_UPDATE_FILEDS.includes(fieldName)){
        delete updateData[fieldName]
      }
    })
    
    if (data.columnId) updateData.columnId = ObjectId(data.columnId)

    const result = await getDB().collection(cardCollectionName).findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * @param {Array of string card id} ids
 */
const deleteMany = async (ids) => {
  try {
    const transformIds = ids.map(i => ObjectId(i))
    const result = await getDB().collection(cardCollectionName).updateMany(
      { _id: { $in: transformIds } },
      { $set: { _destroy: true } }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pushNewComment = async (cardId, comment) => {
  try {
    const result = await getDB().collection(cardCollectionName).findOneAndUpdate(
      { _id: ObjectId(cardId) },
      { $push: { comments: comment } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const updateMembers = async (cardId, incomingMember) => {
  // console.log("incomingMember Action", incomingMember.action)
  // console.log("incomingMember userId", incomingMember.userId)
  let updateCondition = {}
  if (incomingMember.action === 'CARD_MEMBERS_ACTION_PUSH') {
    updateCondition =  { $push: { memberIds: ObjectId(incomingMember.userId) } }
  }
  if (incomingMember.action === 'CARD_MEMBERS_ACTION_REMOVE') {
    updateCondition =  { $pull: { memberIds: ObjectId(incomingMember.userId) } }
  }
  try {
    const result = await getDB().collection(cardCollectionName).findOneAndUpdate(
      { _id: ObjectId(cardId) },
      updateCondition,
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const updateManyComments = async (userInfo) => {
  try {
    // console.log("userInfo from model", userInfo)
    // Updating Arrays https://www.mongodb.com/docs/manual/reference/method/db.collection.updateMany/
    // Example: https://www.mongodb.com/docs/manual/reference/method/db.collection.updateMany/#std-label-updateMany-arrayFilters
    const result = await getDB().collection(cardCollectionName).updateMany(
      { 'comments.userId': ObjectId(userInfo._id) },
      { $set: {
        'comments.$[element].userAvatar': userInfo.avatar,
        'comments.$[element].userDisplayName': userInfo.displayName,
      } },
      { arrayFilters: [{ 'element.userId': ObjectId(userInfo._id) }] }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const CardModel = {
  cardCollectionName,
  createNew,
  deleteMany,
  update,
  findOneById,
  pushNewComment,
  updateMembers,
  updateManyComments
}
