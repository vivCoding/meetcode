import { ArrowForward } from "@mui/icons-material"
import {
  Divider,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"

import UserAvatar from "../UserAvatar"

import type { UserProfile } from "@/types/leetcode/user"

type PropsType = {
  users: Record<string, number>
  currentUser: string
  open: boolean
  onClose: () => void
}

export default function LeaderboardDialog({
  currentUser,
  users,
  open,
  onClose,
}: PropsType) {
  const [profiles, setProfiles] = useState<
    { user: UserProfile; points: number }[]
  >([])

  useEffect(() => {
    const getProfiles = async () => {
      console.log("got2", users)
      const profiles = []
      const usernames = Object.keys(users)
      console.log(usernames)
      for (let i = 0; i < usernames.length; i++) {
        // console.log("got", i, usernames[i])
        const res = await axios.get("/api/user", {
          params: { username: usernames[i] },
        })
        // console.log("got", i, usernames[i], res.status)
        if (res.status === 200 || res.status === 304) {
          profiles.push({ user: res.data.data, points: users[usernames[i]] })
        }
      }
      console.log("got3", profiles)
      setProfiles(profiles)
    }
    getProfiles()
  }, [users])

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="soft">
        <ModalClose />
        <Typography level="inherit" component="h2" mb={1.5}>
          Leaderboard
        </Typography>
        <Divider />
        <List
          sx={{
            maxHeight: "65vh",
            overflow: "auto",
            minWidth: "40vw",
          }}
        >
          {profiles
            .sort((user, user2) => user2.points - user.points)
            .map((user, idx) => (
              <Link
                href={`https://leetcode.com/${user.user.username}`}
                style={{ textDecoration: "none" }}
                key={user.user.username}
                target="_blank"
              >
                <ListItem
                  sx={
                    currentUser === user.user.username
                      ? { backgroundColor: "primary.solidBg" }
                      : {}
                  }
                >
                  <ListItemDecorator sx={{ fontWeight: "bold" }}>
                    {idx + 1}
                  </ListItemDecorator>
                  <ListItemDecorator sx={{ mr: 2 }}>
                    <UserAvatar
                      username={user.user.username}
                      userAvatar={user.user.userAvatar}
                    />
                  </ListItemDecorator>
                  <ListItemContent>
                    <Stack direction="row">
                      {user.user.username}
                      <Typography sx={{ ml: "auto", mr: 4 }}>
                        {user.points}
                      </Typography>
                    </Stack>
                  </ListItemContent>
                  <ArrowForward />
                </ListItem>
              </Link>
            ))}
        </List>
      </ModalDialog>
    </Modal>
  )
}
