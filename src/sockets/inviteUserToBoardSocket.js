/**
 * 
 * @param {*} socket from socket library
 */
export const inviteUserToBoardSocket = (socket) => {
  socket.on('c_user_invited_to_board', (invitation) => {
    // Emit ngược lại một sự kiện có tên là "s_user_invited_to_board" về cho mọi client khác 
    // (ngoại trừ chính thằng user gửi lên)
    socket.broadcast.emit('s_user_invited_to_board', invitation)
  })
}
export const userAcceptedInvitationToBoardSocket = (socket) => {
  socket.on('c_user_accepted_invitation_to_board', (invitation) => {
    socket.broadcast.emit('s_user_accepted_invitation_to_board', invitation)
  })
}
