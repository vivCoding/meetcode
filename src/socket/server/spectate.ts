import { User } from "next-auth"
import { io } from "socket.io-client"

import { getRoom } from "@/firebase/queries"
import { getProfile } from "@/leetcode/user"

import type { UserProfile } from "./../../types/leetcode/user"
import type { RoomModelType } from "@/types/room"
import type { Server, Socket } from "socket.io"

export function spectateUser(io: Server, socket: Socket) {
  return async (spectated: string) => {
    const clients = io.sockets.adapter.rooms.get(socket.data.roomCode)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let spectatedSocket: any
    if (clients) {
      clients.forEach((clientId) => {
        const clientSocket = io.sockets.sockets.get(clientId)
        if (clientSocket) {
          if (clientSocket.data.profile.username === spectated) {
            spectatedSocket = clientSocket
            io.to(clientSocket.id).emit("onSpectateUser")
          }
        }
      })
    }
    socket.join(spectated)
    spectatedSocket.join(spectated)
  }
}

export function stopSpectatingUser(io: Server, socket: Socket) {
  return (spectated: string) => {
    socket.leave(spectated)
  }
}

export function updateCode(io: Server, socket: Socket) {
  return async (codeValue: string) => {
    const { roomCode } = socket.data
    io.to(roomCode).emit("onUpdateCode", codeValue)
  }
}
