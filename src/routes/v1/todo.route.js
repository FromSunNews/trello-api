import express from 'express'
import { ToDoController } from '*/controllers/todo.controller'
import { ToDoValidation } from '*/validations/todo.validation'

import {AuthMiddleware} from '*/middlewares/auth.middleware'

const router = express.Router()

router.route('/')
  .post(AuthMiddleware.isAuthorized, ToDoValidation.createNew, ToDoController.createNew)

router.route('/:id')
  .put(AuthMiddleware.isAuthorized, ToDoValidation.update, ToDoController.update)

export const todoRoutes = router
