import { Typography } from "@mui/joy"
import { getToken } from "next-auth/jwt"

import Navbar from "@/components/Navbar"

import type { UserProfile } from "@/types/leetcode/user"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"

type PropsType = {
  profile?: UserProfile
}

export default function JoinPage({
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!profile) return <>Loading...</>

  return (
    <>
      <Navbar profile={profile} />
      <Typography level="h1">Join Room</Typography>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PropsType> = async (
  context
) => {
  const token = await getToken({ req: context.req })
  if (token) {
    console.log("got lc", token.profile?.username)
    return {
      props: {
        profile: token.profile as UserProfile,
      },
    }
  }
  console.log("bruh", token)
  // never happens cuz of middleware
  return {
    props: {},
    redirect: {
      destination: "/signin",
    },
  }
}
