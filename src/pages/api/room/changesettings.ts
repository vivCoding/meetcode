import { getRoom, updateRoom } from "@/firebase/queries"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { roomCode, roomSettings, questionQueue } = req.body
    if (roomCode && roomSettings && questionQueue) {
      const room = await getRoom(roomCode)
      if (room) {
        room.roomSettings = roomSettings
        room.questionQueue = questionQueue
        await updateRoom(roomCode, room)
        return res.status(200)
      }
      return res.status(404)
    }
    return res.status(400)
  }
  res.status(405).json("bad")
}
