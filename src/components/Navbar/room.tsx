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
import { useMemo, useState } from "react"

import ConfirmationDialog from "../Dialogs/Confirmation"
import LeaderboardDialog from "../Dialogs/Leaderboard"
import PeopleDialog from "../Dialogs/People"
import SettingsDialog from "../Dialogs/Settings"
import UserAvatar from "../UserAvatar"

import type { UserProfile } from "@/types/leetcode/user"
import type { RoomModelType } from "@/types/room"

type NavbarProps = {
  profile: UserProfile
  roomCode: string
  roomState: RoomModelType
  onStartRoom: () => void
  onGiveUp: () => void
}

export default function RoomNavbar({
  roomCode,
  profile,
  roomState,
  onGiveUp,
  onStartRoom,
}: NavbarProps) {
  const router = useRouter()

  const [openConfirmLeave, setOpenConfirmLeave] = useState(false)
  const [openConfirmGiveUp, setOpenConfirmGiveUp] = useState(false)
  const [openSettings, setOpenSettings] = useState(false)
  const [openPeople, setOpenPeople] = useState(false)
  const [openLeaderboard, setOpenLeaderboard] = useState(false)

  const handleLeave = (confirm: boolean) => {
    if (confirm) {
      router.push("/room/join")
    }
    setOpenConfirmLeave(false)
  }

  const handleGiveUp = (confirm: boolean) => {
    if (confirm) {
      onGiveUp()
    }
    setOpenConfirmGiveUp(false)
  }

  const handleChangeSettings = () => {
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

      {roomState.admin === profile.username && !roomState.isRunning && (
        <Button
          size="sm"
          color="success"
          startDecorator={<PlayArrow />}
          onClick={onStartRoom}
        >
          Start
        </Button>
      )}
      <Typography sx={{ textAlign: "center" }}>
        {roomState.usersInProgress.includes(profile.username)
          ? "Working on problem"
          : roomState.usersInProgress.length > 0
          ? "Waiting for others..."
          : "Everyone ready!"}
      </Typography>
      <IconButton
        variant="plain"
        sx={{ ml: "auto", color: "white" }}
        onClick={() => setOpenConfirmGiveUp(true)}
        disabled={!roomState.isRunning}
      >
        <Flag />
      </IconButton>
      {roomState.admin === profile.username && !roomState.isRunning && (
        <IconButton
          variant="plain"
          sx={{ color: "white" }}
          onClick={() => setOpenSettings(true)}
        >
          <Settings />
        </IconButton>
      )}
      <IconButton
        variant="plain"
        sx={{
          color: "white",
        }}
        onClick={() => setOpenPeople(true)}
      >
        <Badge badgeContent={roomState.memberList.length} size="sm">
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
      <SettingsDialog
        roomState={roomState}
        roomCode={roomCode}
        open={openSettings}
        onClose={() => setOpenSettings(false)}
      />
      <PeopleDialog
        open={openPeople}
        onClose={() => setOpenPeople(false)}
        usernames={roomState.memberList}
      />
      <LeaderboardDialog
        currentUser={profile.username}
        users={roomState.leaderboard}
        open={openLeaderboard}
        onClose={() => setOpenLeaderboard(false)}
      />
    </Stack>
  )
}
