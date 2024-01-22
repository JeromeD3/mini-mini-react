import React from './core/React.js'

function Counter() {
  const [count, setCount] = React.useState(11)
  const [bar, setBar] = React.useState('bar')

  React.useEffect(() => {
    console.log('init')
    return () => {
      console.log('clean1')
    }
  }, [])

  React.useEffect(() => {
    console.log(count, bar)
    return () => {
      console.log('clean2')
    }
  }, [count])

  React.useEffect(() => {
    console.log(count, bar)
    return () => {
      console.log('clean3')
    }
  }, [count])
  function handleClick() {
    setCount((c) => c + 1)
    setBar(() => 'dd')
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
