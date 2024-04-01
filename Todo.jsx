import React from './core/React'
import TodoItem from './TodoItem'

function Todo(params) {
  const [todos, setTodos] = React.useState()
  const [value, setValue] = React.useState('')
  const [filter, setFilter] = React.useState('All')
  const [showTodos, setShowTodos] = React.useState([])
  const handleAdd = () => {
    if (!value) return
    todos.push({
      key: window.performance.now(),
      name: value,
      finishState: false,
    })

    setTodos(() => [...todos])
    setValue('')
  }
  const handleInputChange = (e) => {
    setValue(e?.target?.value)
  }

  const handleDelect = (key) => {
    if (!key) return
    setTodos((todos) => {
      return [...todos.filter((todo) => todo.key !== key)]
    })
  }
  const handleFinish = (key, bool) => {
    if (!key) return
    setTodos((todos) => {
      todos.forEach((todo) => {
        if (todo.key === key) {
          todo.finishState = bool
        }
      })
      return [...todos]
    })
  }
  console.log('todos', todos)
  const handleFilter = (e) => {
    console.log('///', e?.target.value || e?.target.for)
    setFilter(e?.target.value || e?.target.for)
  }
  React.useEffect(() => {
    const rtodos = JSON.parse(localStorage.getItem('mini-react-todos'))
    setTodos(rtodos || [])
  }, [])
  React.useEffect(() => {
    localStorage.setItem('mini-react-todos', JSON.stringify(todos))
    setShowTodos(() => [...(filter === 'All' ? todos : todos?.filter((todo) => todo.finishState === (filter === 'Finished')))])
  }, [todos, filter])

  return (
    <div>
      <div>
        <input placeholder="请输入任务名称" value={value} onChange={handleInputChange} />
        <button onClick={handleAdd}>add</button>
      </div>
      <div onClick={handleFilter}>
        <span>
          <input type="radio" id="All" name="contact" value="All" checked={filter === 'All'} />
          <label for="All">All</label>
        </span>
        <span>
          <input type="radio" id="contactChoice2" name="contact" value="Finished" checked={filter === 'Finished'} />
          <label for="Finished">Finished</label>
        </span>

        <span>
          <input type="radio" id="contactChoice3" name="contact" value="ToFinish" checked={filter === 'ToFinish'} />
          <label for="ToFinish">ToFinish</label>
        </span>
      </div>
      <div>{...showTodos?.map((todo) => <TodoItem {...todo} key={todo.key} del={handleDelect} finish={handleFinish}></TodoItem>)}</div>
    </div>
  )
}

export default Todo
