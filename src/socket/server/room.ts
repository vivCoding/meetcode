import { getRoom, updateRoom } from "@/firebase/queries"

import type { UserProfile } from "@/types/leetcode/user"
import type { RoomModelType } from "@/types/room"
import type { Server, Socket } from "socket.io"
import type { DisconnectReason } from "socket.io/dist/socket"

export function joinRoom(io: Server, socket: Socket) {
  return async (
    roomCode: string,
    callback: (roomState?: RoomModelType) => void
  ) => {
    const { username, userAvatar } = socket.data.profile as UserProfile
    const room = await getRoom(roomCode)
    if (room) {
      socket.data.roomCode = roomCode
      room.memberList.push(username)
      room.leaderboard[username] = 0
      await updateRoom(roomCode, room)
      callback(room)
      io.to(roomCode).emit("newMember", username, userAvatar)
    } else {
      callback(undefined)
    }
  }
}

// export function sendMessage(io: Server, socket: Socket) {
//   return async (message: string) => {
//     const {
//       roomCode,
//       profile: { username, userAvatar },
//     } = socket.data
//     const timestamp = new Date().toUTCString()
//     console.log(username, "in", roomCode, "says", message)
//     await mongooseConnect()
//     await Room.updateOne(
//       { roomCode },
//       {
//         $push: {
//           messages: {
//             user: socket.data.profile,
//             message,
//             timestamp,
//           },
//         },
//       }
//     ).exec()
//     io.to(roomCode).emit("newMessage", username, userAvatar, message, timestamp)
//   }
// }

export function onDisconnect(io: Server, socket: Socket) {
  return (reason: DisconnectReason) => {
    const {
      roomCode,
      profile: { username, userAvatar },
    } = socket.data
    console.log("got disconnect from", username, "in", roomCode)
  }
}
