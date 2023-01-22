import { User } from "next-auth"
import { io } from "socket.io-client"

import { getRoom } from "@/firebase/queries"
import { getProfile } from "@/leetcode/user"

import type { UserProfile } from "./../../types/leetcode/user"
import type { RoomModelType } from "@/types/room"
import type { Server, Socket } from "socket.io"

export function spectateUser(io: Server, socket: Socket) {
  return async (spectated: string) => {
    const spectator = (await socket.data.getProfile).username
    const clients = io.sockets.adapter.rooms.get(socket.data.roomCode)
    //to just emit the same event to all members of a room
    // io.to(socket.data.roomCode).emit("new event", "Updates")
    let spectatedSocket: any
    if (clients) {
      clients.forEach(async (clientId) => {
        const clientSocket = io.sockets.sockets.get(clientId)
        if (clientSocket) {
          if (clientSocket.data.getProfile.username === spectated) {
            spectatedSocket = clientSocket
            io.to(clientSocket.id).emit("request to spectate")
          }
        }
      })
    }
    socket.join(spectated)
    spectatedSocket.join(spectated)
  }
}
