let workgress = null
let statusRefreshScheduled = false

const render = (el, container) => {
  workgress = {
    ...el,
    dom: null,
    headChildFiber: null,
    parent: { dom: container },
    sbling: null,
  }

  function workLoop(deadline) {
    let shouldYaild = true
    while (shouldYaild && workgress) {
      shouldYaild = deadline.timeRemaining() > 1
      workgress = performanceUnit(workgress)
    }
  }

  requestIdleCallback(workLoop)
}

const begainWork = (fiber) => {
  const dom = fiber.type === 'text' ? document.createTextNode('') : document.createElement(fiber.type)
  const props = fiber.props || Object.create(null)
  const children = fiber.children || new Array()
  Object.keys(props).forEach((key) => {
    dom[key] = fiber.props[key]
  })
  fiber.dom = dom
  let preChild = {}
  children.forEach((child, index) => {
    const childFiber = { ...child, dom: null, sbling: null, parent: fiber, headChildFiber: null }
    preChild.sbling = index === 0 ? null : childFiber
    if (index === 0) fiber.headChildFiber = childFiber
    preChild = childFiber
    //   render(child, dom)
  })

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

const performanceUnit = (work) => {
  let nextWork = null
  while (work) {
    nextWork = begainWork(work)
    if (work) updateDom(work)
    work = nextWork
  }
  return work
}

const updateDom = function (fiber) {
  ;(function (fiber) {
    requestAnimationFrame(function () {
      fiber.parent.dom.append(fiber.dom)
    })
  })(fiber)
}

const ReactDOM = {
  createRoot: (container) => {
    return {
      render: (el) => {
        render(el, container)
      },
    }
  },
}

export { ReactDOM }
