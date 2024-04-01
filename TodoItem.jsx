import React from './core/React'
function TodoItem(props) {
  const { key, name, finishState, finish, del } = props

  const handleRecover = () => {
    finish(key, false)
  }
  const handleFinish = () => {
    finish(key, true)
  }
  const handleDelete = () => {
    del(key)
  }
  return (
    <div>
      <span style={{ textDecoration: finishState ? 'line-through' : 'none' }}>{name}</span>
      <button onClick={handleDelete}>删除</button>
      {finishState ? <button onClick={handleRecover}>恢复</button> : <button onClick={handleFinish}>完成</button>}
    </div>
  )
}

export default TodoItem
