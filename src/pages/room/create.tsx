import { Check } from "@mui/icons-material"
import {
  Button,
  Chip,
  Container,
  Grid,
  Radio,
  RadioGroup,
  Sheet,
  Stack,
  TextField,
  Typography,
  styled,
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

const MODES = ["Casual", "Competitive"]

export default function CreatePage({
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const [mode, setMode] = useState(MODES[0])

  if (!profile) return <>Loading...</>

  return (
    <>
      <Navbar profile={profile} />
      <Stack
        alignItems="center"
        sx={{
          marginTop: 5,
          textAlign: "center",
        }}
      >
        <Sheet
          variant="outlined"
          sx={{ p: 5, pb: 3, backgroundColor: "#2b3e54", borderRadius: 10 }}
        >
          <Typography level="h1" sx={{ mb: 5 }}>
            Create Room
          </Typography>
          <div style={{ textAlign: "left" }}>
            <Stack direction="row" alignItems="center">
              <Typography level="h5" sx={{ mr: 10 }}>
                Mode
              </Typography>
              <RadioGroup row sx={{ ml: "auto", flexWrap: "wrap", gap: 1 }}>
                {MODES.map((name) => {
                  const checked = mode === name
                  return (
                    <Chip
                      key={name}
                      variant={checked ? "soft" : "plain"}
                      color={checked ? "primary" : "neutral"}
                      startDecorator={
                        checked && (
                          <Check sx={{ zIndex: 1, pointerEvents: "none" }} />
                        )
                      }
                      sx={{ textAlign: "left" }}
                    >
                      <Radio
                        variant="outlined"
                        color={checked ? "primary" : "neutral"}
                        disableIcon
                        overlay
                        label={name}
                        value={name}
                        checked={checked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setMode(name)
                          }
                        }}
                      />
                    </Chip>
                  )
                })}
              </RadioGroup>
            </Stack>
            <Typography level="h3">Problem Type</Typography>
            <Stack direction="row" alignItems="center">
              <Typography level="h5" sx={{ mr: 10 }}>
                Difficulty
              </Typography>
              <RadioGroup row sx={{ ml: "auto", flexWrap: "wrap", gap: 1 }}>
                {MODES.map((name) => {
                  const checked = mode === name
                  return (
                    <Chip
                      key={name}
                      variant={checked ? "soft" : "plain"}
                      color={checked ? "primary" : "neutral"}
                      startDecorator={
                        checked && (
                          <Check sx={{ zIndex: 1, pointerEvents: "none" }} />
                        )
                      }
                      sx={{ textAlign: "left" }}
                    >
                      <Radio
                        variant="outlined"
                        color={checked ? "primary" : "neutral"}
                        disableIcon
                        overlay
                        label={name}
                        value={name}
                        checked={checked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setMode(name)
                          }
                        }}
                      />
                    </Chip>
                  )
                })}
              </RadioGroup>
            </Stack>
          </div>
          <Button onClick={() => router.push("/room/create")} sx={{ mt: 5 }}>
            Create
          </Button>
        </Sheet>
      </Stack>
      {/* <Container sx={{ textAlign: "center", mt: 4 }}> */}
      {/* </Container> */}
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
