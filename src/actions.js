import webdriver from 'selenium-webdriver';
const Promise = webdriver.promise;

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

export function check(checker, action){
  return checker.waitElements(action.check, action.count, action.timeout)
    .then(elems => Promise.map(
      elems, 
      elem => elem.getAttribute('value').then(value => ({elem: elem, value: value})))
    )
    .then(composits => Promise.map(
      composits,
      composit => composit.elem.isSelected().then(isSelected => ({elem: composit.elem, value: composit.value, isSelected: isSelected})))
    )
    .then(composits => composits.filter(composit => !composit.isSelected && action.values.indexOf(composit.value) >= 0))
    .then(composits => Promise.map(
      composits,
      composit => composit.elem.click())
    )
}

export function clear(checker, action){
  if(action.type == 'checkbox'){
    return checker.waitElements(action.clear, action.count, action.timeout)
    .then(elems => Promise.map(
      elems,
      elem => elem.isSelected().then(isSelected => ({elem: elem, isSelected: isSelected})))
    )
    .then(composits => composits.filter(composit => composit.isSelected))
    .then(composits => Promise.map(composits, composit => composit.elem.click()))
  } else {
    return checker.waitElement(action.clear, action.timeout).then(elem => {
      return elem.clear()
    })
  }
}
