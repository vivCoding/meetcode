import {
  ArrowDownward,
  CloseRounded,
  KeyboardTabSharp,
  SendOutlined,
} from "@mui/icons-material"
import {
  Alert,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Sheet,
  Stack,
  TextField,
  Typography,
} from "@mui/joy"
import fuzzysort from "fuzzysort"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import EMOJIS from "@/constants/emojis.json"

import UserAvatar from "../UserAvatar"

import type { UserProfile } from "@/types/leetcode/user"
import type { MessageType } from "@/types/room"

type PropsType = {
  profile: UserProfile
  // messages: MessageType[]
  ready: boolean
}

const MESSAGE_LENGTH_LIMIT = 100
const EMOJI_DICT = EMOJIS as Record<string, string>
const EMOJI_KEYS = Object.keys(EMOJIS)
const SPECIAL_KEYS = ["Tab", "ArrowDown", "ArrowUp"]

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

export default function ChatView({ profile, ready }: PropsType) {
  // const [canSend, setCanSend] = useState(ready)
  const [canSend, setCanSend] = useState(true)
  const [messageLength, setMessageLength] = useState(0) // only updated for the warning

  const messagesSheet = useRef<HTMLElement | null>(null)
  const endOfMessagesDiv = useRef<HTMLDivElement>(null)
  const messageTextfield = useRef<HTMLInputElement | null>(null)

  const [emojiHints, setEmojiHints] = useState<string[]>([])
  const [currentHint, setCurrentHint] = useState(0)

  const [alertNew, setAlertNew] = useState(false)

  const [messages, setMessages] = useState<MessageType[]>([])

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
  }, [messages, profile])

  const handleSendMessage = () => {
    if (messageTextfield.current) {
      setMessages((prev) => [
        ...prev,
        {
          user: profile,
          message: (messageTextfield.current as HTMLInputElement).value,
          timestamp: new Date().toLocaleTimeString(),
        },
      ])
      messageTextfield.current.value = ""
      setMessageLength(0)
    }
    // if (sio.current && messageTextfield.current) {
    //   sio.current.emit("sendMessage", messageTextfield.current.value)
    //   messageTextfield.current.value = ""
    //   setMessageLength(0)
    // }
  }

  return (
    <Box sx={{ backgroundColor: "#1b1d1e", width: "100%", height: "90vh" }}>
      <Box sx={{ height: "7vh" }}>
        <Typography level="h6" textAlign="center" sx={{ p: 1 }}>
          Chat
        </Typography>
        <Divider />
      </Box>
      <Box id="messagesSheet" sx={{ position: "relative", height: "72vh" }}>
        <Box sx={{ overflow: "auto", p: 3, height: "100%" }}>
          {messages.map((msg) => (
            <Stack
              key={
                msg.timestamp + (Math.random() + 1).toString(36).substring(7)
              }
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <UserAvatar
                username={msg.user.username}
                userAvatar={msg.user.userAvatar}
              />
              <Stack>
                <Stack direction="row" alignItems="flex-end">
                  <Typography fontWeight="bold">{msg.user.username}</Typography>
                  <Typography level="body2" sx={{ ml: 1 }}>
                    {msg.timestamp}
                  </Typography>
                </Stack>
                <Typography sx={{ wordBreak: "break-word", mb: 0.5 }}>
                  {msg.message}
                </Typography>
              </Stack>
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
            width: "80%",
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
      </Box>
      <Box sx={{ height: "7vh" }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <TextField
            id="messageTextfield"
            variant="outlined"
            placeholder="Send Message. Type :emoji: for emojis"
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
            sx={{ height: "5vh" }}
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
      </Box>
    </Box>
  )
}
