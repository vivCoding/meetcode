import type { Server as HTTPServer } from "http"
import type { Socket as NetSocket } from "net"
import type { NextApiResponse } from "next"
import type { Server as IOServer } from "socket.io"

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}
