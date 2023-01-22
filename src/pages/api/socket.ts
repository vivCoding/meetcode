import { createAdapter } from "@socket.io/postgres-adapter"
import { Pool } from "pg"
import { Server } from "socket.io"

import { authMiddleware, onConnection } from "@/socket/server"

import type { NextApiResponseWithSocket } from "@/types/socket"
import type { NextApiRequest } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (req.method === "POST") {
    if (res.socket.server.io) {
      console.log("Socket is already running.")
    } else {
      console.log("Socket is initializing")
      const io = new Server(res.socket.server)
      res.socket.server.io = io
      if (!process.env.POSTGRES_URL) {
        console.error("no postgres url setup!")
      } else {
        const pool = new Pool({
          user: process.env.POSTGRES_USER,
          host: process.env.POSTGRES_HOST,
          database: process.env.POSTGRES_DATABASE,
          password: process.env.POSTGRES_PASSWORD,
          port: process.env.POSTGRES_PORT,
          ssl: true,
        })
        pool.query(`
          CREATE TABLE IF NOT EXISTS socket_io_attachments (
              id          bigserial UNIQUE,
              created_at  timestamptz DEFAULT NOW(),
              payload     bytea
          );
        `)
        io.use(authMiddleware)
        io.adapter(createAdapter(pool))
        io.on("connection", onConnection(io))
      }
    }
    res.status(200).json("yippee")
  } else {
    res.status(405).json("boo hoo")
  }
}
