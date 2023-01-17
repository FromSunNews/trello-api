import { HttpStatusCode } from '*/utilities/constants'
import { CheckListService } from '*/services/checklist.service'

const createNew = async (req, res) => {
  try {
    const result = await CheckListService.createNew(req.body)
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
    const result = await CheckListService.update(id, req.body)

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

export const CheckListController = {
  createNew,
  update
}
