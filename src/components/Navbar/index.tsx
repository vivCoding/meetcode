import { Button, Stack, Typography } from "@mui/joy"
import Link from "next/link"
import { useRouter } from "next/router"

import UserAvatar from "../UserAvatar"

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
      sx={{
        height: "10vh",
        backgroundColor: "#293a4c",
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Link href="/room/join" style={{ textDecoration: "none" }}>
          <Button variant="plain" sx={{ fontSize: "large", color: "white" }}>
            Join
          </Button>
        </Link>
        <Link href="/room/create" style={{ textDecoration: "none" }}>
          <Button variant="plain" sx={{ fontSize: "large", color: "white" }}>
            Create
          </Button>
        </Link>
      </Stack>
      <UserAvatar
        username={profile.username}
        userAvatar={profile.userAvatar}
        // size="lg"
        sx={{
          ml: "auto",
          "&:hover": {
            cursor: "pointer",
          },
        }}
      />
    </Stack>
  )
}
