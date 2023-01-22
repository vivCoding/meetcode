import { randomBytes } from "crypto"

import initFirebase from "@/firebase/connect"

import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // TODO
    // await mongooseConnect()
    initFirebase()
    const roomCode = randomBytes(5).toString("hex")
    // generate random string and make sure it's unique in db
    // do {
    // eslint-disable-next-line no-var
    // var roomCode = randomBytes(5).toString("hex")
    // var found = await Room.findOne({ roomCode }).exec()
    // } while (!!found)
    // await Room.create({ roomCode, members: [], messages: [] })
    return res.status(200).json({ roomCode })
  }
  res.status(405).json("bad")
}
