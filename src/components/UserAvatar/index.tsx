import { Avatar, Button, ListItemContent, Menu, MenuItem } from "@mui/joy"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useState } from "react"

import { DEFAULT_PIC } from "@/constants/misc"

import type { AvatarProps } from "@mui/joy"

type PropsType = AvatarProps & {
  username: string
  userAvatar: string
}

export default function UserAvatar({
  username,
  userAvatar,
  ...other
}: PropsType) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const openMenu = Boolean(anchorEl)

  const handleLogout = () => {
    signOut()
  }

  return (
    <>
      {userAvatar === DEFAULT_PIC ? (
        <Avatar {...other} onClick={(e) => setAnchorEl(e.currentTarget)}>
          {username.toUpperCase().substring(0, 2)}
        </Avatar>
      ) : (
        <Avatar
          src={userAvatar}
          {...other}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          {username.toUpperCase().substring(0, 2)}
        </Avatar>
      )}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={() => setAnchorEl(null)}
        placement="bottom-end"
      >
        <MenuItem>
          <ListItemContent>
            <Link
              href={`https://leetcode.com/${username}/`}
              target="_blank"
              style={{ color: "white", textDecoration: "none" }}
            >
              View Profile
            </Link>
          </ListItemContent>
        </MenuItem>
        <MenuItem>
          <ListItemContent>
            <Button color="danger" onClick={handleLogout}>
              Logout
            </Button>
          </ListItemContent>
        </MenuItem>
      </Menu>
    </>
  )
}
