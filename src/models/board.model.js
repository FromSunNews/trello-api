import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { getDB } from '*/config/mongodb'
import { ColumnModel } from './column.model'
import { CardModel } from './card.model'
import { UserModel } from './user.model'
import { LabelModel } from './label.model'
import { pagingSkipValue } from '*/utilities/algorithms'
import { cloneDeep } from 'lodash'
import { CheckListModel } from './checklist.model'
import { ToDoModel } from './todo.model'
// Define Board collection
const boardCollectionName = 'boards'
const boardCollectionSchema = Joi.object({
  title: Joi.string().required().min(1).max(50).trim(),

  description: Joi.string().required().min(3).max(256).trim(),
  ownerIds: Joi.array().items(Joi.string()).default([]),
  memberIds: Joi.array().items(Joi.string()).default([]),
  labelIds: Joi.array().items(Joi.string()).default([]),
  checklistIds: Joi.array().items(Joi.string()).default([]),
  todoIds: Joi.array().items(Joi.string()).default([]),
  
  columnOrder: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date().timestamp().default(Date.now()),
  updatedAt: Joi.date().timestamp().default(null),

  _expandLabels: Joi.boolean().default(false),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FILEDS = ['_id','createdAt', 'currentUserId', 'members', 'owners', 'totalUsers']


const validateSchema = async (data) => {
  return await boardCollectionSchema.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOne({ _id: ObjectId(id) })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createNew = async (data, userId) => {
  try {
    const value = await validateSchema(data)

    const createData = {
      ...value,
      ownerIds: [ObjectId(userId)]
    }

    const result = await getDB().collection(boardCollectionName).insertOne(createData)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    
    let updateData = { ...data }
    
    const fieldsConvertToObjectId = ['ownerIds', 'memberIds', 'labelIds', 'checklistIds', 'todoIds']
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

    Object.keys(updateData).forEach(fieldName => {
      if(INVALID_UPDATE_FILEDS.includes(fieldName)){
        delete updateData[fieldName]
      }
    })

    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
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
 * @param {string} boardId
 * @param {string} columnId
 */
const pushColumnOrder = async (boardId, columnId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(boardId) },
      { $push: { columnOrder: columnId } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const pushMembers = async (boardId, userId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(boardId) },
      { $push: { memberIds: ObjectId(userId) } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}


const getFullBoard = async (boardId) => {
  try {
    const result = await getDB().collection(boardCollectionName).aggregate([
      { $match: {
        _id: ObjectId(boardId),
        _destroy: false
      } },
      { $lookup: {
        from: ColumnModel.columnCollectionName,
        localField: '_id',
        foreignField: 'boardId',
        as: 'columns'
      } },
      { $lookup: {
        from: CardModel.cardCollectionName,
        localField: '_id',
        foreignField: 'boardId',
        as: 'cards'
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'ownerIds', // array of onjectid
        foreignField: '_id',
        as: 'owners',
        pipeline: [
          { $project: { 'password': 0, 'verifyToken': 0 } }
        ]
      } },
      { $lookup: {
        from: UserModel.userCollectionName,
        localField: 'memberIds', // array of onjectid
        foreignField: '_id',
        as: 'members',
        pipeline: [
          { $project: { 'password': 0, 'verifyToken': 0 } }
        ]
      } },
      { $lookup: {
        from: LabelModel.labelCollectionName,
        localField: 'labelIds', // array of onjectid
        foreignField: '_id',
        as: 'labels'
      } },
      { $lookup: {
        from: CheckListModel.checklistCollectionName,
        localField: 'checklistIds', // array of onjectid
        foreignField: '_id',
        as: 'checklists'
      } },
      { $lookup: {
        from: ToDoModel.todoCollectionName,
        localField: 'todoIds', // array of onjectid
        foreignField: '_id',
        as: 'todos'
      } }
    ]).toArray()

    return result[0] || {}
  } catch (error) {
    throw new Error(error)
  }
}

const getListBoards = async (userId, currentPage, itemsPerPage, queryFilters) => {
  try {
    const queryConditions = [
      { _destroy: false},
      { $or: [
        { ownerIds: { $all:[ObjectId(userId)] }},
        { memberIds: { $all:[ObjectId(userId)] }}
      ]}
    ]

    if (queryFilters) {
      Object.keys(queryFilters).forEach(key => {
         // Có phân biệt chauwx hoa chữ thường
        // queryConditions.push({ [key]: { $regex: queryFilters[key] } })
        // Không phân biệt chauwx hoa chữ thường
        queryConditions.push({ [key]: { $regex: new RegExp( queryFilters[key], 'i') }}) 
      })
    }


    // console.log('queryFilters', queryFilters)

    const query = await getDB().collection(boardCollectionName).aggregate(
      [
        { $match: { $and: queryConditions } },
        { $sort: { title: 1 } }, // title A-Z
        { $facet: {
          'boards': [
            { $skip: pagingSkipValue(currentPage, itemsPerPage) },
            { $limit: itemsPerPage }
          ],
          'totalBoards': [
            { $count: 'countedBoards' }
          ]
        } }
    ],
    { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]
    return {
      boards: res.boards || [],
      totalBoards: res.totalBoards[0]?.countedBoards || 0
    }
    
  } catch (error) {
    throw new Error(error)
  }
}

const pushLabel = async (boardId, labelId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(boardId) },
      { $push: { labelIds: ObjectId(labelId) } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const pushCheckList = async (boardId, checklistId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(boardId) },
      { $push: { checklistIds: ObjectId(checklistId) } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

const pushToDo = async (boardId, todoId) => {
  try {
    const result = await getDB().collection(boardCollectionName).findOneAndUpdate(
      { _id: ObjectId(boardId) },
      { $push: { todoIds: ObjectId(todoId) } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

export const BoardModel = {
  createNew,
  update,
  pushColumnOrder,
  getFullBoard,
  findOneById,
  getListBoards,
  boardCollectionName,
  pushMembers,
  pushLabel,
  pushCheckList,
  pushToDo
}
