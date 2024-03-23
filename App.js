import { createElementNode, createTextNode } from './core/React.js'
const textEl = createTextNode('app')

const App = createElementNode('div', { id: 'app' }, textEl)

export default App
