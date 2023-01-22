import { getRoom, updateRoom } from "@/firebase/queries"

import type { UserProfile } from "@/types/leetcode/user"
import type { RoomModelType } from "@/types/room"
import type { Server, Socket } from "socket.io"

export function sendSubmissionStatus(io: Server, socket: Socket) {
  return async (callback: (roomState?: RoomModelType) => void) => {
    const { username, userAvatar } = socket.data.profile as UserProfile
    const { roomCode } = socket.data
    const room = await getRoom(roomCode)
    if (room) {
      socket.data.roomCode = roomCode
      // remove this user from inProgress
      if (room.usersInProgress.includes(username)) {
        room.leaderboard[username] += 3
        room.usersInProgress = room.usersInProgress.filter(
          (user) => user !== username
        )
        // if no more inProgress users, stop running the room and set the current question to undefined
        // tell other clients this user has finished
        io.to(roomCode).emit("memberFinished", username, userAvatar, room)
        // if no more inProgress users, stop running the room
        if (room.usersInProgress.length == 0) {
          room.isRunning = false
          io.to(roomCode).emit("allMembersFinished", username, userAvatar)
        }
        await updateRoom(roomCode, room)
      }
      callback(room)
    } else {
      callback(undefined)
    }
  }
}
