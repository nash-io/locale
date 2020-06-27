// Code migrated from https://unpkg.com/browse/traverse@0.6.6/index.js

export default function traverse(obj: object) {
  return {
    get: function (ps: string[]) {
      let node: any = obj
      for (let i = 0; i < ps.length; i++) {
        const key = ps[i]
        if (!node || !Object.hasOwnProperty.call(node, key)) {
          return undefined
        }
        node = node[key]
      }
      return node
    },

    has: function (ps: string[]) {
      let node: any = obj
      for (let i = 0; i < ps.length; i++) {
        const key = ps[i]
        if (!node || !Object.hasOwnProperty.call(node, key)) {
          return false
        }
        node = node[key]
      }
      return true
    },

    set: function (ps: string[], value: unknown) {
      let node: any = obj
      for (let i = 0; i < ps.length - 1; i++) {
        const key = ps[i]
        if (!Object.hasOwnProperty.call(node, key)) {
          node[key] = {}
        }
        node = node[key]
      }
      node[ps[ps.length - 1]] = value
      return value
    },

    map: function (cb: WalkerCallback) {
      return walk(obj, cb, true)
    },

    forEach: function (cb: WalkerCallback) {
      obj = walk(obj, cb, false)
      return obj
    },

    clone: function () {
      let parents: object[] = []
      let nodes: object[] = []

      return (function clone(src) {
        for (let i = 0; i < parents.length; i++) {
          if (parents[i] === src) {
            return nodes[i]
          }
        }

        if (typeof src !== 'object' || src === null) {
          return src
        }

        const dst = copy(src)

        parents.push(src)
        nodes.push(dst)

        Object.keys(src).forEach((key) => {
          dst[key] = clone((src as any)[key])
        })

        parents.pop()
        nodes.pop()

        return dst
      })(obj)
    },
  }
}

export type Traversal = ReturnType<typeof traverse>

export type WalkerCallback = (state: TraversalState, node: unknown) => void

interface TraversalState {
  node: object
  node_: object
  path: string[]
  parent: TraversalState
  parents: TraversalState[]
  key: string
  keys: string[] | null
  isRoot: boolean
  isLeaf: boolean
  isFirst: boolean
  isLast: boolean
  level: number
  circular: TraversalState | null
  update: (x: unknown, stopHere?: boolean) => void
  delete: (stopHere: boolean) => void
  remove: (stopHere: boolean) => void
  before: (f: WalkerCallback) => void
  after: (f: WalkerCallback) => void
  stop: () => void
  block: () => void
}

function walk(root: object, cb: WalkerCallback, immutable: boolean) {
  let path: string[] = []
  let parents: TraversalState[] = []
  let alive = true

  return (function walker(node_) {
    let node = immutable ? copy(node_) : node_
    let modifiers: Record<'before' | 'after', WalkerCallback | null> = {
      before: null,
      after: null,
    }

    let keepGoing = true

    let state: TraversalState = {
      node: node,
      node_: node_,
      path: [].concat(path as any),
      parent: parents[parents.length - 1],
      parents: parents,
      key: path.slice(-1)[0],
      keys: null,
      isRoot: path.length === 0,
      isLeaf: false,
      isFirst: false,
      isLast: false,
      level: path.length,
      circular: null,
      update: function (x, stopHere) {
        if (!state.isRoot) {
          ;(state.parent.node as any)[state.key] = x
        }
        ;(state.node as any) = x
        if (stopHere) keepGoing = false
      },
      delete: function (stopHere: boolean) {
        delete (state.parent.node as any)[state.key]
        if (stopHere) keepGoing = false
      },
      remove: function (stopHere: boolean) {
        if (Array.isArray(state.parent.node)) {
          state.parent.node.splice(parseInt(state.key, 10), 1)
        } else {
          delete (state.parent.node as any)[state.key]
        }
        if (stopHere) keepGoing = false
      },
      before: function (f) {
        modifiers.before = f
      },
      after: function (f) {
        modifiers.after = f
      },
      stop: function () {
        alive = false
      },
      block: function () {
        keepGoing = false
      },
    }

    if (!alive) return state

    function updateState() {
      if (typeof state.node === 'object' && state.node !== null) {
        if (!state.keys || state.node_ !== state.node) {
          state.keys = Object.keys(state.node)
        }

        state.isLeaf = state.keys.length == 0

        for (var i = 0; i < parents.length; i++) {
          if (parents[i].node_ === node_) {
            state.circular = parents[i]
            break
          }
        }
      } else {
        state.isLeaf = true
        state.keys = null
      }
    }

    updateState()

    // use return values to update if defined
    var ret = cb(state, state.node)
    if (ret !== undefined && state.update) state.update(ret)

    if (modifiers.before) modifiers.before(state, state.node)

    if (!keepGoing) return state

    if (
      typeof state.node == 'object' &&
      state.node !== null &&
      !state.circular
    ) {
      parents.push(state)

      updateState()

      if (state.keys) {
        state.keys.forEach((key, i, arr) => {
          path.push(key)

          var child = walker((state.node as any)[key])
          if (immutable && Object.hasOwnProperty.call(state.node, key)) {
            ;(state.node as any)[key] = child.node
          }

          child.isLast = i === arr.length - 1
          child.isFirst = i === 0

          path.pop()
        })
      }
      parents.pop()
    }

    if (modifiers.after) modifiers.after(state, state.node)

    return state
  })(root).node
}

function copy(src: any) {
  if (src === null || typeof src !== 'object') {
    return src
  }

  let dst: any = null

  if (Array.isArray(src)) {
    dst = []
  } else if (isDate(src)) {
    dst = new Date(src.getTime ? src.getTime() : src)
  } else if (isRegExp(src)) {
    dst = new RegExp(src)
  } else if (isError(src)) {
    dst = { message: src.message }
  } else if (isBoolean(src)) {
    dst = new Boolean(src)
  } else if (isNumber(src)) {
    dst = new Number(src)
  } else if (isString(src)) {
    dst = new String(src)
  } else {
    dst = Object.create(Object.getPrototypeOf(src))
  }

  Object.keys(src).forEach((key) => {
    dst[key] = src[key]
  })

  return dst
}

function getTypeDef(obj: unknown) {
  return Object.prototype.toString.call(obj)
}
function isDate(obj: unknown): obj is Date {
  return getTypeDef(obj) === '[object Date]'
}
function isRegExp(obj: unknown): obj is RegExp {
  return getTypeDef(obj) === '[object RegExp]'
}
function isError(obj: unknown): obj is Error {
  return getTypeDef(obj) === '[object Error]'
}
function isBoolean(obj: unknown): obj is boolean {
  return getTypeDef(obj) === '[object Boolean]'
}
function isNumber(obj: unknown): obj is number {
  return getTypeDef(obj) === '[object Number]'
}
function isString(obj: unknown): obj is string {
  return getTypeDef(obj) === '[object String]'
}
