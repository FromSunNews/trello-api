import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'

// Define checklist collection
const checklistCollectionName = 'checklists'
const checklistCollectionSchema = Joi.object({
  title: Joi.string().required().min(1).max(50).trim(),
  boardId: Joi.string().required(), // also ObjectId when create new
  cardId: Joi.string().required(), // also ObjectId when create new
  coppyFrom: Joi.string().default(null),
  todoIds: Joi.array().items(Joi.string()).default([]),
  todos: Joi.array().default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false)
})
 
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt', 'cardId', 'coppyFrom']
 
const validateSchema = async (data) => {
  return await checklistCollectionSchema.validateAsync(data, { abortEarly: false })
}
 
const findOneById = async (id) => {
  try {
    const result = await getDB().collection(checklistCollectionName).findOne({ _id: ObjectId(id) })
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
    const result = await getDB().collection(checklistCollectionName).insertOne(insertValue)
    //  console.log('result checklist: ' + result)
    return result
 } catch (error) {
    throw new Error(error)
 }
}
 
const update = async (id, data) => {
 try {
   const updateData = { ...data }

   const fieldsConvertToObjectId = ['todoIds']
    fieldsConvertToObjectId.forEach(key => {
      if (updateData[key]) {
        let newArray = []
        
        updateData[key].forEach( element => {
          element = new ObjectId(element) 
          newArray.push(element)
        })
  
        updateData[key] = newArray
  
      }
    })
 
   // Quan trọng: Lọc những field không được phép cập nhật:
   Object.keys(updateData).forEach(fieldName => {
     if (INVALID_UPDATE_FIELDS.includes(fieldName)) delete updateData[fieldName]
   })
 
   const result = await getDB().collection(checklistCollectionName).findOneAndUpdate(
     { _id: ObjectId(id) },
     { $set: updateData },
     { returnDocument: 'after' }
   )
 
   return result.value
 } catch (error) {
   throw new Error(error)
 }
}

const pushToDo = async (cardId, todoId) => {
  
  try {
    const result = await getDB().collection(checklistCollectionName).findOneAndUpdate(
      { _id: ObjectId(cardId) },
      { $push: { todoIds: { $each: [ObjectId(todoId)], $position: 0 } } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}
 
export const CheckListModel = {
  createNew,
  update,
  findOneById,
  checklistCollectionName,
  pushToDo
}
