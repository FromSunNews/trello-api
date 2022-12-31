/**
 * 
 * @param {*} socket from socket library
 */


export const createdNewLabelSocket = (socket) => {
  socket.on('c_user_created_new_label', (newLabel) => {
    socket.broadcast.emit('s_user_created_new_label', newLabel)
  })
}
export const updatedLabelSocket = (socket) => {
  socket.on('c_user_updated_label', (updatedLabel) => {
    socket.broadcast.emit('s_user_updated_label', updatedLabel)
  })
}
export const updatedCheckBoxLabelSocket = (socket) => {
  socket.on('c_user_updated_check_box_label', (updatedLabel) => {
    socket.broadcast.emit('s_user_updated_check_box_label', updatedLabel)
  })
}
