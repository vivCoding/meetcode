import { deleteRoom, getRoom, updateRoom } from "@/firebase/queries"

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

export function sendMessage(io: Server, socket: Socket) {
  return async (message: string) => {
    const {
      roomCode,
      profile: { username, userAvatar },
    } = socket.data
    io.to(roomCode).emit("newMessage", username, userAvatar, message)
  }
}

export function onDisconnect(io: Server, socket: Socket) {
  return async (reason: DisconnectReason) => {
    const {
      roomCode,
      profile: { username, userAvatar },
    } = socket.data
    const room = await getRoom(roomCode)
    if (room) {
      room.memberList = room.memberList.filter((member) => member !== username)
      if (room.memberList.length === 0) {
        await deleteRoom(roomCode)
      }
      console.log("got disconnect from", username, "in", roomCode)
      io.to(roomCode).emit("memberLeft", username, userAvatar)
    }
  }
}
