import { createAdapter } from "@socket.io/mongo-adapter"
import { MongoClient } from "mongodb"
import { Server } from "socket.io"

import mongooseConnect from "@/mongodb/connect"
import { authMiddleware, onConnection } from "@/socket/server"

import type { NextApiResponseWithSocket } from "@/types/socket"
import type { NextApiRequest } from "next"

const DB = "mydb"
const COLLECTION = "socket.io-adapter-events"

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

      if (!process.env.MONGODB_URL) {
        console.error("no mongodb url setup!")
      } else {
        await mongooseConnect()
        const mongoClient = new MongoClient(process.env.MONGODB_URL)
        await mongoClient.connect()
        try {
          await mongoClient.db(DB).createCollection(COLLECTION, {
            capped: true,
            size: 1e6,
          })
        } catch (e) {
          // collection already exists
        }
        const mongoCollection = mongoClient.db(DB).collection(COLLECTION)

        io.use(authMiddleware)
        io.adapter(createAdapter(mongoCollection))
        io.on("connection", onConnection(io))
      }
    }
    res.status(200).json("yippee")
  } else {
    res.status(405).json("boo hoo")
  }
}
