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
      children: children.map(child => {
        const isTextNode = typeof child === 'string' || typeof child === 'number'
        return isTextNode ? createTextNode(child) : child
      })
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
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
  }
  nextWorkOfUnit = wipRoot
}

/**
 * 问题：DOM特别大，导致渲染卡顿
 * 解决思路：把大任务拆分到多个task里完成
 * 实现：采用requestIdleCallback分帧计算
 * @param {*} deadline 
 */
let wipRoot = null
let currentRoot = null
let nextWorkOfUnit = null // 当前的任务
let deltetions = []
let wipFiber = null
function workLoop(deadline) {
  let shouldYield = false
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit) // 返回下一个任务

    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined
    }
    shouldYield = deadline.timeRemaining() < 1
  }
  // 下个任务没有值，就代表链表已经处理完了
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }
  requestIdleCallback(workLoop)
}

function commitRoot() {
  deltetions.forEach(commitDeletion)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
  deltetions = []
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent

    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent
    }

    fiberParent.dom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child)
  }
}
function commitWork(fiber) {
  if (!fiber) return
  let fiberParent = fiber.parent

  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent
  }

  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props)
  }
  else if (fiber.effectTag === 'placement') {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom)
    }
  }


  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
function createDom(type) {
  return type === "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(type)
}

function updateProps(dom, nextProps, prevProps) {
  // 1. old 有new 没有删除
  Object.keys(prevProps).forEach(key => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAttribute(key)
      }
    }
  })
  // 2. new 有old 没有添加
  // 3. new有old 有修改
  Object.keys(nextProps).forEach(key => {
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith('on')) {
          const eventType = key.slice(2).toLowerCase()

          dom.removeEventListener(eventType, prevProps[key])
          dom.addEventListener(eventType, nextProps[key])
        } else {
          dom[key] = nextProps[key]
        }
      }

    }
  })

}

function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child
  let prevChild = null

  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type

    let newFiber
    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: 'update',
        alternate: oldFiber
      }
      // update
    } else {
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          dom: null,
          effectTag: 'placement',
        }
      }

      if (oldFiber) {
        deltetions.push(oldFiber)
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }
    // !! 后续需要找叔叔节点或者父亲节点，可以把属性在加child中，但是这样子是不合理的，会破坏我们原来的dom结构

    // 所以构造了一个当前节点
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevChild.sibling = newFiber // 赋值兄弟节点
    }
    if (newFiber) {
      prevChild = newFiber // 更新上一个节点
    }

  })

  while (oldFiber) {
    deltetions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

function updateFunctionComponent(fiber) {
  wipFiber
    = fiber
  const children = [fiber.type(fiber.props)]
  // 3. 转换链表，建立关系，设置好指针
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    // 1. 创建dom // !创建了一个真实DOM
    const dom = fiber.dom = createDom(fiber.type)
    // 2. 处理props 
    updateProps(dom, fiber.props, {})
  }

  const children = fiber.props.children
  reconcileChildren(fiber, children)
}
/**
 * 
 * @param {*} fiber  // 当前任务
 * @return {nextWorkOfUnit} //下一个要执行的work ==> dom 结构
 */
function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function'

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // 4. 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child
  }
  if (fiber.sibling) {
    return fiber.sibling
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.parent && nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

requestIdleCallback(workLoop)

function update() {
  let currentFiber = wipFiber

  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }

    nextWorkOfUnit = wipRoot
  }

}
const React = {
  render,
  createElement,
  update
}
export default React
