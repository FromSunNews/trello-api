import Joi from 'joi'
import { HttpStatusCode } from '*/utilities/constants'

const createNew = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().required().min(1).trim(),
    boardId: Joi.string().required(),
    cardId: Joi.string().required(),
    coppyFrom: Joi.string(),
    todos: Joi.array()
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
    title: Joi.string().min(1).max(50).trim()
  })
  try {
    await condition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    })
    next()
  } catch (error) {
    console.log("🚀 ~ file: checklist.validation.js:33 ~ update ~ error", error)
    
    res.status(HttpStatusCode.BAD_REQUEST).json({
      errors: new Error(error).message
    })
  }
}

export const CheckListValidation = {
  createNew,
  update
}
