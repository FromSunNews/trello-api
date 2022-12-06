import express from 'express'
import { CardController } from '*/controllers/card.controller'
import { CardValidation } from '*/validations/card.validation'
import {AuthMiddleware} from '*/middlewares/auth.middleware'

const router = express.Router()

router.route('/')
  .post(AuthMiddleware.isAuthorized, CardValidation.createNew, CardController.createNew)

router.route('/:id')
  .put(AuthMiddleware.isAuthorized, CardValidation.update, CardController.update)

export const cardRoutes = router
