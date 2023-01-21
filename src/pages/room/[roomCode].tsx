import Editor from "@monaco-editor/react"
import {
  Add,
  Check,
  Close,
  ExpandMore,
  Visibility,
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
  Textarea,
  Typography,
} from "@mui/joy"
import axios from "axios"
import { useRouter } from "next/router"
import { getToken } from "next-auth/jwt"
import { useEffect, useState } from "react"
import Split from "react-split"
import { toast } from "react-toastify"

import ChatView from "@/components/Chat"
import RoomNavbar from "@/components/Navbar/room"
import { AVAIL_THEMES } from "@/constants/misc"
import TOAST_CONFIG from "@/constants/toastconfig"

import type { CodeSnippet, Question } from "@/types/leetcode/question"
import type { UserProfile } from "@/types/leetcode/user"
import type { MessageType } from "@/types/room"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"

type PropsType = {
  profile?: UserProfile
}

export default function RoomPage({
  profile,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const roomCode = router.query.roomCode as string
  const [questionSlug, setQuestionSlug] = useState("two-sum")
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

  const [messages, setMessages] = useState<MessageType[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    axios.get("/api/problem/get", { params: { questionSlug } }).then((res) => {
      if (res.status === 200 && res.data) {
        setQuestion(res.data.data)
      } else {
        toast.error("Could not get question :(", TOAST_CONFIG)
      }
    })
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
    // TODO insert socket on connect event
    toast.success("Successfully joined room!", TOAST_CONFIG)
    setReady(true)
  }, [])

  const handleRun = () => {
    setIsRunning(true)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
  }

  if (!profile) return <>Loading...</>
  return (
    <>
      <RoomNavbar roomCode={roomCode} profile={profile} />
      <div style={{ height: "90vh" }}>
        <Split
          // sizes={[40, 60]}
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
            {!!question ? (
              <>
                <Typography level="h5">
                  {question?.questionId}. {question?.title}
                </Typography>
                <div
                  dangerouslySetInnerHTML={{
                    __html: question ? question.content : "",
                  }}
                ></div>
              </>
            ) : (
              <Typography>Loading....</Typography>
            )}
          </Box>
          <Split
            sizes={[40, 60]}
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
                <Button
                  variant="outlined"
                  color="neutral"
                  sx={{
                    mr: "auto",
                  }}
                  endDecorator={<VisibilityOutlined />}
                >
                  Spectate
                </Button>
                <Button
                  variant="plain"
                  size="sm"
                  // color="neutral"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  endDecorator={<ExpandMore />}
                  sx={{
                    color: "azure",
                    mr: 1,
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
                    defaultValue={0}
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
          {/* <ChatView profile={profile} messages={messages} ready={ready} /> */}
          <ChatView profile={profile} ready={ready} />
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
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<PropsType> = async (
  context
) => {
  // TODO change
  // const token = await getToken({ req: context.req })
  const token = true
  if (token) {
    // console.log("got lc", (token.profile as any).username)
    return {
      props: {
        // profile: token.profile as UserProfile,
        profile: {
          username: "vvvu",
          userAvatar:
            "https://assets.leetcode.com/users/avatars/avatar_1648876515.png",
        },
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
