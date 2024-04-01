const createTextNode = (str) => {
  return {
    type: 'text',
    props: {
      nodeValue: str,
    },
  }
}

const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
    },
    children: children.map((child) => {
      const isText = typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean'
      return isText ? createTextNode(child) : child
    }),
  }
}

let workgress = null

let rootFiber = null

const isFunc = (component) => {
  return typeof component === 'function'
}

const hasDomParent = (parent) => {
  while (!parent.dom) {
    parent = parent.parent
  }
  return parent
}
const render = (el, container) => {
  workgress = {
    props: null,
    dom: container,
    children: [el],
    root: true,
    alternate: null,
  }

  rootFiber = workgress
}

const updater = () => {
  const currentFiber = workgress
  return function () {
    workgress = {
      ...currentFiber,
      alternate: currentFiber,
    }
    rootFiber = workgress
  }
}

const createDom = (fiber) => {
  return fiber.dom ? fiber.dom : fiber.type === 'text' ? document.createTextNode('') : document.createElement(fiber.type)
}

const isSameType = (newFiber, oldFiber) => {
  return newFiber.type === oldFiber?.type
}

const addDelets = (fiber, oldChildFiber) => {
  const parent = hasDomParent(fiber)
  parent.deletes = parent.deletes || []
  parent.deletes.push(isFunc(oldChildFiber) ? oldChildFiber?.dom : oldChildFiber?.headChildFiber.dom)
}

const initChildren = (fiber) => {
  const children = fiber.children || new Array()
  let preChild = Object.create(null)
  let oldChildFiber = fiber.alternate?.headChildFiber
  let childFiber = null
  children.forEach((child, index) => {
    if (isSameType(child, oldChildFiber)) {
      childFiber = {
        ...child,
        dom: oldChildFiber?.dom,
        parent: fiber,
        headChildFiber: null,
        effectTags: 'update',
        alternate: oldChildFiber,
      }
    } else {
      childFiber = { ...child, dom: null, sbling: null, parent: fiber, headChildFiber: null }
      if (oldChildFiber) {
        addDelets(fiber, oldChildFiber)
        childFiber.effectTags = 'placement'
      }
    }
    preChild.sbling = index === 0 ? null : childFiber
    if (index === 0) fiber.headChildFiber = childFiber
    preChild = childFiber
    oldChildFiber = oldChildFiber?.sbling
    //   render(child, dom)
  })
  while (oldChildFiber) {
    addDelets(fiber, oldChildFiber)
    oldChildFiber = oldChildFiber.sbling
  }
  return children
}

const updateFunctionComponent = (fiber) => {
  const children = fiber.type(fiber.props)
  fiber.children = [children]
  fiber.dom = null
  effectStateIndex = 0
  effectStates = []
  effectsHooks = []
  effectsHooksIndex = 0
}

const updateClassComponet = (fiber) => {
  if (!fiber.dom) {
    const dom = createDom(fiber)
    fiber.dom = dom
  }
}
const begainWork = (fiber) => {
  isFunc(fiber.type) ? updateFunctionComponent(fiber) : updateClassComponet(fiber)
  fiber.children = initChildren(fiber)
  if (fiber.headChildFiber) return fiber.headChildFiber
  if (fiber.sbling) return fiber.sbling
  let parent = fiber.parent
  while (parent) {
    if (parent.sbling) {
      return parent.sbling
    }
    parent = parent.parent
  }
  return undefined
}

const performanceUnit = () => {
  while (workgress) {
    workgress = begainWork(workgress)
  }
  return workgress
}
function hasDiffDep(deps, fiber, index) {
  if (!fiber.alternate) return true
  if (deps.length === 0) return false
  return deps.some((dep, idx) => dep !== fiber?.alternate?.effectsHooks[index]?.deps[idx])
}
function run(currentFiber) {
  if (!currentFiber) return
  currentFiber?.effectsHooks?.forEach((effect, index) => {
    let { callback, deps } = effect
    const needCallback = Array.isArray(deps) && deps.length >= 0 && hasDiffDep(deps, currentFiber, index)
    needCallback && (effect.cleanUp = callback())
  })

  run(currentFiber.headChildFiber)
  run(currentFiber.sbling)
}
function runCleanUp(currentFiber) {
  if (!currentFiber) return
  const oldFiber = currentFiber.alternate
  oldFiber?.effectsHooks?.forEach(({ cleanUp }) => cleanUp && cleanUp())
  runCleanUp(currentFiber.headChildFiber)
  runCleanUp(currentFiber.sbling)
}

function effectActions(fiber) {
  runCleanUp(fiber)
  run(fiber)
}

const requestAnimationDom = function (fiber) {
  requestAnimationFrame(function () {
    commitRoot(fiber)
    effectActions(fiber)
  })
}

// const commitFiber = (fiber) => {
//   if (!fiber) return
//   const { children } = fiber
//   let childFiber = fiber.headChildFiber
//   children?.forEach(() => {
//     childFiber.dom = updateDomProps(childFiber, childFiber.dom)
//     fiber.dom.append(childFiber.dom)
//     commitFiber(childFiber)
//     if (childFiber.sbling) childFiber = childFiber.sbling
//   })
// }
const updateDomProps = (fiber, dom) => {
  if (!dom) {
    Object.keys(fiber.props).forEach((key) => {
      if (key.startsWith('on')) {
        fiber.headChildFiber.props[key] = fiber.props[key]
      }
    })
    return null
  }

  const props = fiber.props || Object.create(null)
  Object.keys(props).forEach((key) => {
    if (key.startsWith('on')) {
      const evenName = key.slice(2).toLowerCase()
      dom.removeEventListener(evenName, fiber.alternate?.props[key])
      dom.addEventListener(evenName, props[key])
    } else if (key === 'style') {
      const styles = props.style
      Object.keys(props.style).forEach((styleKey) => {
        dom.style[styleKey] = styles[styleKey]
      })
    } else {
      dom[key] = props[key]
    }
  })
  let deletes = fiber.deletes
  if (deletes) {
    deletes.forEach((childDom) => {
      childDom.parentNode.removeChild(childDom)
    })
    deletes = null
  }
  return dom
}

const commitLoopFiber = (fiber) => {
  if (!fiber) return
  fiber.dom = updateDomProps(fiber, fiber.dom)
  if (fiber.dom) {
    let parent = fiber.parent
    while (!parent.dom) {
      parent = parent.parent
    }
    if (fiber.effectTags === 'update') {
    } else {
      parent.dom.append(fiber.dom)
    }
  }
  commitLoopFiber(fiber.headChildFiber)
  commitLoopFiber(fiber.sbling)
}

const commitRoot = (root) => {
  commitLoopFiber(root.headChildFiber)
}

let needCommit = true
function workLoop(deadline) {
  let shouldYaild = true

  while (shouldYaild && workgress) {
    shouldYaild = deadline.timeRemaining() > 1
    workgress = performanceUnit()
    console.log('////', '000')
    if (!workgress) needCommit = true
  }

  if (!workgress && needCommit) {
    console.log('commit')
    requestAnimationDom(rootFiber)
    needCommit = false
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

let effectStates = []
let effectStateIndex = 0
const useState = (initialValue) => {
  const currentFiber = workgress
  const oldFiber = workgress.alternate
  console.log('??')
  let effect = {
    state: oldFiber?.effectStates[effectStateIndex].state || initialValue,
    quque: oldFiber?.effectStates[effectStateIndex].quque || [],
  }
  effectStateIndex++
  effect.quque.forEach((cb, index) => {
    effect.state = cb(effect.state)
  })
  effect.quque = []
  effectStates.push(effect)

  currentFiber.effectStates = effectStates

  const setState = function (callback) {
    const cb = typeof callback === 'function' ? callback : () => callback
    if (cb(effect.state) === effect.state) return
    effect.quque.push(cb)
    // effect.state = cb(effect.state)
    console.log(effectStateIndex)
    workgress = {
      ...currentFiber,
      alternate: currentFiber,
    }
    rootFiber = workgress
  }

  return [effect.state, setState]
}

let effectsHooks = []
let effectsHooksIndex = 0
const useEffect = (callback, deps) => {
  const currentFiber = workgress

  const effect = {
    deps,
    callback,
    cleanUp: currentFiber?.alternate?.effectsHooks[effectsHooksIndex]?.cleanUp,
  }

  effectsHooks.push(effect)
  effectsHooksIndex++
  currentFiber.effectsHooks = effectsHooks
}

export default { createTextNode, createElement, render, updater, useState, useEffect }
