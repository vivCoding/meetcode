import { getTokenFromSocket } from "@/utils/socket"

import { joinRoom, onDisconnect, sendMessage } from "./room"
import { sendSubmissionStatus } from "./submit"

import type { UserProfile } from "@/types/leetcode/user"
import type { Server, Socket } from "socket.io"
import type { ExtendedError } from "socket.io/dist/namespace"

// eslint-disable-next-line no-unused-vars
export async function authMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  console.log("doin socket middleware and auth")
  const token = await getTokenFromSocket(socket)
  if (!token) {
    console.log("bad guy")
    next(new Error("bad auth"))
    return
  }
  console.log("yeap this guy good")
  next()
}

export function onConnection(io: Server) {
  return async (socket: Socket) => {
    console.log("got connection", socket.id)
    const token = await getTokenFromSocket(socket)
    if (token) {
      socket.data.profile = token.profile as UserProfile
      // register events
      socket.on("joinRoom", joinRoom(io, socket))
      socket.on("sendMessage", sendMessage(io, socket))
      socket.on("disconnect", onDisconnect(io, socket))
      socket.on("sendSubmissionStatus", sendSubmissionStatus(io, socket))
    }
  }
}
