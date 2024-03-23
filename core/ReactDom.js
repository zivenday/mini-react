const render = (el, container) => {
  const dom = el.type === 'text' ? document.createTextNode('') : document.createElement(el.type)

  const props = el.props || Object.create(null)
  const children = el.props.children || new Array()

  Object.keys(props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = el.props[key]
    }
  })

  children.forEach((child) => {
    render(child, dom)
  })

  container.append(dom)
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
