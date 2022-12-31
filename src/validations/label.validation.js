import Joi from 'joi'
import { HttpStatusCode } from '*/utilities/constants'

const createNew = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().required().min(1).max(50).trim(),
    boardId: Joi.string().required(),
    createAtCard: Joi.string().required(),
    backgroundColor: Joi.string().required(),
    primaryColor: Joi.string().required()
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
    backgroundColor: Joi.string(),
    primaryColor: Joi.string()
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

export const LabelValidation = {
  createNew,
  update
}
