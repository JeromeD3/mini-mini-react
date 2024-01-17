import React from './core/React.js'

let state = 0
let props = { id: '11111' }
function Counter({ num }) {
  function handleClick() {
    state++
    console.log('click', num)
    props = {}
    React.update()
  }
  return (
    <button onClick={handleClick} {...props}>
      count:{state}
      x2xx:{num}---{state}
    </button>
  )
}
function Counter2({ num }) {
  return (
    <div>
      <Counter num={num} />
      <Counter num={num} />
    </div>
  )
}

function App() {
  return <Counter2 num={10} />
}

// React.createElement("div", {
//   id: "app"
// }, "ddddiv")
export default App
