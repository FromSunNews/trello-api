import { HttpStatusCode } from '*/utilities/constants'
import { LabelService } from '*/services/label.service'

const createNew = async (req, res) => {
  try {
    const result = await LabelService.createNew(req.body)
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
    const result = await LabelService.update(id, req.body)

    res.status(HttpStatusCode.OK).json(result)
  } catch (error) {
    res.status(HttpStatusCode.INTERNAL_SERVER).json({
      errors: error.message
    })
  }
}

export const LabelController = {
  createNew,
  update
}
