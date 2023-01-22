import { getRoom, updateRoom } from "@/firebase/queries"

import type { UserProfile } from "@/types/leetcode/user"
import type { Server, Socket } from "socket.io"

export function sendSurrenderStatus(io: Server, socket: Socket) {
  return async (roomCode: string) => {
    const { username, userAvatar } = socket.data.profile as UserProfile
    const room = await getRoom(roomCode)
    if (room) {
      socket.data.roomCode = roomCode
      // remove this user from inProgress
      const idx = room.usersInProgress.indexOf(username, 0)
      if (idx > -1) {
        room.usersInProgress.splice(idx, 1)
      }
      // tell other clients this user has finished
      io.to(roomCode).emit("memberSurrendered", username, userAvatar)
      // if no more inProgress users, stop running the room
      if (room.usersInProgress.length == 0) {
        room.isRunning = false
        io.to(roomCode).emit("all members have finished", username, userAvatar)
      }
      await updateRoom(roomCode, room)
    }
  }
}