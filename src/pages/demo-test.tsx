import dynamic from "next/dynamic"
import { useRef } from "react"

import handleSubmit from "../handlesubmit"

function App2() {
  const dataRef = useRef<any>()
  const submithandler = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    handleSubmit(dataRef.current.value)
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
