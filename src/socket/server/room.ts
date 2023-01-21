import mongooseConnect from "@/database/connect"
import Room from "@/database/models/room"

import type { UserProfile } from "@/types/leetcode/user"
import type { Server, Socket } from "socket.io"
import type { DisconnectReason } from "socket.io/dist/socket"

export function joinRoom(io: Server, socket: Socket) {
  return async (roomCode: string, callback: (status: string) => void) => {
    // console.log("ok got", username, "in", roomCode)
    const { username, userAvatar } = socket.data.profile as UserProfile
    const timestamp = new Date().toUTCString()
    console.log("ok got", username, "in", roomCode)
    await mongooseConnect()
    const res = await Room.updateOne(
      { roomCode },
      {
        $push: {
          members: socket.data.profile,
          messages: {
            user: socket.data.profile,
            message: "<joined>",
            timestamp,
          },
        },
      }
    ).exec()
    if (res.matchedCount !== 0) {
      socket.data.roomCode = roomCode
      socket.join(roomCode)
      callback("ok")
      io.to(roomCode).emit(
        "newMessage",
        username,
        userAvatar,
        "<joined>",
        timestamp
      )
    } else {
      callback("bad")
      console.log("no room found!")
    }
  }
}

export function sendMessage(io: Server, socket: Socket) {
  return async (message: string) => {
    const {
      roomCode,
      profile: { username, userAvatar },
    } = socket.data
    const timestamp = new Date().toUTCString()
    console.log(username, "in", roomCode, "says", message)
    await mongooseConnect()
    await Room.updateOne(
      { roomCode },
      {
        $push: {
          messages: {
            user: socket.data.profile,
            message,
            timestamp,
          },
        },
      }
    ).exec()
    io.to(roomCode).emit("newMessage", username, userAvatar, message, timestamp)
  }
}

export function onDisconnect(io: Server, socket: Socket) {
  return async (reason: DisconnectReason) => {
    const {
      roomCode,
      profile: { username, userAvatar },
    } = socket.data
    const timestamp = new Date().toUTCString()
    await mongooseConnect()
    await Room.updateOne(
      { roomCode },
      {
        $push: {
          messages: {
            user: socket.data.profile,
            message: "<left>",
            timestamp,
          },
        },
        $pull: {
          members: { username },
        },
      }
    )
    io.to(roomCode).emit(
      "newMessage",
      username,
      userAvatar,
      "<left>",
      timestamp
    )
    console.log("got disconnect from", username, "in", roomCode)
  }
}
