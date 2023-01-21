import {
  ArrowDownward,
  CloseRounded,
  InfoOutlined,
  KeyboardTabSharp,
  SendOutlined,
} from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  Container,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Menu,
  MenuItem,
  MenuList,
  Sheet,
  Stack,
  TextField,
  Typography,
} from "@mui/joy"
import axios from "axios"
// import { EmojiConvertor } from "emoji-js"
import fuzzysort from "fuzzysort"
import { useRouter } from "next/router"
import { getToken } from "next-auth/jwt"
import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { io } from "socket.io-client"

import Helment from "@/components/Helmet"
import UserAvatar from "@/components/UserAvatar"
import EMOJIS from "@/constants/emojis.json"
import TOAST_CONFIG from "@/constants/toastconfig"

import { ChatContext } from "@/contexts/chat"
import ChatLayout from "@/layouts/chat"

import type { NextPageWithLayout } from "../_app"
import type { UserProfile } from "@/types/leetcode/user"
import type { MessageType } from "@/types/room"
import type { GetServerSideProps } from "next"
import type { ChangeEventHandler, ReactElement } from "react"
import type { Socket } from "socket.io-client"
// import type { MenuProps } from "@mui/joy"

type PropsType = {
  profile?: UserProfile
}

const MESSAGE_LENGTH_LIMIT = 100
const EMOJI_DICT = EMOJIS as Record<string, string>
const EMOJI_KEYS = Object.keys(EMOJIS)
const SPECIAL_KEYS = ["Tab", "ArrowDown", "ArrowUp"]

// const NUM_MESSAGES_LIMIT = 150

function replaceEmojis(s: string): string {
  let idx = s.indexOf(":")
  while (idx != -1) {
    const nextIdx = s.indexOf(":", idx + 1)
    if (nextIdx != -1) {
      const substr = s.substring(idx + 1, nextIdx)
      if (substr in EMOJI_DICT) {
        s = s.substring(0, idx) + EMOJI_DICT[substr] + s.substring(nextIdx + 1)
      }
    }
    idx = s.indexOf(":", idx + 1)
  }
  return s
}

const RoomPage: NextPageWithLayout = ({ profile }: PropsType) => {
  const router = useRouter()
  const roomCode = (router.query?.roomCode as string) ?? ""
  const { setRoomCode } = useContext(ChatContext)
  const [canSend, setCanSend] = useState(false)
  const [messageLength, setMessageLength] = useState(0) // only updated for the warning
  const [messages, setMessages] = useState([] as MessageType[])
  const sio = useRef<Socket | undefined>(undefined)
  const [alertNew, setAlertNew] = useState(false)

  const messagesSheet = useRef<HTMLElement | null>(null)
  const endOfMessagesDiv = useRef<HTMLDivElement>(null)
  const messageTextfield = useRef<HTMLInputElement | null>(null)

  const [emojiHints, setEmojiHints] = useState<string[]>([])
  const [currentHint, setCurrentHint] = useState(0)

  useLayoutEffect(() => {
    // joy ui does not fully support input ref/refs on some stuff yet
    messagesSheet.current = document.getElementById("messagesSheet")
    messageTextfield.current = document.getElementById(
      "messageTextfield"
    ) as HTMLInputElement
    messageTextfield.current.onclick = () => checkMessage()
    messageTextfield.current.onkeydown = (e) => {
      if (SPECIAL_KEYS.includes(e.code)) {
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (messageTextfield.current) {
      // have to update this often for some reason
      messageTextfield.current.onkeyup = (e) => emojiHintMenu(e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emojiHints, currentHint])

  const emojiHintMenu = (e: KeyboardEvent) => {
    if (emojiHints.length > 0) {
      const currentHintElement = document.getElementById("currentHint")
      if (currentHintElement) {
        switch (e.code) {
          case "Tab":
            completeEmoji(emojiHints[currentHint])
            break
          case "ArrowDown":
            if (currentHint === emojiHints.length - 1) {
              setCurrentHint(0)
              currentHintElement.parentElement?.firstElementChild?.scrollIntoView(
                { behavior: "smooth" }
              )
            } else {
              setCurrentHint((prev) => prev + 1)
              currentHintElement.nextElementSibling?.scrollIntoView({
                behavior: "smooth",
              })
            }
            break
          case "ArrowUp":
            if (currentHint === 0) {
              setCurrentHint(emojiHints.length - 1)
              currentHintElement.parentElement?.lastElementChild?.scrollIntoView(
                { behavior: "smooth" }
              )
            } else {
              setCurrentHint((prev) => prev - 1)
              currentHintElement.previousElementSibling?.scrollIntoView({
                behavior: "smooth",
              })
            }
            break
          default:
            checkMessage()
            break
        }
      } else {
        checkMessage()
      }
    } else {
      checkMessage()
    }
  }

  const completeEmoji = (emoji: string) => {
    if (messageTextfield.current && emojiHints.length > 0) {
      const cursorPos = messageTextfield.current.selectionStart ?? 0
      const idx = messageTextfield.current.value.lastIndexOf(":", cursorPos)
      if (idx != -1) {
        messageTextfield.current.value =
          messageTextfield.current.value.substring(0, idx) +
          EMOJI_DICT[emoji] +
          messageTextfield.current.value.substring(cursorPos)
        messageTextfield.current.setSelectionRange(idx + 2, idx + 2)
        setEmojiHints([])
      }
    }
  }

  const checkMessage = () => {
    if (messageTextfield.current) {
      const cursorPos = messageTextfield.current.selectionStart ?? 0
      // check if emoji query
      // only check up to cursor pos
      const currVal = messageTextfield.current.value.substring(0, cursorPos)
      const idx = currVal.lastIndexOf(":")
      if (idx != -1 && !currVal.substring(idx + 1, cursorPos).includes(" ")) {
        const emojiQuery = currVal.substring(idx + 1, cursorPos)
        // console.log(emojiQuery)
        if (emojiQuery) {
          const results = fuzzysort
            .go(emojiQuery, EMOJI_KEYS, { limit: 20, threshold: -10000 })
            .map((res) => res.target)
          setEmojiHints(results)
          setCurrentHint(0)
        } else {
          setEmojiHints([])
        }
        // replace emojis
        const emojiFixed = replaceEmojis(currVal)
        messageTextfield.current.value =
          emojiFixed + messageTextfield.current.value.substring(cursorPos)
        messageTextfield.current.setSelectionRange(
          emojiFixed.length,
          emojiFixed.length
        )
      } else {
        setEmojiHints([])
      }
      // updating state abt message length
      if (
        MESSAGE_LENGTH_LIMIT - messageTextfield.current.value.length <= 10 ||
        messageTextfield.current.value.length > MESSAGE_LENGTH_LIMIT
      ) {
        setMessageLength(messageTextfield.current.value.length)
      } else if (messageTextfield.current.value.length === 0) {
        setMessageLength(0)
      } else if (messageLength !== 1) {
        setMessageLength(1)
      }
    }
  }

  useEffect(() => {
    setRoomCode(roomCode)
    console.log("in", roomCode)
  }, [setRoomCode, roomCode])

  useEffect(() => {
    if (canSend) {
      axios
        .get("/api/room/getmessages", {
          params: {
            roomCode,
          },
        })
        .then((res) => {
          if (res.status === 200 && res.data.messages) {
            setMessages(
              (res.data.messages as MessageType[]).map((message) => ({
                ...message,
                timestamp: new Date(message.timestamp).toLocaleTimeString(),
              }))
            )
          }
        })
    }
  }, [canSend, roomCode])

  const scrollToLatest = () => {
    if (endOfMessagesDiv.current) {
      endOfMessagesDiv.current.scrollIntoView({ behavior: "smooth" })
    }
    setAlertNew(false)
  }

  useEffect(() => {
    if (messagesSheet.current && messages.length > 0) {
      const currScroll = messagesSheet.current.scrollTop
      // console.log(messagesSheet.current.scrollHeight - currScroll)
      if (
        messagesSheet.current.scrollHeight - currScroll <= 450 ||
        messages[messages.length - 1].user.username === profile?.username
      ) {
        scrollToLatest()
      } else {
        setAlertNew(true)
      }
    }
    console.log("num messages:", messages.length)
  }, [messages, profile])

  useEffect(() => {
    if (profile) {
      // socketio stuff
      axios
        .post("/api/socket")
        .then((res) => {
          console.log("lets go")
          if (res.status === 200) {
            sio.current = io()
            sio.current.on("connect", () => {
              // stupid ts
              sio.current?.emit("joinRoom", roomCode, (res: string) => {
                if (res === "ok") {
                  setCanSend(true)
                  console.log("i joined room yeay")
                  toast.success("You joined the room!", TOAST_CONFIG)
                } else {
                  toast.error("Could not join room :(", TOAST_CONFIG)
                }
              })
            })

            sio.current.on("connect_error", () => {
              toast.error("Could not join room :(", TOAST_CONFIG)
            })

            sio.current.on(
              "newMessage",
              (
                username: string,
                userAvatar: string,
                message: string,
                timestamp: string
              ) => {
                setMessages((prev) =>
                  prev.concat({
                    user: { username, userAvatar },
                    message,
                    timestamp: new Date(timestamp).toLocaleTimeString(),
                  })
                )
              }
            )
          } else {
            toast.error(
              "Error connecting to room. Try again later!",
              TOAST_CONFIG
            )
          }
        })
        .catch((e) => {
          toast.error(`Error connecting to room! ${e}`, TOAST_CONFIG)
        })

      return () => {
        if (sio.current) {
          sio.current.disconnect()
        }
      }
    }
  }, [roomCode, profile])

  if (!profile) return <>Loading...</>
  const { username, userAvatar } = profile

  const handleSendMessage = () => {
    if (sio.current && messageTextfield.current) {
      sio.current.emit("sendMessage", messageTextfield.current.value)
      messageTextfield.current.value = ""
      setMessageLength(0)
    }
  }

  return (
    <Container>
      <Helment title={roomCode} />
      <Typography level="h3" sx={{ mb: 1 }}>
        Chatroom: {roomCode}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Typography>
          Logged in as: <strong>{username}</strong>
        </Typography>
        <UserAvatar username={username} userAvatar={userAvatar} />
      </Stack>
      <Sheet id="messagesSheet" sx={{ position: "relative" }}>
        <Box sx={{ overflow: "auto", height: "50vh", p: 3 }}>
          {messages.map((msg) => (
            <Stack
              key={
                msg.timestamp + (Math.random() + 1).toString(36).substring(7)
              }
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <UserAvatar
                username={msg.user.username}
                userAvatar={msg.user.userAvatar}
              />
              <Typography>
                <strong>{msg.user.username}</strong>
              </Typography>
              <Typography level="body2">{msg.timestamp}</Typography>
              <Typography sx={{ ml: 3, wordBreak: "break-word" }}>
                {msg.message}
              </Typography>
            </Stack>
          ))}
          {alertNew && (
            <Alert
              variant="solid"
              color="info"
              startDecorator={<ArrowDownward />}
              size="sm"
              endDecorator={
                <IconButton
                  variant="plain"
                  size="sm"
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAlertNew(false)
                  }}
                >
                  <CloseRounded />
                </IconButton>
              }
              sx={{
                cursor: "pointer",
                position: "sticky",
                bottom: 0,
                transform: "translate(0, 50%)",
                transition: "0.1s ease-in-out",
                "&:hover": {
                  // backgroundColor: theme.vars.palette.primary.solidHoverBg
                  backgroundColor: "info.solidHoverBg",
                  transition: "0.1s ease-in-out",
                },
              }}
              onClick={(e) => {
                e.stopPropagation()
                scrollToLatest()
              }}
            >
              New messages
            </Alert>
          )}
          <div id="endOfMessagesDiv" ref={endOfMessagesDiv} />
        </Box>
        <List
          id="emojiMenu"
          sx={{
            m: 0,
            // p: emojiHints.length === 0 ? 0 : 1,
            p: 0,
            position: "absolute",
            bottom: 0,
            maxHeight: "40vh",
            width: "40%",
            overflow: "auto",
            backgroundColor: "background.popup",
          }}
        >
          {emojiHints.map((emoji, idx) => (
            <ListItem
              id={idx === currentHint ? "currentHint" : undefined}
              key={emoji}
              sx={{
                backgroundColor:
                  idx === currentHint
                    ? "neutral.solidHoverBg"
                    : "neutral.plainBg",
                "&:hover": {
                  backgroundColor: "neutral.solidHoverBg",
                  cursor: "pointer",
                },
              }}
              onClick={() => completeEmoji(emoji)}
            >
              <ListItemDecorator>
                {(EMOJIS as Record<string, string>)[emoji]}
              </ListItemDecorator>
              <ListItemContent>{emoji}</ListItemContent>
              {idx === currentHint && (
                <ListItemDecorator>
                  Tab <KeyboardTabSharp sx={{ ml: 1 }} />
                </ListItemDecorator>
              )}
            </ListItem>
          ))}
        </List>
      </Sheet>
      <form onSubmit={(e) => e.preventDefault()}>
        <TextField
          id="messageTextfield"
          variant="outlined"
          placeholder="Send Message"
          error={messageLength > MESSAGE_LENGTH_LIMIT}
          // onChange={checkMessage}
          color={
            MESSAGE_LENGTH_LIMIT - messageLength < 10 &&
            messageLength <= MESSAGE_LENGTH_LIMIT
              ? "warning"
              : undefined
          }
          helperText={
            messageLength > MESSAGE_LENGTH_LIMIT ||
            MESSAGE_LENGTH_LIMIT - messageLength < 10
              ? `Character limit (${messageLength}/${MESSAGE_LENGTH_LIMIT})`
              : undefined
          }
          endDecorator={
            <IconButton
              type="submit"
              variant="plain"
              onClick={handleSendMessage}
              disabled={
                !canSend ||
                messageLength === 0 ||
                messageLength > MESSAGE_LENGTH_LIMIT
              }
              sx={{ color: "white" }}
            >
              <SendOutlined />
            </IconButton>
          }
        />
      </form>
    </Container>
  )
}

RoomPage.getLayout = (page: ReactElement) => {
  return <ChatLayout>{page}</ChatLayout>
}

export default RoomPage

export const getServerSideProps: GetServerSideProps<PropsType> = async (
  context
) => {
  const token = await getToken({ req: context.req })
  if (token) {
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
