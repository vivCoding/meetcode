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
  Typography,
} from "@mui/joy"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"

import UserAvatar from "../UserAvatar"

import type { UserProfile } from "@/types/leetcode/user"

type PropsType = {
  usernames: string[]
  open: boolean
  onClose: () => void
}

export default function PeopleDialog({ usernames, open, onClose }: PropsType) {
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

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="soft">
        <ModalClose />
        <Typography level="inherit" component="h2" mb={1.5}>
          All Members
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
            .map((user) => (
              <Link
                href={`https://leetcode.com/${user.username}`}
                style={{ textDecoration: "none" }}
                key={user.username}
                target="_blank"
              >
                <ListItem>
                  <ListItemDecorator sx={{ mr: 2 }}>
                    <UserAvatar
                      username={user.username}
                      userAvatar={user.userAvatar}
                    />
                  </ListItemDecorator>
                  <ListItemContent>{user.username}</ListItemContent>
                  <ArrowForward sx={{ ml: "auto" }} />
                </ListItem>
              </Link>
            ))}
        </List>
      </ModalDialog>
    </Modal>
  )
}
