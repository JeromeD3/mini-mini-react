import React from './core/React.js'

function Counter() {
  const [count, setCount] = React.useState(11)
  React.useEffect(() => {
    console.log('update')
  }, [])

  function handleClick() {
    setCount((c) => c + 1)
  }
  return (
    <div>
      {count}
      <button onClick={handleClick}>showbar</button>
    </div>
  )
}

function App() {
  return <Counter />
}

// React.createElement("div", {
//   id: "app"
// }, "ddddiv")
export default App
