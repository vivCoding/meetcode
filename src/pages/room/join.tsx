import {
  Button,
  Container,
  Sheet,
  Stack,
  TextField,
  Typography,
} from "@mui/joy"
import { useRouter } from "next/router"
import { getToken } from "next-auth/jwt"
import { useState } from "react"

import Navbar from "@/components/Navbar"

import type { UserProfile } from "@/types/leetcode/user"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"

type PropsType = {
  profile?: UserProfile
}

export default function JoinPage({
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState("")

  if (!profile) return <>Loading...</>

  return (
    <>
      <Navbar profile={profile} />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          textAlign: "center",
        }}
      >
        <Sheet
          variant="outlined"
          sx={{ p: 5, backgroundColor: "#2b3e54", borderRadius: 10 }}
        >
          <Typography level="h1" sx={{ mb: 5 }}>
            Join Room
          </Typography>
          <form onSubmit={(e) => e.preventDefault()}>
            <Stack
              direction={"row"}
              spacing={2}
              marginBottom={2}
              alignItems="flex-end"
              justifyContent="center"
              mt={2}
            >
              <TextField
                variant="soft"
                // label="Join room code"
                placeholder="Enter room code"
                // size="sm"
                onChange={(e) => setJoinCode(e.target.value)}
                // defaultValue={roomCode}
              />
              <Button
                type="submit"
                variant="solid"
                disabled={!joinCode}
                onClick={() => router.push(`/room/${joinCode}`)}
              >
                Join room
              </Button>
            </Stack>
          </form>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
            mt={3}
          >
            <Typography>or</Typography>
            <Button variant="soft" onClick={() => router.push("/room/create")}>
              Create Room
            </Button>
          </Stack>
        </Sheet>
      </div>
      {/* <Container sx={{ textAlign: "center", mt: 4 }}> */}
      {/* </Container> */}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PropsType> = async (
  context
) => {
  // TODO change
  // const token = await getToken({ req: context.req })
  const token = true
  if (token) {
    // console.log("got lc", (token.profile as any).username)
    return {
      props: {
        // profile: token.profile as UserProfile,
        profile: {
          username: "vvvu",
          userAvatar:
            "https://assets.leetcode.com/users/avatars/avatar_1648876515.png",
        },
      },
    }
  }
  console.log("bruh", token)
  // never happens cuz of middleware
  return {
    props: {},
    redirect: {
      destination: "/login",
    },
  }
}
