const cleanups = new WeakMap<Element, Map<string, () => void>>()

function set(element: Element, key: string, setup: () => () => void) {
  if (!cleanups.has(element)) {
    cleanups.set(element, new Map())
  }

  const elementCleanups = cleanups.get(element)!
  const prevCleanup = elementCleanups.get(key)

  if (!prevCleanup) {
    elementCleanups.set(key, setup())
    return () => {
      elementCleanups.get(key)?.()
      elementCleanups.delete(key)
    }
  }

  const cleanup = setup()

  const nextCleanup = () => {
    cleanup()
    prevCleanup()
    elementCleanups.delete(key)
  }

  elementCleanups.set(key, nextCleanup)

  return () => {
    const isCurrent = elementCleanups.get(key) === nextCleanup
    if (!isCurrent) return
    cleanup()
    elementCleanups.set(key, prevCleanup)
  }
}

export function setAttribute(element: Element, attr: string, value: string) {
  const setup = () => {
    const previousValue = element.getAttribute(attr)
    element.setAttribute(attr, value)
    return () => {
      if (previousValue == null) {
        element.removeAttribute(attr)
      } else {
        element.setAttribute(attr, previousValue)
      }
    }
  }

  return set(element, attr, setup)
}

export function setProperty<T extends Element, K extends keyof T & string>(element: T, property: K, value: T[K]) {
  const setup = () => {
    const exists = property in element
    const previousValue = element[property]
    element[property] = value
    return () => {
      if (!exists) {
        delete element[property]
      } else {
        element[property] = previousValue
      }
    }
  }

  return set(element, property, setup)
}

export function setStyle(element: HTMLElement | null | undefined, style: Partial<CSSStyleDeclaration>) {
  if (!element) return () => {}

  const setup = () => {
    const prevStyle = element.style.cssText
    Object.assign(element.style, style)
    return () => {
      element.style.cssText = prevStyle
    }
  }

  return set(element, "style", setup)
}
