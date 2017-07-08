import webdriver from 'selenium-webdriver';
import util from 'util';
import * as errors from './errors'
const By = webdriver.By;

function createPromise(checker, assertion){
  if(assertion.locator){
    return checker.waitElements(assertion.locator, assertion.count, assertion.timeout)
      .then(elems => checker.assembleFromElements(elems, {
        tag_name: elem => elem.getTagName(),
        type: elem => elem.getAttribute('type'),
        value: elem => elem.getAttribute('value'),
        multiple: elem => elem.getAttribute('multiple'),
        selected: elem => elem.isSelected(),
        inner_text: elem => elem.getText(),
        attr: elem => assertion.type && assertion.type.hasOwnProperty('attr') ? elem.getAttribute(assertion.type.attr) : Promise.resolve(false)
      }))
      .then(composits => {
        if(composits[0].tag_name == 'select'){
          return checker.waitElementsIn(composits[0].elem, By.css('option'), assertion.count, assertion.timeout)
            .then(elems => checker.assembleFromElements(elems, {
              value: elem => elem.getAttribute('value'),
              selected: elem => elem.isSelected()
            }))
            .then(sComposits => sComposits.filter(sComposit => sComposit.selected))
            .then(sComposits => ({
              values: sComposits.map(sComposit => sComposit.value),
              type: 'select value'
            }))
        } else if(composits[0].attr !== false) {
          return {
            values: composits.map(composit => composit.attr),
            type: assertion.type.attr + ' attribute'
          }
        } else if(composits[0].type == "checkbox" || composits[0].type == "radio"){
          return {
            values: composits.filter(composit => composit.selected).map(composit => composit.value),
            type: composits[0].type + ' value'
          }
        } else if(composits[0].tag_name == "input"){
          return {
            values: composits.map(composit => composit.value),
            type: 'input value'
          }
        } else {
          return {
            values: composits.map(composit => composit.inner_text),
            type: 'inner text'
          }
        }
      })
  } else if(assertion.type == 'html') {
    return checker.driver.findElement(By.css('html'))
      .then(elem => elem.getAttribute('outerHTML'))
      .then(html => ({
        values: [html],
        type: assertion.type,
      }))
  } else if(assertion.type == 'url') {
    return checker.driver.getCurrentUrl().then(url => ({
      values: [url],
      type: assertion.type,
    }))
  } else {
    throw Error("Illegal directive is specified " + JSON.stringify(assertion) + '.')
  }
}

function normalizeDirective(assertion, name){
  assertion = Object.assign({}, assertion)

  assertion.name = name

  if(assertion.hasOwnProperty('type')){
    throw Error("`type` key is not supported " + JSON.stringify(assertion) + '.')
  }

  if(typeof assertion[name] == 'string'){
    assertion.type = assertion[name]
  } else {
    assertion.locator = assertion[name]
  }

  //attr
  const attr_keys = Object.keys(assertion).filter(key => key.indexOf('attr_') === 0)
  if(attr_keys.length > 1) throw new Error("2 or more attr_ key found " + JSON.stringify(assertion) + '.')
  if(attr_keys.length > 0){
    assertion.type = {attr: attr_keys[0].substr('attr_'.length)}
    assertion.value = assertion[attr_keys[0]]
  } else if(['exists', 'notExists'].indexOf(assertion.name) === -1){
    if(!assertion.hasOwnProperty('value') && !assertion.hasOwnProperty('values')){
      throw new Error("Require value or values key " + JSON.stringify(assertion) + '.')
    }
  }

  return assertion
}

function compareArray(array1, array2){
  return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort())
}

export function exists(checker, assertion){
  assertion = normalizeDirective(assertion, 'exists')
  return checker.waitElements(assertion.exists, assertion.count, assertion.timeout)
    .catch(err => {
      if(err.name == 'TimeoutError'){
        throw new errors.NoSuchElementError(util.format("%s: %s", assertion.name, assertion.locator), err)
      }
      throw err
    })
}

export function notExists(checker, assertion){
  assertion = normalizeDirective(assertion, 'notExists')
  return checker.waitDissapearElements(assertion.notExists, assertion.timeout)
    .catch(err => {
      if(err.name == 'TimeoutError'){
        throw new errors.ExistsError(util.format("%s: %s", assertion.name, assertion.locator), err)
      }
      throw err
    })
}

export function likes(checker, assertion){
  assertion = normalizeDirective(assertion, 'likes')
  return checker.waitForValueCheck(
    assertion,
    () => createPromise(checker, assertion).then(data => {
      assertion.actual_values = data.values
      assertion.type = data.type
      if(assertion.values !== undefined) throw new Error('`likes` can only value.')
      if(data.values.length > 1) throw new Error('Multiple values were detected `' + data.values + '`.')
      return data.values[0].indexOf(assertion.value) >= 0
    })
  )
}

export function equals(checker, assertion){
  assertion = normalizeDirective(assertion, 'equals')
  return checker.waitForValueCheck(
    assertion,
    () => createPromise(checker, assertion).then(data => {
      assertion.type = data.type
      assertion.actual_values = data.values
      if(assertion.hasOwnProperty('values')){
        return compareArray(data.values, assertion.values)
      } else if(assertion.hasOwnProperty('value')) {
        return data.values[0] === assertion.value
      }
    })
  )
}

export function unchecked(checker, assertion){
  assertion = normalizeDirective(assertion, 'unchecked')
  return checker.waitForValueCheck(
    assertion,
    () => createPromise(checker, assertion).then(data => {
      assertion.type = data.type
      assertion.actual_values = data.values
      if(assertion.value === undefined && assertion.values === undefined) throw new Error("Missing value or values.")
      const expectedList = assertion.values ? assertion.values : [assertion.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(data.values.indexOf(expected) >= 0) return false
      }

      return true
    })
  )
}

export function checked(checker, assertion){
  assertion = normalizeDirective(assertion, 'checked')
  return checker.waitForValueCheck(
    assertion,
    () => createPromise(checker, assertion).then(data => {
      assertion.actual_values = data.values
      assertion.type = data.type
      if(assertion.value === undefined && assertion.values === undefined) throw new Error("Missing value or values.")
      const expectedList = assertion.values ? assertion.values : [assertion.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(data.values.indexOf(expected) === -1) return false
      }

      return true
    })
  )
}

export function selected(checker, assertion){
  assertion = normalizeDirective(assertion, 'selected')
  return checker.waitForValueCheck(
    assertion,
    () => createPromise(checker, assertion).then(data => {
      assertion.actual_values = data.values
      assertion.type = data.type
      if(assertion.value === undefined && assertion.values === undefined) throw new Error("Missing value or values.")
      const expectedList = assertion.values ? assertion.values : [assertion.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(data.values.indexOf(expected) === -1) return false
      }

      return true
    })
  )
}

export function unselected(checker, assertion){
  assertion = normalizeDirective(assertion, 'unselected')
  return checker.waitForValueCheck(
    assertion,
    () => createPromise(checker, assertion).then(data => {
      assertion.actual_values = data.values
      assertion.type = data.type
      if(assertion.value === undefined && assertion.values === undefined) throw new Error("Missing value or values.")
      const expectedList = assertion.values ? assertion.values : [assertion.value]
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if(data.values.indexOf(expected) >= 0) return false
      }

      return true
    })
  )
}

export function notEquals(checker, assertion){
  assertion = normalizeDirective(assertion, 'notEquals')
  return checker.waitForValueCheck(
    assertion,
    () => createPromise(checker, assertion).then(data => {
      assertion.actual_values = data.values
      assertion.type = data.type
      if(assertion.values){
        return !compareArray(data.values, assertion.values)
      } else if(assertion.value) {
        return data.values[0] !== assertion.value
      }
    })
  )
}

export function notLikes(checker, assertion){
  assertion = normalizeDirective(assertion, 'notLikes')
    return checker.waitForValueCheck(
    assertion,
    () => createPromise(checker, assertion).then(data => {
      assertion.type = data.type
      assertion.actual_values = data.values
      if(assertion.values !== undefined) throw new Error('`likes` can only value.')
      if(data.values.length > 1) throw new Error('Multiple values were detected `' + data.values + '`.')
      return data.values[0].indexOf(assertion.value) === -1
    })
  )
}
