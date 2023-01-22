import {
  CancelOutlined,
  Check,
  Close,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material"
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  ChipDelete,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemDecorator,
  Option,
  Radio,
  RadioGroup,
  Select,
  Sheet,
  Stack,
  Switch,
  TextField,
  Typography,
  styled,
} from "@mui/joy"
import axios from "axios"
import { useRouter } from "next/router"
import { getToken } from "next-auth/jwt"
import { useState } from "react"
import { toast } from "react-toastify"

import Navbar from "@/components/Navbar"
import LISTS from "@/constants/leetcode/lists.json"
import TOPICS from "@/constants/leetcode/topics.json"
import TOAST_CONFIG from "@/constants/toastconfig"

import type { Question, QuestionSearchResult } from "@/types/leetcode/question"
import type { UserProfile } from "@/types/leetcode/user"
import type { RoomSettings } from "@/types/room"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"

type PropsType = {
  profile?: UserProfile
}

const MODES = ["Casual", "Competitive"]
const DIFFICULTIES = ["Any", "Easy", "Medium", "Hard"]

export default function CreatePage({
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const [mode, setMode] = useState(MODES[0])
  const [difficulty, setDifficulty] = useState("Any")
  const [topics, setTopics] = useState<string[]>([])
  const [openTopics, setOpenTopics] = useState(false)
  const [list, setList] = useState("")
  const [searchOptions, setSearchOptions] = useState<QuestionSearchResult[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [questions, setQuestions] = useState<QuestionSearchResult[]>([])

  const [showLeaderboard, setShowLeaderboard] = useState(true)
  const [showSubmissionMessage, setShowSubmissionMessage] = useState(true)
  const [timeLimitPerQuestion, setTimeLimitPerQuestion] = useState(15)
  const [contestTimeLimit, setContestTimeLimit] = useState(60)

  const onSearch = (_: React.SyntheticEvent, value: string, reason: string) => {
    console.log(value)
    setSearchValue(value)
    axios
      .get("/api/problem/search", {
        params: {
          query: searchValue,
        },
      })
      .then((res) => {
        if (res.status === 200 && res.data) {
          setSearchOptions(res.data)
        }
      })
  }

  const onQuestionSelect = (
    _: React.SyntheticEvent,
    value: QuestionSearchResult | null,
    reason: string
  ) => {
    if (reason === "selectOption" && !!value) {
      console.log(value)
      setQuestions((prev) => [...prev, value])
      setSearchValue("")
    }
  }

  const handleCreate = async () => {
    const roomSettings: RoomSettings = {
      mode,
      problemTags: topics,
      problemListTag: list,
      problemDifficulty: difficulty,
      showLeaderboard,
      showSubmissionMessage,
      contestTimeLimit,
      timeLimit: timeLimitPerQuestion,
      isOpen: true,
    }
    const res = await axios.post("/api/room/create", {
      roomSettings,
      questionQueue: questions.map((q) => q.titleSlug),
    })
    if (res.status === 200) {
      // console.log(res.data.roomCode)
      router.push(`/room/${res.data.roomCode}`)
    } else {
      toast.error("Oops! Could not create room!", TOAST_CONFIG)
    }
  }

  if (!profile) return <>Loading...</>

  return (
    <>
      <Navbar profile={profile} />
      <Stack
        alignItems="center"
        sx={{
          marginTop: 5,
          textAlign: "center",
          mb: 3,
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            p: 5,
            pb: 3,
            backgroundColor: "#2b3e54",
            borderRadius: 10,
            maxWidth: "80vw",
          }}
        >
          <Typography level="h1" sx={{ mb: 5 }}>
            Create Room
          </Typography>
          <div style={{ textAlign: "left" }}>
            {/* <Stack direction="row" alignItems="center">
              <Typography sx={{ mr: 10 }}>Mode</Typography>
              <RadioGroup row sx={{ ml: "auto", flexWrap: "wrap", gap: 1 }}>
                {MODES.map((name) => {
                  const checked = mode === name
                  return (
                    <Chip
                      key={name}
                      variant={checked ? "soft" : "plain"}
                      color={checked ? "primary" : "neutral"}
                      startDecorator={
                        checked && (
                          <Check sx={{ zIndex: 1, pointerEvents: "none" }} />
                        )
                      }
                      sx={{ textAlign: "left" }}
                    >
                      <Radio
                        variant="outlined"
                        color={checked ? "primary" : "neutral"}
                        disableIcon
                        overlay
                        label={name}
                        value={name}
                        checked={checked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setMode(name)
                          }
                        }}
                      />
                    </Chip>
                  )
                })}
              </RadioGroup>
            </Stack> */}
            {mode === "Casual" && (
              <>
                <Typography level="h4" sx={{ mt: 4, mb: 2 }}>
                  <strong>Problem Settings</strong>
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center">
                    <Typography sx={{ mr: 10 }}>Difficulty</Typography>
                    <RadioGroup
                      row
                      sx={{ ml: "auto", flexWrap: "wrap", gap: 1 }}
                    >
                      {DIFFICULTIES.map((name) => {
                        const checked = difficulty === name
                        return (
                          <div key={name} onClick={() => setDifficulty(name)}>
                            <Chip
                              variant={checked ? "solid" : "outlined"}
                              color={
                                name === "Any"
                                  ? "primary"
                                  : name === "Easy"
                                  ? "success"
                                  : name === "Medium"
                                  ? "warning"
                                  : "danger"
                              }
                              startDecorator={
                                checked && (
                                  <Check
                                    htmlColor="white"
                                    sx={{
                                      zIndex: 1,
                                      pointerEvents: "none",
                                      color: "white",
                                    }}
                                  />
                                )
                              }
                              sx={{
                                textAlign: "left",
                                transition: "0.2s",
                                "&:hover": {
                                  opacity: 0.7,
                                  transition: "0.2s",
                                  cursor: "pointer",
                                },
                              }}
                            >
                              {name}
                            </Chip>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </Stack>
                  <Stack>
                    <Stack direction="row" alignItems="center">
                      <Typography
                        sx={{ mr: "auto" }}
                        endDecorator={
                          <IconButton
                            variant="plain"
                            onClick={() => setOpenTopics((prev) => !prev)}
                          >
                            {openTopics ? <ExpandMore /> : <ExpandLess />}
                          </IconButton>
                        }
                      >
                        Topics
                      </Typography>
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={1}
                        justifyContent="flex-end"
                        sx={{
                          ml: 4,
                        }}
                      >
                        {topics.length > 0 ? (
                          topics.map((topic) => (
                            <div
                              key={topic}
                              onClick={() =>
                                setTopics((prev) =>
                                  prev.filter((t) => t !== topic)
                                )
                              }
                            >
                              <Chip
                                key={topic}
                                variant="solid"
                                color="neutral"
                                endDecorator={<ChipDelete />}
                                sx={{
                                  transition: "0.2s",
                                  "&:hover": {
                                    transition: "0.2s",
                                    opacity: 0.7,
                                    cursor: "pointer",
                                  },
                                }}
                              >
                                {topic}
                              </Chip>
                            </div>
                          ))
                        ) : (
                          <Typography sx={{ fontStyle: "italic" }}>
                            All Topics
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                    {openTopics && (
                      <>
                        <RadioGroup
                          row
                          sx={{ flexWrap: "wrap", gap: 1, mt: 2 }}
                        >
                          {TOPICS.map((name) => {
                            const checked = topics.includes(name)
                            return (
                              <Chip
                                key={name}
                                variant={checked ? "solid" : "outlined"}
                                color={checked ? "primary" : "neutral"}
                                startDecorator={
                                  checked && (
                                    <Check
                                      sx={{
                                        zIndex: 1,
                                        pointerEvents: "none",
                                      }}
                                    />
                                  )
                                }
                                sx={{
                                  textAlign: "left",
                                }}
                              >
                                <Checkbox
                                  variant="outlined"
                                  color={checked ? "primary" : "neutral"}
                                  disableIcon
                                  overlay
                                  label={name}
                                  checked={checked}
                                  onChange={(event) => {
                                    setTopics((names) =>
                                      !event.target.checked
                                        ? names.filter((n) => n !== name)
                                        : [...names, name]
                                    )
                                  }}
                                />
                              </Chip>
                            )
                          })}
                        </RadioGroup>
                      </>
                    )}
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Typography sx={{ mr: "auto" }}>Lists</Typography>
                    <Select
                      defaultValue={list}
                      sx={{ minWidth: 250 }}
                      onChange={(e) => {
                        if (e) {
                          const x = LISTS.find(
                            (ls) => ls.title === (e.target as any).textContent
                          )
                          if (x) {
                            setList(x.id)
                            console.log(x.id)
                          }
                        }
                      }}
                    >
                      {LISTS.map((ls) => (
                        <Option key={ls.id} value={ls.id}>
                          {ls.title}
                        </Option>
                      ))}
                    </Select>
                  </Stack>
                </Stack>
              </>
            )}
            <Typography level="h4" sx={{ mt: 4, mb: 2 }}>
              <strong>Question {mode === "Casual" ? "Queue" : "List"}</strong>
            </Typography>
            {mode === "Casual" && (
              <Typography>
                These questions will be done <strong>first</strong>
              </Typography>
            )}
            <Autocomplete
              onInputChange={onSearch}
              inputValue={searchValue}
              options={searchOptions}
              onChange={onQuestionSelect}
              getOptionLabel={(option) =>
                `${option.questionId}. ${option.title}`
              }
              sx={{
                mt: 2,
                mb: 2,
              }}
            />
            {questions.length > 0 ? (
              <List>
                {questions.map((q) => (
                  <ListItem key={q.titleSlug}>
                    <ListItemDecorator>
                      <IconButton
                        variant="plain"
                        onClick={() =>
                          setQuestions((prev) =>
                            prev.filter((qq) => qq.titleSlug !== q.titleSlug)
                          )
                        }
                        sx={{ mr: 2 }}
                      >
                        <Close />
                      </IconButton>
                    </ListItemDecorator>
                    {`${q.questionId}. ${q.title}`}
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography fontStyle="italic">
                No questions {mode === "casual" ? "queued" : "added"}
              </Typography>
            )}
            <Typography level="h4" sx={{ mt: 4, mb: 2 }}>
              <strong>Room Settings</strong>
            </Typography>
            <Stack spacing={2}>
              {/* {mode === "Casual" && (
                <Stack direction="row" alignItems="center">
                  <Typography sx={{ mr: "auto" }}>
                    Time Limit per Question
                  </Typography>
                  <TextField
                    sx={{ ml: 7 }}
                    type="number"
                    placeholder="Time in Minutes"
                    onChange={(e) =>
                      setTimeLimitPerQuestion(e.target.valueAsNumber)
                    }
                  />
                </Stack>
              )} */}
              {mode === "Competitive" && (
                <Stack direction="row" alignItems="center">
                  <Typography sx={{ mr: "auto" }}>
                    Contest Time Limit
                  </Typography>
                  <TextField
                    sx={{ ml: 7 }}
                    type="number"
                    placeholder="Time in Minutes"
                    onChange={(e) =>
                      setContestTimeLimit(e.target.valueAsNumber)
                    }
                  />
                </Stack>
              )}
              <Stack direction="row" alignItems="center">
                <Typography sx={{ mr: "auto" }}>Show Leaderboard</Typography>
                <Switch
                  defaultChecked
                  sx={{ ml: 5 }}
                  onChange={(e) => setShowLeaderboard(e.target.checked)}
                />
              </Stack>
              <Stack direction="row" alignItems="center">
                <Typography sx={{ mr: "auto" }}>
                  Send Messages on Submission Success
                </Typography>
                <Switch
                  defaultChecked
                  sx={{ ml: 5 }}
                  onChange={(e) => setShowSubmissionMessage(e.target.checked)}
                />
              </Stack>
            </Stack>
          </div>
          <Button onClick={handleCreate} sx={{ mt: 5 }}>
            Create
          </Button>
        </Sheet>
      </Stack>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PropsType> = async (
  context
) => {
  const token = await getToken({ req: context.req })
  if (token) {
    console.log("got lc", (token.profile as any).username)
    return {
      props: {
        profile: token.profile as UserProfile,
        // profile: {
        //   username: "vvvu",
        //   userAvatar:
        //     "https://assets.leetcode.com/users/avatars/avatar_1648876515.png",
        // },
      },
    }
  }
  console.log("bruh", token)
  // never happens cuz of middleware
  return {
    props: {},
    redirect: {
      destination: "/login",
    },
  }
}
