import { Button, Stack, Typography } from "@mui/joy"
import Link from "next/link"
import { useRouter } from "next/router"

import type { UserProfile } from "@/types/leetcode/user"

type NavbarProps = {
  profile: UserProfile
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        height: "10vh",
        backgroundColor: "#293a4c",
        pl: 4,
      }}
    >
      <Button variant="plain" sx={{ fontSize: "larger", color: "white" }}>
        Join
      </Button>
      <Button variant="plain" sx={{ fontSize: "larger", color: "white" }}>
        Create
      </Button>
    </Stack>
  )
}
