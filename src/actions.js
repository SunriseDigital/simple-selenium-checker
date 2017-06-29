export function click(checker, action){
  return checker.waitElement(action.click, action.timeout).then(elem => {
    return elem.click()
  })
}

export function sendKeys(checker, action){
  return checker.waitElement(action.sendKeys, action.timeout).then(elem => {
    return elem.sendKeys(action.value)
  })
}

export function clear(checker, action){
  return checker.waitElement(action.clear, action.timeout).then(elem => {
    return elem.clear()
  })
}
