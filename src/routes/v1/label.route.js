import express from 'express'
import { LabelController } from '*/controllers/label.controller'
import { LabelValidation } from '*/validations/label.validation'

import {AuthMiddleware} from '*/middlewares/auth.middleware'

const router = express.Router()

router.route('/')
  .post(AuthMiddleware.isAuthorized, LabelValidation.createNew, LabelController.createNew)

router.route('/:id')
  .put(AuthMiddleware.isAuthorized, LabelValidation.update, LabelController.update)

export const labelRoutes = router
