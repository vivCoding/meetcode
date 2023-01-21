import {
  ArrowBack,
  ArrowForwardOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material"
import {
  Button,
  IconButton,
  Sheet,
  Stack,
  TextField,
  Typography,
} from "@mui/joy"
import { GetServerSideProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { getToken } from "next-auth/jwt"
import { signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import Helmet from "@/components/Helmet"
import TOAST_CONFIG from "@/constants/toastconfig"

// https://next-auth.js.org/configuration/pages#credentials-sign-in

const DEFAULT_URL = "/room/join"

export default function LeetcodePage() {
  const router = useRouter()
  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const error = Boolean(router.query ? router.query.error : undefined)

  useEffect(() => {
    if (error) {
      toast.error("Error logging in! Check credentials", TOAST_CONFIG)
    }
  }, [error])

  const handleLogin = async () => {
    setLoading(true)
    // console.log("starting login")
    await signIn("credentials", {
      user,
      password,
      callbackUrl: (router.query?.callbackUrl as string) ?? DEFAULT_URL,
    })
  }

  return (
    <>
      <Helmet title="Login" />
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundImage: "url('landing.png')",
          backgroundBlendMode: "darken",
          backgroundRepeat: "no-repeat",
          filter: "brightness(60%)",
          backgroundSize: "cover",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          <Typography
            startDecorator={<ArrowBack />}
            style={{ textAlign: "center" }}
          >
            Home
          </Typography>
        </Link>
        <Helmet title="Log In" />
        <form onSubmit={(e) => e.preventDefault()}>
          <Sheet
            variant="outlined"
            sx={{
              p: 5,
              width: "27em",
              display: "flex",
              flexDirection: "column",
              // justifyContent: "center",
              gap: 2,
              mt: 2,
              borderRadius: 10,
            }}
          >
            <Typography level="h1">Log In</Typography>
            <Typography sx={{ mb: 2 }}>
              Login using Leetcode credentials to continue
            </Typography>
            <TextField
              variant="soft"
              // label="Username or Email"
              placeholder="Username or Email"
              onChange={(e) => setUser(e.target.value)}
              autoFocus
              disabled={loading}
            />
            <TextField
              // label="Password"
              variant="soft"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              endDecorator={
                <IconButton
                  variant="plain"
                  onClick={() => setShowPassword((prev) => !prev)}
                  onMouseDown={(e) => e.preventDefault}
                  sx={{ color: "white" }}
                >
                  {showPassword ? (
                    <VisibilityOutlined />
                  ) : (
                    <VisibilityOffOutlined />
                  )}
                </IconButton>
              }
              sx={{ mb: 1 }}
            />
            {error && (
              <Typography textColor="red" textAlign="center">
                bad login, check credentials
              </Typography>
            )}
            <Button
              type="submit"
              variant="solid"
              endDecorator={<ArrowForwardOutlined />}
              loading={loading}
              onClick={handleLogin}
              disabled={!user || !password}
            >
              Login
            </Button>
            <Stack direction="row" spacing={2} flexGrow={1}>
              <Button
                variant="soft"
                color="neutral"
                sx={{ width: "100%" }}
                // endDecorator={<QuestionMarkOutlined fontSize="md" />}
                onClick={(e) => {
                  e.preventDefault()
                  window.open(
                    "https://leetcode.com/accounts/password/reset/",
                    "_blank"
                  )
                }}
              >
                Forgot Password
              </Button>
              <Button
                variant="soft"
                color="neutral"
                sx={{ width: "100%" }}
                onClick={(e) => {
                  e.preventDefault()
                  window.open("https://leetcode.com/accounts/signup/", "_blank")
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </Sheet>
        </form>
      </div>
    </>
  )
}
