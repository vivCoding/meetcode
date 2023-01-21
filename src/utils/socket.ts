import { decode } from "next-auth/jwt"

import type { Socket } from "socket.io"

// https://stackoverflow.com/questions/5047346/converting-strings-like-document-cookie-to-objects lmao
export function cookieStrObj(str: string) {
  const strArr = str.split("; ")
  const result: Partial<{ [key: string]: string }> = {}
  for (let i = 0; i < strArr.length; i++) {
    const cur = strArr[i].split("=")
    result[cur[0]] = cur[1]
  }
  return result
}

export async function getTokenFromSocket(socket: Socket) {
  // manually decoding jwt from the cookie in socket request
  const cookie = socket.request.headers.cookie
  const secret = process.env.NEXTAUTH_SECRET // wouldn't ever be undefined if set properly
  if (!cookie || !secret) {
    console.log("mhm bad")
    return undefined
  }
  const cookieObj = cookieStrObj(cookie)
  const secureCookie =
    !!process.env.NEXTAUTH_URL &&
    process.env.NEXTAUTH_URL.startsWith("https://")
  const cookieName = secureCookie
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token"
  const token = await decode({ token: cookieObj[cookieName], secret })
  if (!token) {
    console.log("mhm bad 2")
    return undefined
  }
  return token
}
