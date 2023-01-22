/* eslint-disable no-var */
import { Browser, Builder, until } from "selenium-webdriver"
import { Options } from "selenium-webdriver/firefox"

import type { ThenableWebDriver } from "selenium-webdriver"

const MAX_WORKERS = 2
// const MAX_WORKERS = 1
const workers: ThenableWebDriver[] = []
const workersAvailable: number[] = []
const queue: (() => void)[] = []

const options = new Options()
options.headless()
options.addArguments("--new-instance")
for (let i = 0; i < MAX_WORKERS; i++) {
  workers.push(
    new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build()
  )
  workersAvailable.push(i)
}

console.log("i shud run once!")
console.log("available workers", workersAvailable)

function jobFinished(workerId: number) {
  console.log("done worker", workerId)
  workersAvailable.push(workerId)
  // run next in queue
  const cb = queue.shift()
  if (!!cb) {
    cb()
  }
}
// Given username/email and password, gets tokens needed to use leetcode stuff (queues it up)
export async function login(
  user: string,
  password: string
): Promise<
  | {
      csrf: string
      lcSession: string
      expiry: number
    }
  | undefined
> {
  const workerId = workersAvailable.shift()
  if (workerId === undefined) {
    console.log("gotta queue up", user)
    return new Promise((res) => {
      queue.push(async () => {
        const x = await login2(user, password)
        res(x)
      })
    })
  } else {
    console.log("lc login time for", user)
    console.log("using worker", workerId)
    try {
      // ensure driver is open by chekcing url
      workers[workerId].getCurrentUrl()
    } catch {
      // recreate driver if it is down
      workers[workerId] = new Builder()
        .forBrowser(Browser.FIREFOX)
        .setFirefoxOptions(options)
        .build()
      console.log("had to build worker again")
    }
    const driver = workers[workerId]
    try {
      await driver.manage().deleteAllCookies()
      console.log("- ok 1", user)
      await driver.get("https://leetcode.com/accounts/login")
      console.log("- ok 2", user)
      // get inputs and fill them in
      await driver.wait(until.elementLocated({ id: "id_login" }))
      console.log("- ok 3", user)
      await driver.findElement({ id: "id_login" }).sendKeys(user)
      await driver.findElement({ id: "id_password" }).sendKeys(password)
      await driver.executeScript(
        "document.getElementById('signin_btn').click()"
      )
      console.log("- ok 4", user)
    } catch (e) {
      console.log("bad 1", user, e)
      jobFinished(workerId)
      return undefined
    }

    // ensure we're on the next page before attempting to get tokens
    try {
      await driver.wait(until.urlIs("https://leetcode.com/"), 5000)
      console.log("- ok 5", user)
    } catch (e) {
      console.log("bad 2 login", user, e)
      // const img = await driver.takeScreenshot()
      // writeFile("capture.png", img, {encoding: "base64"}, (e) => {
      //   if (!e) console.log("check capture.png")
      //   else console.log("could not create capture.png")
      // })
      jobFinished(workerId)
      return undefined
    }

    try {
      // get tokens from cookies
      const csrfCookie = await driver.manage().getCookie("csrftoken")
      const lcSessionCookie = await driver
        .manage()
        .getCookie("LEETCODE_SESSION")
      console.log("- ok 6", user)
      const csrf = csrfCookie.value
      const lcSession = lcSessionCookie.value
      const expiry = lcSessionCookie.expiry
      console.log("- ok 7", user)
      if (!csrf || !lcSession || !expiry) {
        jobFinished(workerId)
        return undefined
      }
      console.log("okok think we gucci", user)
      jobFinished(workerId)
      return { csrf, lcSession, expiry }
    } catch (e) {
      console.log("bad 3", user, e)
      jobFinished(workerId)
      return undefined
    }
  }
}

// Given username/email and password, gets tokens needed to use leetcode stuff
export async function login2(
  user: string,
  password: string
): Promise<
  | {
      csrf: string
      lcSession: string
      expiry: number
    }
  | undefined
> {
  // simulate webpage (workaround recaptcha)
  // run in headless mode to avoid unnecessary windows
  console.log("lc login time for", user)
  try {
    const options = new Options()
    options.headless()
    var driver = new Builder()
      .forBrowser(Browser.FIREFOX)
      .setFirefoxOptions(options)
      .build()
    console.log("- ok 1", user)
    await driver.get("https://leetcode.com/accounts/login")
    console.log("- ok 2", user)
    // get inputs and fill them in
    await driver.wait(until.elementLocated({ id: "id_login" }))
    console.log("- ok 3", user)
    await driver.findElement({ id: "id_login" }).sendKeys(user)
    await driver.findElement({ id: "id_password" }).sendKeys(password)
    await driver.executeScript("document.getElementById('signin_btn').click()")
    console.log("- ok 4", user)
  } catch (e) {
    console.log("bad 1", user, e)
    return undefined
  }
  // ensure we're on the next page before attempting to get tokens
  try {
    await driver.wait(until.urlIs("https://leetcode.com/"), 5000)
    console.log("- ok 5", user)
  } catch (e) {
    console.log("bad 2 login", user, e)
    // const img = await driver.takeScreenshot()
    // // const b = Buffer.from(img[2], "base64")
    // writeFile("capture.png", img, {encoding: "base64"}, (e) => {
    //   if (!e) console.log("check capture.png")
    //   else console.log("could not create capture.png")
    // })
    await driver.quit()
    return undefined
  }

  try {
    // get tokens
    const csrfCookie = await driver.manage().getCookie("csrftoken")
    const lcSessionCookie = await driver.manage().getCookie("LEETCODE_SESSION")
    console.log("- ok 6", user)
    const csrf = csrfCookie.value
    const lcSession = lcSessionCookie.value
    const expiry = lcSessionCookie.expiry
    // cleanup
    await driver.manage().deleteAllCookies()
    console.log("- ok 7", user)
    await driver.quit()
    console.log("- ok 8", user)
    if (!csrf || !lcSession || !expiry) return undefined
    console.log("okok think we gucci", user)
    return { csrf, lcSession, expiry }
  } catch (e) {
    console.log("bad 3", user, e)
    await driver.quit()
    return undefined
  }
}
