/**
 * 
 * @param {*} socket from socket library
 */


export const updateCardSocket = (socket) => {
  socket.on('c_user_updated_card_to_board', (updatedCard) => {
    socket.broadcast.emit('s_user_updated_card_to_board', updatedCard)
  })
}
