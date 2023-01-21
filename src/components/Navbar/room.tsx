import {
  ArrowBack,
  Flag,
  Leaderboard,
  People,
  PlayArrow,
  Settings,
  Stop,
} from "@mui/icons-material"
import { Badge, Button, IconButton, Stack, Typography } from "@mui/joy"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"

import ConfirmationDialog from "../Dialogs/Confirmation"
import LeaderboardDialog from "../Dialogs/Leaderboard"
import PeopleDialog from "../Dialogs/People"
import SettingsDialog from "../Dialogs/Settings"
import UserAvatar from "../UserAvatar"

import type { UserProfile } from "@/types/leetcode/user"
import type { Room } from "@/types/room"

type NavbarProps = {
  profile: UserProfile
  roomCode: string
}

export default function RoomNavbar({ roomCode, profile }: NavbarProps) {
  const router = useRouter()

  const [openConfirmLeave, setOpenConfirmLeave] = useState(false)
  const [openConfirmGiveUp, setOpenConfirmGiveUp] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openPeople, setOpenPeople] = useState(false)
  const [openLeaderboard, setOpenLeaderboard] = useState(false)

  const [members, setMembers] = useState<string[]>([
    "frankieray12345",
    "jviv2061",
    "vvvu",
  ])

  const [leaderboard, setLeaderboard] = useState([
    {
      username: "frankieray12345",
      points: 123,
    },
    {
      username: "jviv2061",
      points: 12,
    },
    {
      username: "vvvu",
      points: 425,
    },
  ])

  const handleLeave = (confirm: boolean) => {
    if (confirm) {
      router.push("/room/join")
    }
    setOpenConfirmLeave(false)
  }

  const handleGiveUp = (confirm: boolean) => {
    if (confirm) {
      // router.push("/room/join")
    }
    setOpenConfirmGiveUp(false)
  }

  const handleChangeSettings = (changed: boolean, newSettings?: Room) => {
    setOpenSettings(false)
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={2}
      sx={{
        height: "8vh",
        backgroundColor: "#293a4c",
        paddingLeft: 4,
        paddingRight: 4,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ mr: "auto" }}
      >
        <Button
          variant="plain"
          color="danger"
          size="sm"
          startDecorator={<ArrowBack />}
          onClick={() => setOpenConfirmLeave(true)}
        >
          Leave Room
        </Button>
        <Typography>
          Room: <strong>{roomCode}</strong>
        </Typography>
      </Stack>

      <Button size="sm" color="success" startDecorator={<PlayArrow />}>
        Start
      </Button>
      {/* <Button size="sm" color="danger" startDecorator={<Stop />}>
        Stop
      </Button> */}
      <Typography sx={{ textAlign: "center" }}>
        Time Remaining: 00:00:00
      </Typography>
      <Typography fontStyle="italic">Waiting for others...</Typography>
      <IconButton
        variant="plain"
        sx={{ color: "white" }}
        onClick={() => setOpenConfirmGiveUp(true)}
      >
        <Flag />
      </IconButton>
      <IconButton
        variant="plain"
        sx={{ ml: "auto", color: "white" }}
        onClick={() => setOpenSettings(true)}
      >
        <Settings />
      </IconButton>
      <IconButton
        variant="plain"
        sx={{ color: "white" }}
        onClick={() => setOpenPeople(true)}
      >
        <Badge badgeContent={members.length} size="sm">
          <People />
        </Badge>
      </IconButton>
      <IconButton
        variant="plain"
        sx={{ color: "white" }}
        onClick={() => setOpenLeaderboard(true)}
      >
        <Leaderboard />
      </IconButton>
      <UserAvatar
        username={profile.username}
        userAvatar={profile.userAvatar}
        size="sm"
        sx={{
          ml: 1,
          "&:hover": {
            cursor: "pointer",
          },
        }}
      />
      <ConfirmationDialog
        title="Leave Room"
        value="Are you sure you want to leave room?"
        open={openConfirmLeave}
        onClose={handleLeave}
      />
      <ConfirmationDialog
        title="Give Up"
        value="Are you sure you want to give up this round?"
        open={openConfirmGiveUp}
        onClose={handleGiveUp}
      />
      <SettingsDialog open={openSettings} onClose={handleChangeSettings} />
      <PeopleDialog
        open={openPeople}
        onClose={() => setOpenPeople(false)}
        usernames={members}
      />
      <LeaderboardDialog
        currentUser={profile.username}
        users={leaderboard}
        open={openLeaderboard}
        onClose={() => setOpenLeaderboard(false)}
      />
    </Stack>
  )
}
