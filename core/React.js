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

/**
 * 
 * @param {*} el 
 * @param {*} container 父级容器 
 * 函数的主入口
 */
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el]
    }
  }
  root = nextWorkOfUnit
}

/**
 * 问题：DOM特别大，导致渲染卡顿
 * 解决思路：把大任务拆分到多个task里完成
 * 实现：采用requestIdleCallback分帧计算
 * @param {*} deadline 
 */
let root = null
let nextWorkOfUnit = null // 当前的任务
function workLoop(deadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = preformWorkOfUnit(nextWorkOfUnit) // 返回下一个任务
    shouldYield = deadline.timeRemaining() < 1
  }
  // 下个任务没有值，就代表链表已经处理完了
  if (!nextWorkOfUnit && root) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

function commitRoot() {
  // console.log(root)
  commitWork(root.child)
  root = null
}

function commitWork(fiber) {
  if (!fiber) return
  fiber.parent.dom.append(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
function createDom(type) {
  return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type)
}

function updateProps(dom, props) {
  Object.keys(props).forEach(key => {
    if (key !== "children") {
      dom[key] = props[key]
    }
  })
}

function initChildren(fiber) {
  const children = fiber.props.children
  let prevChild = null
  children.forEach((child, index) => {
    // !! 后续需要找叔叔节点或者父亲节点，可以把属性在加child中，但是这样子是不合理的，会破坏我们原来的dom结构
    // 所以构造了一个当前节点
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
      dom: null
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber // 赋值兄弟节点
    }
    prevChild = newFiber // 更新上一个节点
  })
}
/**
 * 
 * @param {*} fiber  // 当前任务
 * @return {nextWorkOfUnit} //下一个要执行的work ==> dom 结构
 */
function preformWorkOfUnit(fiber) {
  // 这里主要处理非首次渲染，因为首次渲染有一个根Dom
  if (!fiber.dom) {
    // 1. 创建dom // !创建了一个真实DOM
    const dom = fiber.dom = createDom(fiber.type)
    // 2. 处理props 
    updateProps(dom, fiber.props)
  }

  // 3. 转换链表，建立关系，设置好指针
  initChildren(fiber)

  // 4. 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child
  }
  if (fiber.sibling) {
    return fiber.sibling
  }
  return fiber.parent?.sibling
}

requestIdleCallback(workLoop)

const React = {
  render,
  createElement
}
export default React
