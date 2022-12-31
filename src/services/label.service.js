import { LabelModel } from '*/models/label.model'
import { BoardModel } from '*/models/board.model'
import { CardModel } from '*/models/card.model'
 
const createNew = async (data) => {
  try {
    const createAtCard = data.createAtCard
    delete data[createAtCard]
    const createdLabel = await LabelModel.createNew(data)
    const getNewLabel = await LabelModel.findOneById(createdLabel.insertedId.toString())

    // nếu một người tạo mới thì sẽ push nó vào board hiện tại luôn
    await BoardModel.pushLabel(getNewLabel.boardId.toString(), getNewLabel._id.toString())
    // nếu một người tạo mới thì sẽ push nó vào card hiện tại luôn
    await CardModel.pushLabel(createAtCard, getNewLabel._id.toString())

    return getNewLabel
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: Date.now()
    }
   
    const updatedLabel = await LabelModel.update(id, updateData)

    return updatedLabel
  } catch (error) {
    throw new Error(error)
  }
}

export const LabelService = {
  createNew,
  update
}
 
 

