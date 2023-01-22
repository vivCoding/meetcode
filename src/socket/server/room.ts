// import mongooseConnect from "@/database/connect"
// import Room from "@/database/models/room"

import type { UserProfile } from "@/types/leetcode/user"
import type { Server, Socket } from "socket.io"
import type { DisconnectReason } from "socket.io/dist/socket"

export function joinRoom(io: Server, socket: Socket) {
  return async (roomCode: string, callback: (status: string) => void) => {
    // console.log("ok got", username, "in", roomCode)
    const { username, userAvatar } = socket.data.profile as UserProfile
    console.log("cool got", username, "in", roomCode)
    socket.data.roomCode = roomCode
    callback("ok")
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
