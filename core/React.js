const createTextNode = (str) => {
  return {
    type: 'text',
    props: {
      nodeValue: str,
    },
  }
}

const createElementNode = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children,
    },
  }
}

export { createTextNode, createElementNode }
