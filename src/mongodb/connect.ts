import mongoose, { connection, set } from "mongoose"

const MONGODB_URL = process.env.MONGODB_URL || ""

if (!MONGODB_URL) {
  throw new Error(
    "Please define the MONGODB_URL environment variable inside .env"
  )
}

async function mongooseConnect() {
  // ensure we do not create connection multiple times
  if (connection.readyState === 1) {
    console.log("alr have mongoose connection")
    return
  } else if (connection.readyState === 0 || connection.readyState === 99) {
    console.log("attempting to connect to mongoose...")
    try {
      const opts = {
        bufferCommands: false,
      }
      await mongoose.connect(MONGODB_URL, {
        bufferCommands: false,
        dbName: "mydb",
      })
      set("strictQuery", false)
      console.log("connected to mongoose!")
    } catch (e) {
      console.error("Error connecting to mongodb :(")
      throw new Error("Error connecting to mongodb :(")
    }
  }
}

export default mongooseConnect
