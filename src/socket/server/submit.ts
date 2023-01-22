import { getRoom, updateRoom } from "@/firebase/queries"

import type { UserProfile } from "@/types/leetcode/user"
import type { Server, Socket } from "socket.io"

export function sendSubmissionStatus(io: Server, socket: Socket) {
  return async (roomCode: string) => {
    const { username, userAvatar } = socket.data.profile as UserProfile
    const room = await getRoom(roomCode)
    if (room) {
      socket.data.roomCode = roomCode
      room.leaderboard[username] += 3
      // remove this user from inProgress
      const idx = room.usersInProgress.indexOf(username, 0)
      if (idx > -1) {
        room.usersInProgress.splice(idx, 1)
      }
      // if no more inProgress users, stop running the room
      if (room.usersInProgress.length == 0) {
        room.isRunning = false
      }
      await updateRoom(roomCode, room)
      // tell other clients this user has finished
      io.to(roomCode).emit("memberFinished", username, userAvatar)
    }
  }
}
