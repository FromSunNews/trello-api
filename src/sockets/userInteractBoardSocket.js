/**
 * 
 * @param {*} socket from socket library
 */


export const updatedBoardSocket = (socket) => {
  socket.on('c_user_updated_board', (updatedBoard) => {
    socket.broadcast.emit('s_user_updated_board', updatedBoard)
  })
}
