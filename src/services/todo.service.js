import { ToDoModel } from '*/models/todo.model'
import { BoardModel } from '*/models/board.model'
import { CheckListModel } from '*/models/checklist.model'
 
const createNew = async (data) => {
  try {
    console.log("🚀 ~ file: todo.service.js:6 ~ createNew ~ data", data)
    
    const createdToDo = await ToDoModel.createNew(data)

    const getNewToDo = await ToDoModel.findOneById(createdToDo.insertedId.toString())
    
    console.log("🚀 ~ file: todo.service.js:11 ~ createNew ~ getNewToDo", getNewToDo)
    // nếu một người tạo mới thì sẽ push nó vào board hiện tại luôn
    await BoardModel.pushToDo(getNewToDo.boardId.toString(), getNewToDo._id.toString())
    // nếu một người tạo mới thì sẽ push nó vào checklist hiện tại luôn
    await CheckListModel.pushToDo(getNewToDo.checklistId.toString(), getNewToDo._id.toString())

    return getNewToDo
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
    let updatedToDo 
    if (data.pushId) {
      updatedToDo = await ToDoModel.pushMember(id, data.pushId)
    }
    else 
      updatedToDo = await ToDoModel.update(id, updateData)

    return updatedToDo
  } catch (error) {
    throw new Error(error)
  }
}

export const ToDoService = {
  createNew,
  update
}
 
 

