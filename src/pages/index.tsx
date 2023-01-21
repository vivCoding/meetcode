import { Button, Stack, Typography } from "@mui/joy"
import Link from "next/link"
import { useRouter } from "next/router"

import Helment from "@/components/Helmet"

export default function Home() {
  return (
    <>
      <Helment title="Ternary Search" />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundImage: "url('landing.png')",
          backgroundBlendMode: "darken",
          backgroundRepeat: "no-repeat",
          filter: "brightness(60%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          textAlign: "center",
        }}
      >
        <Typography level="display1" sx={{ mb: 2 }}>
          Ternary Search
        </Typography>
        <Typography level="h4">
          Collaborate and compete on LeetCode problems together
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
          <Link href="/room/join">
            <Button variant="solid">Join Room</Button>
          </Link>
          <Link href="/login">
            <Button variant="solid">Login</Button>
          </Link>
        </Stack>
      </div>
    </>
  )
}
