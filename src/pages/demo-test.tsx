import dynamic from "next/dynamic"
import { useRef } from "react"

import handleSubmit from "../handlesubmit"

import RoomDataService from "@/firebase_setup/firebase_helper_services"

import type { RoomModelType, Settings } from "@/types/room"

function App2() {
  const dataRef = useRef<any>()
  const submithandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    // handleSubmit(dataRef.current.value)
    const setting = {
      mode: "string",
      // problem: Problem
      problem_tags: ["a", "b"],
      problem_difficulty: "string",
      problem_list_tag: "string2",
      number_of_questions: 3,
      time_limit: 4,
      time_limit_total: 7,
      leaderboard: true,
      show_submission_message: false,
      is_open: true,
    }
    const room = {
      room_settings: setting,
      question_queue: ["hello", "there"],
      member_list: ["hello", "there"],
      leaderboard: [{ string: 3 }, { "another string": 4 }],
      admin: "string",
      problem_complete_status: "stringu",
    }
    const room2 = {
      room_settings: setting,
      question_queue: ["A", "B"],
      member_list: ["C", "D"],
      leaderboard: [{ string: 3 }, { "another string": 4 }],
      admin: "string",
      problem_complete_status: "stringu",
    }
    // RoomDataService.addRooms("room9", room)
    console.log(1)
    console.log(await RoomDataService.deleteRoom("room7"))
    console.log(3)
    // RoomDataService.updateRoom("room6", room)
    // RoomDataService.deleteRoom("room6")
    // console.log(RoomDataService.getRoom("room5"))
    // console.log(RoomDataService.getRoom("room1"))

    dataRef.current.value = ""
  }
  // const foo = dynamic(import("../api/hello"), { ssr: false });
  return (
    <div className="App2">
      <form onSubmit={submithandler}>
        <input type="text" ref={dataRef} />
                <button type="submit">Save</button>
      </form>
    </div>
  )
}
export default App2
