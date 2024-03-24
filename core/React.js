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
      return typeof child === 'string' ? createTextNode(child) : child
    }),
  }
}

export default { createTextNode, createElement }
