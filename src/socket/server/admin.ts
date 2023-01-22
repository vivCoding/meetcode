import { getRoom, updateRoom } from "@/firebase/queries"

import type { Server, Socket } from "socket.io"

export function startRoom(io: Server, socket: Socket) {
  return async () => {
    const roomCode = socket.data.roomCode
    const room = await getRoom(roomCode)
    if (room) {
      // fetch the first question from the question queue
      room.currentQuestion = room.questionQueue[0]
      room.questionQueue = room.questionQueue.slice(1)
      // set each room member to inProgress
      room.memberList.forEach((member) => {
        room.usersInProgress.push(member)
      })
      // kick all spectators from this room
      const clients = io.sockets.adapter.rooms.get(socket.data.roomCode)
      if (clients) {
        clients.forEach((clientId) => {
          const clientSocket = io.sockets.sockets.get(clientId)
          if (clientSocket && clientSocket.data.profile.username) {
            clients.forEach((clientId2) => {
              const clientSocket2 = io.sockets.sockets.get(clientId2)
              if (clientSocket2) {
                clientSocket2.leave(clientSocket.data.profile.username)
              }
            })
          }
        })
      }
      // set the room to running
      room.isRunning = true

      await updateRoom(roomCode, room)
    }
  }
}
