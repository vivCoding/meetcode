import axios from "axios"

import type { UserProfile } from "@/types/leetcode/user"

export async function getCurrentUser(
  csrf: string,
  lcSession: string
): Promise<UserProfile | undefined> {
  // const payload = lcSession.substring(lcSession.indexOf(".") + 1, lcSession.lastIndexOf("."))
  // const dataStr = Buffer.from(payload, "base64").toString("utf-8")
  // const data = JSON.parse(dataStr)
  // if (!data || !data.username || !data.avatar) {
  //   return undefined
  // }
  // return {
  //   username: data.username,
  //   userAvator: data.avatar
  // }
  const res = await axios.post(
    "https://leetcode.com/graphql/",
    {
      query: `
      query globalData {
        userStatus {
          username
          realName
          avatar
        }
      }
    `,
    },
    {
      headers: {
        Referer: "https://leetcode.com/",
        "x-csrftoken": csrf,
        Cookie: `csrftoken=${csrf}; LEETCODE_SESSION=${lcSession}`,
      },
    }
  )

  if (res.status !== 200) {
    console.error("lc bad getCurrentUser", res.status)
    return undefined
  }

  const profile = res.data.data.userStatus
  profile.userAvatar = profile.avatar
  delete profile.avatar

  // NOTE should update cookies but idc rn, still works
  // console.log("gotc", res.headers["set-cookie"])
  // res.headers["set-cookie"]

  return profile
}

export async function getProfile(
  username: string
): Promise<UserProfile | undefined> {
  const res = await axios.post("https://leetcode.com/graphql/", {
    query: `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
            username
            profile {
                ranking
                userAvatar
                realName
                aboutMe
            }
        }
      }
    `,
    variables: { username },
  })

  if (res.status !== 200) {
    console.error("lc bad getProfile", res.status)
    return undefined
  }

  try {
    const profile = res.data.data.matchedUser.profile
    profile.username = username
    return profile
  } catch (e) {
    return undefined
  }
}
