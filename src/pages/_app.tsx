import { CssBaseline, CssVarsProvider } from "@mui/joy"
import { SessionProvider } from "next-auth/react"
import { ToastContainer } from "react-toastify"

import theme from "@/styles/theme"

import type { AppProps } from "next/app"

import "@fontsource/roboto/300.css"
import "@fontsource/roboto/400.css"
import "@fontsource/roboto/500.css"
import "@fontsource/roboto/700.css"
import "@fontsource/public-sans"
import "react-toastify/dist/ReactToastify.css"
import "@/styles/global.css"
import "@/styles/split.css"

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />
// }

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <CssVarsProvider defaultMode="dark" theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
        <ToastContainer />
      </CssVarsProvider>
    </SessionProvider>
  )
}
