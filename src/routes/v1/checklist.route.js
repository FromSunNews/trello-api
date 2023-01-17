import express from 'express'
import { CheckListController } from '*/controllers/checklist.controller'
import { CheckListValidation } from '*/validations/checklist.validation'

import {AuthMiddleware} from '*/middlewares/auth.middleware'

const router = express.Router()

router.route('/')
  .post(AuthMiddleware.isAuthorized, CheckListValidation.createNew, CheckListController.createNew)

router.route('/:id')
  .put(AuthMiddleware.isAuthorized, CheckListValidation.update, CheckListController.update)

export const checklistRoutes = router
