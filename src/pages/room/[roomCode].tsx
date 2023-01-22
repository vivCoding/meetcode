import Editor from "@monaco-editor/react"
import {
  Add,
  ArrowBack,
  ArrowForward,
  Check,
  Close,
  ExpandMore,
  Visibility,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Menu,
  MenuItem,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  TextField,
  Textarea,
  Typography,
} from "@mui/joy"
import axios from "axios"
import JSConfetti from "js-confetti"
import Link from "next/link"
import { useRouter } from "next/router"
import { getToken } from "next-auth/jwt"
import { useEffect, useRef, useState } from "react"
import Split from "react-split"
import { toast } from "react-toastify"
import { io } from "socket.io-client"

import ChatView from "@/components/Chat"
import SpectateDialog from "@/components/Dialogs/Spectate"
import RoomNavbar from "@/components/Navbar/room"
import { AVAIL_THEMES } from "@/constants/misc"
import TOAST_CONFIG from "@/constants/toastconfig"
import { sleep } from "@/utils/misc"

import type { CodeSnippet, Question } from "@/types/leetcode/question"
import type { SubmitResult, TestResult } from "@/types/leetcode/runResult"
import type { UserProfile } from "@/types/leetcode/user"
import type { MessageType, RoomModelType } from "@/types/room"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import type { Socket } from "socket.io-client"

type PropsType = {
  profile?: UserProfile
}

export default function RoomPage({
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const roomCode = router.query.roomCode as string
  const jsConfetti = useRef<JSConfetti | undefined>(undefined)

  const [questionSlug, setQuestionSlug] = useState<string | undefined>(
    undefined
  )
  // for question lists (competitive mode)
  const [currQuestionIdx, setQuestionIdx] = useState<number>(0)
  const [question, setQuestion] = useState<Question | undefined>()
  const [testCases, setTestCases] = useState("")

  const [editorValue, setEditorValue] = useState("")

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const openLangMenu = Boolean(anchorEl)
  const [langsAvail, setLangsAvail] = useState<string[]>([])
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet | undefined>(
    undefined
  )

  const [themeAnchorEl, setThemeAnchorEl] = useState<HTMLElement | null>(null)
  const openThemeMenu = Boolean(themeAnchorEl)
  const [theme, setTheme] = useState(AVAIL_THEMES[0])

  const [running, setIsRunning] = useState(false)
  const [submitting, setIsSubmitting] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | undefined>(
    undefined
  )
  const [submissionResult, setSubmissionResult] = useState<
    SubmitResult | undefined
  >(undefined)

  const [messages, setMessages] = useState<MessageType[]>([])
  const [ready, setReady] = useState(false)

  const [tabIdx, setTabIdx] = useState(0)

  const [openSpectateDialog, setOpenSpectateDialog] = useState(false)
  const [personSpectating, setPersonSpectating] = useState<string | undefined>()
  const [spectactedCode, setSpectatedCode] = useState<string>("")

  const sio = useRef<Socket | undefined>(undefined)

  const [roomState, setRoomState] = useState<RoomModelType | undefined>()

  useEffect(() => {
    // avoid creating the canvas multiple times
    let cvs = document.getElementById("confettiCanvas") as HTMLCanvasElement
    if (!cvs) {
      cvs = document.createElement("canvas")
      cvs.width = window.innerWidth
      cvs.height = window.innerHeight
      cvs.setAttribute("id", "confettiCanvas")
      cvs.setAttribute(
        "style",
        "position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; z-index: 1000; pointer-events: none;"
      )
      const par = document.getElementById("confettiParent")
      if (par) {
        par.appendChild(cvs)
      }
      // console.log(par)
      // console.log("created js confetti canvas")
    }
    jsConfetti.current = new JSConfetti({ canvas: cvs })
    // position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; z-index: 1000; pointer-events: none;
  }, [])

  useEffect(() => {
    if (questionSlug) {
      axios
        .get("/api/problem/get", { params: { questionSlug } })
        .then((res) => {
          if (res.status === 200 && res.data) {
            setQuestion(res.data.data)
          } else {
            toast.error("Could not get question :(", TOAST_CONFIG)
          }
        })
    }
  }, [questionSlug])

  useEffect(() => {
    if (question) {
      const langs = Object.keys(question.codeSnippets).sort()
      if (!currentSnippet) {
        setCurrentSnippet(question.codeSnippets[langs[0]])
      }
      setLangsAvail(langs)
      setEditorValue(question.codeSnippets[langs[0]].code)
      setTestCases(question.exampleTestcaseList.join("\n"))
    }
  }, [question, currentSnippet])

  useEffect(() => {
    if (currentSnippet) {
      setEditorValue(currentSnippet.code)
    }
  }, [currentSnippet])

  useEffect(() => {
    if (profile) {
      axios
        .post("/api/socket")
        .then((res) => {
          if (res.status === 200) {
            sio.current = io()
            sio.current.on("connect", () => {
              // bruh
              sio.current?.emit(
                "joinRoom",
                roomCode,
                (roomState?: RoomModelType) => {
                  if (!!roomState) {
                    setRoomState(roomState)
                    setReady(true)
                    toast.success("You joined the room!", TOAST_CONFIG)
                    if (roomState.isRunning) {
                      if (
                        roomState.roomSettings.mode === "Casual" &&
                        roomState.isRunning
                      ) {
                        setQuestionSlug(roomState.currentQuestion)
                      }
                    }
                  } else {
                    toast.error("Could not join room :(", TOAST_CONFIG)
                  }
                }
              )
            })

            sio.current.on(
              "newMember",
              (username: string, userAvatar: string, room: RoomModelType) => {
                setRoomState(room)
                setMessages((prev) => [
                  ...prev,
                  {
                    user: { username, userAvatar },
                    message: "joined the room",
                    timestamp: new Date().toLocaleTimeString(),
                    connectionMessage: true,
                  },
                ])
              }
            )

            sio.current.on(
              "memberLeft",
              (username: string, userAvatar: string, room: RoomModelType) => {
                setRoomState(room)
                setMessages((prev) => [
                  ...prev,
                  {
                    user: { username, userAvatar },
                    message: "left the room",
                    timestamp: new Date().toLocaleTimeString(),
                    connectionMessage: true,
                  },
                ])
              }
            )

            sio.current.on(
              "newMessage",
              (username: string, userAvatar: string, message: string) => {
                setMessages((prev) => [
                  ...prev,
                  {
                    user: { username, userAvatar },
                    message,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ])
              }
            )

            sio.current.on(
              "memberFinished",
              (
                username: string,
                userAvatar: string,
                roomState: RoomModelType
              ) => {
                setMessages((prev) => [
                  ...prev,
                  {
                    user: { username, userAvatar },
                    message: "successfully submitted!",
                    timestamp: new Date().toLocaleTimeString(),
                    statusMessage: true,
                  },
                ])
                setRoomState(roomState)
              }
            )

            sio.current.on(
              "memberSurrendered",
              (
                username: string,
                userAvatar: string,
                roomState: RoomModelType
              ) => {
                setMessages((prev) => [
                  ...prev,
                  {
                    user: { username, userAvatar },
                    message: "gave up :(",
                    timestamp: new Date().toLocaleTimeString(),
                    statusMessage: true,
                  },
                ])
                setRoomState(roomState)
              }
            )

            sio.current.on("roomStarted", (roomState: RoomModelType) => {
              setRoomState(roomState)
              setQuestionSlug(roomState.currentQuestion)
            })

            // sio.current.on("allMembersFinished", () => {
            //   setRoomState((prev) => {
            //     if (prev) {
            //       return { ...prev, isRunning: false }
            //     }
            //     return prev
            //   })
            // })

            sio.current.on("connect_error", () => {
              toast.error("Could not join room :(", TOAST_CONFIG)
            })
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
    }

    return () => {
      if (sio.current) {
        sio.current.disconnect()
      }
    }
  }, [profile, roomCode])

  const handleSendMessage = (newMessage: string) => {
    if (sio.current && profile) {
      sio.current.emit("sendMessage", newMessage)
    }
  }

  const handleRun = async () => {
    if (question && currentSnippet) {
      setTabIdx(1)
      setIsRunning(true)
      setSubmissionResult(undefined)
      const res = await axios.post("/api/problem/run", {
        questionSlug: question.titleSlug,
        questionId: question.questionId,
        lang: currentSnippet.langSlug,
        code: editorValue,
        testCases,
      })
      if (res.status === 200 && res.data) {
        if (res.data.success) {
          console.log(res.data.data)
          setTestResult(res.data.data)
          if (res.data.data.correct_answer) {
            toast.success("Test cases passed", TOAST_CONFIG)
          } else {
            toast.error(
              `Error in test cases: ${
                res.data.data.status_msg ?? "Skill issue"
              }`,
              TOAST_CONFIG
            )
          }
        } else {
          toast.error(`uh oh bad oh! ${res.data.error}`, TOAST_CONFIG)
        }
      }
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (question && currentSnippet) {
      setTabIdx(1)
      setIsSubmitting(true)
      setTestResult(undefined)
      const res = await axios.post("/api/problem/submit", {
        questionSlug: question.titleSlug,
        questionId: question.questionId,
        lang: currentSnippet.langSlug,
        code: editorValue,
      })
      if (res.status === 200 && res.data) {
        if (res.data.success) {
          console.log(res.data.data)
          setSubmissionResult(res.data.data)
          if (res.data.data.status_msg === "Accepted") {
            // console.log("yeay!")
            toast.success("Success! Your code was accepted!", TOAST_CONFIG)
            if (jsConfetti.current) {
              await sleep(250)
              jsConfetti.current.addConfetti()
            }
            if (sio.current) {
              sio.current.emit(
                "sendSubmissionStatus",
                (roomState?: RoomModelType) => {
                  if (!!roomState) {
                    setRoomState(roomState)
                  }
                }
              )
            }
          } else {
            toast.error(
              `Drat! You got ${res.data.data.status_msg ?? "Skill issue"}`,
              TOAST_CONFIG
            )
          }
        } else {
          toast.error(`uh oh bad oh! ${res.data.error}`, TOAST_CONFIG)
        }
      }
      setIsSubmitting(false)
    }
  }

  const handleGiveUp = () => {
    if (sio.current) {
      sio.current.emit("sendSurrenderStatus", (roomState?: RoomModelType) => {
        if (!!roomState) {
          setRoomState(roomState)
        }
      })
    }
  }

  const handleStartRoom = () => {
    if (sio.current) {
      sio.current.emit("startRoom", (roomState?: RoomModelType) => {
        setRoomState(roomState)
      })
    }
  }

  const handleSpectate = (username?: string) => {
    if (username) {
    }
    setOpenSpectateDialog(false)
  }

  if (!profile || !roomState) return <>Loading...</>
  return (
    <Box id="confettiParent">
      <RoomNavbar
        roomCode={roomCode}
        profile={profile}
        roomState={roomState}
        onGiveUp={handleGiveUp}
        onStartRoom={handleStartRoom}
      />
      <div style={{ height: "90vh" }}>
        <Split
          sizes={[35, 40, 25]}
          minSize={100}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          className="split-horiz"
          direction="horizontal"
          style={{
            height: "90vh",
          }}
        >
          <Box
            sx={{
              margin: 0,
              padding: 3,
              maxHeight: "100%",
              overflow: "scroll",
              "& pre": { whiteSpace: "pre-wrap" },
              backgroundColor: "#1b1d1e",
            }}
          >
            {!!question && (
              <>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                >
                  <Typography level="h5" sx={{ mb: 1, mr: "auto" }}>
                    {question?.questionId}. {question?.title}
                  </Typography>
                  {roomState?.roomSettings.mode === "Competitive" && (
                    <>
                      <IconButton
                        variant="plain"
                        sx={{ ml: 2 }}
                        onClick={() => {
                          setQuestionIdx((prev) =>
                            prev === 0
                              ? prev - 1
                              : roomState.questionQueue.length - 1
                          )
                        }}
                      >
                        <ArrowBack />
                      </IconButton>
                      <IconButton
                        variant="plain"
                        onClick={() => {
                          setQuestionIdx((prev) =>
                            prev === roomState.questionQueue.length - 1
                              ? 0
                              : prev + 1
                          )
                        }}
                      >
                        <ArrowForward />
                      </IconButton>
                    </>
                  )}
                </Stack>
                <Link
                  href={`https://leetcode.com/problems/${question.titleSlug}`}
                  style={{ textDecoration: "none" }}
                  target="_blank"
                >
                  <Button size="sm" color="info">
                    View on LeetCode
                  </Button>
                </Link>
                <div
                  dangerouslySetInnerHTML={{
                    __html: question ? question.content : "",
                  }}
                ></div>
              </>
            )}
          </Box>
          <Split
            sizes={[55, 45]}
            expandToMin={false}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={30}
            dragInterval={1}
            className="split-vert"
            direction="vertical"
            style={{
              height: "100%",
            }}
          >
            <Box sx={{ marginTop: 1, overflow: "hidden" }}>
              <Stack direction="row" justifyContent="end">
                <Button variant="outlined" color="neutral">
                  My Code
                </Button>
                {/* <Button variant="outlined" color="neutral">
                  frankieray12345
                </Button> */}
                {!!!personSpectating && (
                  <IconButton
                    variant="outlined"
                    color="neutral"
                    onClick={() => setOpenSpectateDialog(true)}
                  >
                    <VisibilityOutlined />
                  </IconButton>
                )}
                {!!personSpectating && (
                  <IconButton variant="outlined" color="danger">
                    <VisibilityOffOutlined />
                  </IconButton>
                )}
                <Button
                  variant="plain"
                  size="sm"
                  // color="neutral"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  endDecorator={<ExpandMore />}
                  sx={{
                    color: "azure",
                    mr: 1,
                    ml: "auto",
                  }}
                >
                  {currentSnippet?.lang}
                </Button>
                <Button
                  variant="plain"
                  size="sm"
                  // color="neutral"
                  onClick={(e) => setThemeAnchorEl(e.currentTarget)}
                  endDecorator={<ExpandMore />}
                  sx={{
                    color: "azure",
                  }}
                >
                  {theme}
                </Button>
              </Stack>
              <Editor
                theme={theme}
                value={editorValue}
                // edge case for python
                language={
                  currentSnippet?.langSlug === "python3"
                    ? "python"
                    : currentSnippet?.langSlug
                }
                onChange={(val) => setEditorValue(val ?? "")}
              />
            </Box>
            <Stack sx={{ height: "100%" }}>
              <Box flexGrow={1} sx={{ overflow: "auto", p: 2 }}>
                <Box>
                  <Tabs
                    value={tabIdx}
                    onChange={(_, val) => setTabIdx(val as number)}
                    sx={{
                      borderRadius: "lg",
                      backgroundColor: "#1a2532",
                      // alignItems: "flex-start",
                      height: "100%",
                    }}
                  >
                    <TabList>
                      <Tab>Test Cases</Tab>
                      <Tab>Result</Tab>
                    </TabList>
                    <TabPanel value={0} sx={{ width: "100%", height: "100%" }}>
                      <Typography my={2}>Enter test cases below</Typography>
                      <Textarea
                        defaultValue={testCases}
                        onChange={(e) => setTestCases(e.target.value)}
                        sx={{
                          mt: 1,
                          height: "100%",
                          // overflowY: "auto",
                        }}
                      />
                    </TabPanel>
                    <TabPanel value={1} sx={{ width: "100%", p: 2 }}>
                      {!submitting && !running && (
                        <>
                          {!!testResult && (
                            <Stack spacing={1}>
                              <Typography level="h3">
                                {testResult.status_msg}:{" "}
                                {testResult.correct_answer ?? false
                                  ? "Correct"
                                  : "Incorrect"}{" "}
                                Answer
                              </Typography>
                              <Typography>
                                {testResult.correct_answer ?? false
                                  ? "Correct"
                                  : "Incorrect"}
                              </Typography>
                              {testResult.status_msg === "Compile Error" && (
                                <Typography color="danger">
                                  {testResult.full_compile_error}
                                </Typography>
                              )}
                              {testResult.status_msg === "Runtime Error" && (
                                <Typography color="danger">
                                  {testResult.full_runtime_error}
                                </Typography>
                              )}
                              {!!testResult.expected_code_answer &&
                                !!testResult.code_answer && (
                                  <>
                                    <Typography>Expected</Typography>
                                    <TextField
                                      value={testResult.expected_code_answer}
                                    />
                                    <Typography>Actual</Typography>
                                    <TextField value={testResult.code_answer} />
                                  </>
                                )}
                            </Stack>
                          )}
                          {!!submissionResult &&
                            (submissionResult.status_msg === "Accepted" ? (
                              <Stack spacing={1}>
                                <Typography level="h3" sx={{ color: "lime" }}>
                                  Success!
                                </Typography>
                                <Typography>
                                  Your code worked fine and dandy!
                                </Typography>
                              </Stack>
                            ) : (
                              <Stack spacing={1}>
                                <Typography level="h3" color="danger">
                                  {submissionResult.status_msg} :(
                                </Typography>
                                {submissionResult.status_msg ===
                                  "Compile Error" && (
                                  <Typography color="danger">
                                    {submissionResult.full_compile_error}
                                  </Typography>
                                )}
                                {submissionResult.status_msg ===
                                  "Wrong Answer" ||
                                  (submissionResult.status_msg ===
                                    "Time Limit Exceeded" && (
                                    <>
                                      <Typography>
                                        Wrong Answer on Test Case
                                      </Typography>
                                      <TextField
                                        value={submissionResult.last_testcase}
                                      />
                                      <Typography>Expected</Typography>
                                      <TextField
                                        value={submissionResult.expected_output}
                                      />
                                      <Typography>Actual</Typography>
                                      <TextField
                                        value={submissionResult.code_output}
                                      />
                                    </>
                                  ))}
                              </Stack>
                            ))}
                        </>
                      )}
                    </TabPanel>
                  </Tabs>
                </Box>
              </Box>
              <Box flexShrink={0}>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ p: 1, backgroundColor: "#293a4c" }}
                >
                  <Button
                    variant="solid"
                    color="neutral"
                    onClick={() => {
                      if (question) {
                        setTestCases(question.exampleTestcaseList.join("\n"))
                      }
                    }}
                  >
                    Reset Tests
                  </Button>
                  <Button
                    variant="solid"
                    color="neutral"
                    loading={running}
                    disabled={submitting}
                    onClick={handleRun}
                  >
                    Run
                  </Button>
                  <Button
                    variant="solid"
                    color="success"
                    onClick={handleSubmit}
                    disabled={running}
                    loading={submitting}
                  >
                    Submit
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Split>
          <ChatView
            profile={profile}
            messages={messages}
            ready={ready}
            onNewMessage={handleSendMessage}
          />
        </Split>
        <Menu
          anchorEl={anchorEl}
          open={openLangMenu}
          onClose={() => setAnchorEl(null)}
          placement="bottom-end"
          sx={{ maxHeight: "50vh" }}
        >
          {langsAvail.map((lang) => (
            <MenuItem
              key={lang}
              onClick={() => {
                setCurrentSnippet(question?.codeSnippets[lang])
                setAnchorEl(null)
              }}
            >
              {currentSnippet?.langSlug === lang ? (
                <>
                  <ListItemDecorator>
                    <Check />
                  </ListItemDecorator>
                  <ListItemContent>
                    {question?.codeSnippets[lang].lang}
                  </ListItemContent>
                </>
              ) : (
                <>
                  <ListItemDecorator />
                  <ListItemContent>
                    {question?.codeSnippets[lang].lang}
                  </ListItemContent>
                </>
              )}
            </MenuItem>
          ))}
        </Menu>
        <Menu
          anchorEl={themeAnchorEl}
          open={openThemeMenu}
          onClose={() => setThemeAnchorEl(null)}
          placement="bottom-end"
          sx={{ maxHeight: "50vh" }}
        >
          {AVAIL_THEMES.map((availTheme) => (
            <MenuItem
              key={availTheme}
              onClick={() => {
                setTheme(availTheme)
                setThemeAnchorEl(null)
              }}
            >
              {availTheme === theme ? (
                <>
                  <ListItemDecorator>
                    <Check />
                  </ListItemDecorator>
                  <ListItemContent>{availTheme}</ListItemContent>
                </>
              ) : (
                <>
                  <ListItemDecorator />
                  <ListItemContent>{availTheme}</ListItemContent>
                </>
              )}
            </MenuItem>
          ))}
        </Menu>
        <SpectateDialog
          onClose={handleSpectate}
          open={openSpectateDialog}
          currentUser={profile.username}
          usernames={["frankieray12345", "vvvu", "jviv2061"]}
        />
      </div>
    </Box>
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
