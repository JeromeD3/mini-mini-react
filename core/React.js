// v1
// const dom = document.createElement('div')
// dom.id = 'app'
// document.querySelector("#root").append(dom)


// const textNode = document.createTextNode("")
// textNode.nodeValue = "app"
// dom.append(textNode)

// v2 react -> vdom ->js object
// 1. 一个dom所要考虑的点是，它有哪些属性
// - 标签type
// - props -> 属性
// - 子节点

function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
    }
  }
}

function render(el, container) {
  const dom = el.type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(el.type)

  Object.keys(el.props).forEach(key => {
    if (key !== "children") {
      dom[key] = el.props[key]
    }
  })

  const children = el.props.children
  children.forEach(child => render(child, dom))
  container.append(dom)
}

const React = {
  render,
  createElement
}
export default React
