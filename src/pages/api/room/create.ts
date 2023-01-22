import { randomBytes } from "crypto"

import { getToken } from "next-auth/jwt"

import { getRoom, updateRoom } from "@/firebase/queries"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const token = await getToken({ req })
    const { roomSettings } = req.body
    if (token && token.profile && roomSettings) {
      // generate random string and make sure it's unique in db
      let roomCode = randomBytes(4).toString("hex")
      let found = await getRoom(roomCode)
      while (!!found) {
        roomCode = randomBytes(4).toString("hex")
        found = await getRoom(roomCode)
      }
      // add room
      await updateRoom(roomCode, {
        roomSettings,
        memberList: [],
        leaderboard: {},
        admin: token.profile.username,
        usersInProgress: [],
        questionQueue: [],
        currentQuestion: undefined,
        isRunning: false,
      })

      return res.status(200).json({ roomCode })
    }
    return res.status(401)
  }
  res.status(405).json("bad")
}
