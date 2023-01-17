import { CheckListModel } from '*/models/checklist.model'
import { BoardModel } from '*/models/board.model'
import { CardModel } from '*/models/card.model'
import { ToDoService } from '*/services/todo.service'
import { cloneDeep } from 'lodash'
 
const createNew = async (data) => {
  try {
    let todos 
    if (data.todos) {
      todos = cloneDeep(data.todos) 
      delete data.todos
    }
    console.log('🚀 ~ file: checklist.service.js:12 ~ createNew ~ todos', todos)
    
    const createdCheckList = await CheckListModel.createNew(data)
    console.log('Create Checklist success !', createdCheckList)

    let getNewCheckList = await CheckListModel.findOneById(createdCheckList.insertedId.toString())

    // nếu một người tạo mới thì sẽ push nó vào board hiện tại luôn
    await BoardModel.pushCheckList(getNewCheckList.boardId.toString(), getNewCheckList._id.toString())
    // nếu một người tạo mới thì sẽ push nó vào card hiện tại luôn
    await CardModel.pushCheckList(getNewCheckList.cardId.toString(), getNewCheckList._id.toString())
    // Nếu có thêm trường todos từ FE gửi về thì chúng ta tạo thêm các todo ở bên trong

    if (todos) {
      let newListToDo = []
      const checklistId = getNewCheckList._id.toString()
      todos.map( async todo => {
        let updateToDo = {
          title: todo.title,
          checklistId: checklistId,
          boardId: todo.boardId
        }
        console.log('updateToDo: ',updateToDo)

        const newToDo = await ToDoService.createNew(updateToDo)
        
        console.log("🚀 ~ file: checklist.service.js:39 ~ createNew ~ newToDo", newToDo)
        newListToDo.push(newToDo)
      })
      console.log(" ~ createNew ~ newListToDo", newListToDo)


      getNewCheckList = await CheckListModel.findOneById(checklistId)
      getNewCheckList.todos = newListToDo
    }
    
    console.log(" createNew ~ getNewCheckList", getNewCheckList)
    
    return getNewCheckList
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
   
    const updatedCheckList = await CheckListModel.update(id, updateData)

    return updatedCheckList
  } catch (error) {
    throw new Error(error)
  }
}

export const CheckListService = {
  createNew,
  update
}
 
 

