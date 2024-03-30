import React from './core/React.js'
let num = false
const Count = ({ num }) => {
  return <div>{num}</div>
}

const App = function () {
  const update = React.updater()
  const [count, setCount] = React.useState(10)
  const [tips, setTips] = React.useState('init')

  React.useEffect(() => {
    console.log('efect.init')
    return () => {
      console.log('clean up')
    }
  }, [tips])

  React.useEffect(() => {
    console.log('efect.count')
    return () => {
      console.log('clean up2')
    }
  }, [count])

  function handleClick() {
    num = !num
    console.log('///', num)
    console.log(update())
  }
  function handleClickSetState() {
    setCount((val) => ++val)
    setTips('update')
  }
  return (
    <div id="app">
      <button onClick={handleClick}>点击切换</button>
      <button onClick={handleClickSetState}>点击useState</button>
      {<div>useState{count}</div>}
      {<div>useState{tips}</div>}
      {num ? <Count num={num}></Count> : <div>false</div>}
    </div>
  )
}

export default App
