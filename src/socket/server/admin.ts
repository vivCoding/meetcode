import { getRoom, updateRoom } from "@/firebase/queries"
import { pickRandomQuestion } from "@/leetcode/pick"

import type { RoomModelType } from "@/types/room"
import type { Server, Socket } from "socket.io"

export function startRoom(io: Server, socket: Socket) {
  return async (callback: (roomState?: RoomModelType) => void) => {
    const roomCode = socket.data.roomCode
    const { username, userAvatar } = socket.data.profile
    const room = await getRoom(roomCode)
    if (room) {
      if (room.questionQueue.length > 0) {
        // fetch the first question from the question queue
        room.currentQuestion = room.questionQueue.shift() ?? ""
      } else {
        const res = await pickRandomQuestion(
          room.roomSettings.problemDifficulty,
          room.roomSettings.problemTags,
          room.roomSettings.problemListTag
        )
        if (res) {
          room.currentQuestion = res.titleSlug
        } else {
          room.currentQuestion = ""
        }
      }
      // set each room member to inProgress
      room.memberList.forEach((member) => {
        room.usersInProgress.push(member)
      })
      // set the room to running
      room.isRunning = true
      await updateRoom(roomCode, room)

      // kick all spectators out of spectating rooms
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
      callback(room)
      io.to(roomCode).emit("roomStarted", room)
      io.to(roomCode).emit(
        "newMessage",
        username,
        userAvatar,
        "started the round!"
      )
    } else {
      callback(undefined)
    }
  }
}
