/**
 * 
 * @param {*} socket from socket library
 */

export const createNewColumnSocket = (socket) => {
  socket.on('c_user_created_new_column_to_board', (newBoard) => {
    socket.broadcast.emit('s_user_create_new_column_to_board', newBoard)
  })
}

export const updateColumnSocket = (socket) => {
  socket.on('c_user_updated_column_to_board', (newBoard) => {
    socket.broadcast.emit('s_user_updated_column_to_board', newBoard)
  })
}
