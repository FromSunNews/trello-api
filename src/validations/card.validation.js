import Joi from 'joi'
import { HttpStatusCode } from '*/utilities/constants'

const createNew = async (req, res, next) => {
  const condition = Joi.object({
    boardId: Joi.string().required(),
    columnId: Joi.string().required(),
    title: Joi.string().required().min(2).max(50).trim(),
    memberIds: Joi.array(),
    dates: Joi.object()
  })
  try {
    await condition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      errors: new Error(error).message
    })
  }
}

const update = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().min(1).max(50).trim(),
    boardId: Joi.string(),
    columnId: Joi.string(),
    labelIds: Joi.array().items(Joi.string()),
    dates: Joi.object().keys({
      startDate: Joi.date().timestamp(),
      endDate: Joi.date().timestamp(),
      reminderTime: Joi.date().timestamp(),
      _finished: Joi.boolean()
    }).default({}), 
  })
  try {
    await condition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      errors: new Error(error).message
    })
  }
}

export const CardValidation = {
  createNew,
  update
}
