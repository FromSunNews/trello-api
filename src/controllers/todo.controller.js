import { HttpStatusCode } from '*/utilities/constants'
import { ToDoService } from '*/services/todo.service'

const createNew = async (req, res) => {
  try {
    const result = await ToDoService.createNew(req.body)
    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.params
    const result = await ToDoService.update(id, req.body)

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

export const ToDoController = {
  createNew,
  update
}
