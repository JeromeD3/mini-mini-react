import React from './core/React.js'

function Counter({ num }) {
  return <div>x2xx:{num}</div>
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
