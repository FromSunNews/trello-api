import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'

// Define label collection
const labelCollectionName = 'labels'
const labelCollectionSchema = Joi.object({
  title: Joi.string().required().min(1).max(50).trim(),
  boardId: Joi.string().required(), // also ObjectId when create new
  backgroundColor: Joi.string().required(),
  primaryColor: Joi.string().required(),
  createAtCard: Joi.string().required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false)
})
 
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt', 'createAtCard']
 
const validateSchema = async (data) => {
  return await labelCollectionSchema.validateAsync(data, { abortEarly: false })
}
 
const findOneById = async (id) => {
  try {
    const result = await getDB().collection(labelCollectionName).findOne({ _id: ObjectId(id) })
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
    const result = await getDB().collection(labelCollectionName).insertOne(insertValue)
    //  console.log('result label: ' + result)
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
 
   const result = await getDB().collection(labelCollectionName).findOneAndUpdate(
     { _id: ObjectId(id) },
     { $set: updateData },
     { returnDocument: 'after' }
   )
 
   return result.value
 } catch (error) {
   throw new Error(error)
 }
}
 
export const LabelModel = {
  createNew,
  update,
  findOneById,
  labelCollectionName
}
