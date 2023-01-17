import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'

// Define todo collection
const todoCollectionName = 'todos'
const todoCollectionSchema = Joi.object({
  title: Joi.string().required().min(1).trim(),
  boardId: Joi.string().required(), // also ObjectId when create new
  checklistId: Joi.string().required(), // also ObjectId when create new
  convertCardId: Joi.string().default(null),
  expirationDate: Joi.date().timestamp().default(null),
  reminderTime: Joi.date().timestamp().default(null),
  memberIds: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp().default(null),
  _finished: Joi.boolean().default(false),
  _destroy: Joi.boolean().default(false)
})
 
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt', 'boardId', 'convertCardId', 'checklistId']
 
const validateSchema = async (data) => {
  return await todoCollectionSchema.validateAsync(data, { abortEarly: false })
}
 
const findOneById = async (id) => {
  try {
    const result = await getDB().collection(todoCollectionName).findOne({ _id: ObjectId(id) })
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
      boardId: ObjectId(validatedValue.boardId)
    }
    const result = await getDB().collection(todoCollectionName).insertOne(insertValue)
    //  console.log('result todo: ' + result)
    return result
 } catch (error) {
    throw new Error(error)
 }
}
 
const update = async (id, data) => {
 try {
   const updateData = { ...data }
 
   // Quan trọng: Lọc những field không được phép cập nhật:
   Object.keys(updateData).forEach(fieldName => {
     if (INVALID_UPDATE_FIELDS.includes(fieldName)) delete updateData[fieldName]
   })
 
   const result = await getDB().collection(todoCollectionName).findOneAndUpdate(
     { _id: ObjectId(id) },
     { $set: updateData },
     { returnDocument: 'after' }
   )
 
   return result.value
 } catch (error) {
   throw new Error(error)
 }
}

const pushMember = async (todoId, userId) => {
  try {
    const result = await getDB().collection(todoCollectionName).findOneAndUpdate(
      { _id: ObjectId(todoId) },
      { $push: { memberIds: ObjectId(userId) } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}
 
export const ToDoModel = {
  createNew,
  update,
  findOneById,
  todoCollectionName,
  pushMember

}
