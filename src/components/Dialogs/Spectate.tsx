import { ArrowForward, VisibilityOutlined } from "@mui/icons-material"
import {
  Divider,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from "@mui/joy"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"

import UserAvatar from "../UserAvatar"

import type { UserProfile } from "@/types/leetcode/user"

type PropsType = {
  currentUser: string
  usernames: string[]
  open: boolean
  onClose: (username?: string) => void
}

export default function SpectateDialog({
  currentUser,
  usernames,
  open,
  onClose,
}: PropsType) {
  const [users, setUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    const getProfiles = async () => {
      const profiles = []
      for (let i = 0; i < usernames.length; i++) {
        const res = await axios.get("/api/user", {
          params: { username: usernames[i] },
        })
        if (res.status === 200) {
          profiles.push(res.data.data)
        }
      }
      setUsers(profiles)
    }
    getProfiles()
  }, [usernames])

  const handleSpectate = (username: string) => {
    onClose(username)
  }

  return (
    <Modal open={open} onClose={() => onClose()}>
      <ModalDialog variant="soft">
        <ModalClose />
        <Typography level="inherit" component="h2" mb={1.5}>
          Spectate Member
        </Typography>
        <Divider />
        <List
          sx={{
            maxHeight: "65vh",
            overflow: "auto",
            minWidth: "30vw",
          }}
        >
          {users
            .sort((user, user2) =>
              user.username < user2.username
                ? -1
                : user.username === user2.username
                ? 0
                : 1
            )
            .filter((user) => user.username !== currentUser)
            .map((user) => (
              <ListItem
                key={user.username}
                onClick={() => handleSpectate(user.username)}
                sx={{
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
              >
                <ListItemDecorator sx={{ mr: 2 }}>
                  <UserAvatar
                    username={user.username}
                    userAvatar={user.userAvatar}
                  />
                </ListItemDecorator>
                <ListItemContent>{user.username}</ListItemContent>
                <VisibilityOutlined />
              </ListItem>
            ))}
        </List>
      </ModalDialog>
    </Modal>
  )
}
