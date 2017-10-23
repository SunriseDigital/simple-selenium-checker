import webdriver from 'selenium-webdriver';
import util from 'util';
import * as assertions from './assertions'
import * as actions from './actions'
import * as errors from './errors'
import {Placeholder} from './placeholder'
const until = webdriver.until;
const By = webdriver.By;
const Key = webdriver.Key;

export default class Checker
{
  constructor(driver){
    this.driver = driver
    this.debug = Checker.Debug
    this.ignoreConsoleCheck = []
    Checker.IgnoreConsoleCheck.forEach(func => this.addIgnoreConsoleCheck(func));
  }

  handleAlert(alertAction, timeout){
    return this.waitAlert(timeout).then(alert => {
      if(!alert[alertAction]){
        throw new Error("Missing " + alertAction + " action in alert.")
      }

      return alert[alertAction]()
    })
  }

  waitAlert(timeout){
    if(timeout === undefined) timeout = Checker.DefaultTimeout
    return this.driver.wait(until.alertIsPresent(), timeout).then(() => {
      return this.driver.switchTo().alert()
    })
  }

  assembleFromElements(elems, values){
    let promise = webdriver.promise.map(elems, elem => ({elem: elem}))

    Object.keys(values).forEach(key => {
      const func = values[key]
      promise = promise.then(composits => webdriver.promise.map(composits, composit => func(composit.elem).then(value => {
        composit[key] = value
        return composit
      })))
    })

    return promise
  }

  waitForValueCheck(check, action){
    let timeout = check.timeout
    if(timeout === undefined) timeout = Checker.DefaultTimeout
    return this.driver
      .wait(new webdriver.Condition('', () => action()), timeout)
      .catch(err => {
        if(err.name == 'TimeoutError'){
          let message = ''
          if(check.type == 'html'){
            message = util.format("%s: [%s], expected: `%s`", check.name, check.type, check.value||check.values)
          } else if(check.hasOwnProperty('locator')){
            message = util.format("%s: [%s] %s, expected: `%s`, actual: `%s`", check.name, check.type, check.locator, check.value||check.values, check.actual_values)
          } else {
            message = util.format("%s: [%s], expected: `%s`, actual: `%s`", check.name, check.type, check.value||check.values, check.actual_values)
          }
          
          throw new errors.UnexpectedValue(message, err)
        }
        throw err
      })
  }

  waitDissapearElements(locator, timeout){
    if(timeout === undefined) timeout = Checker.DefaultTimeout;
    const cond = new webdriver.Condition(locator + ' disappear from the screen.', () => {
      return this.driver.findElements(locator).then(elems => elems.length === 0)
    })
    return this.driver.wait(cond, timeout)
  }

  waitElementsIn(element, locator, count, timeout){
    if(count === undefined) count = 1
    if(timeout === undefined) timeout = Checker.DefaultTimeout
    const cond = new webdriver.Condition(util.format('for %s to be located %s in specified element', count > 1 ? count + " elements" : 'element', locator), () => {
      return element.findElements(locator).then(elems => {
        if(elems.length >= count){
          return elems
        }

        return false
      })
    })

    return this.driver.wait(cond, timeout)
  }

  waitElements(locator, count, timeout){
    if(count === undefined) count = 1
    if(timeout === undefined) timeout = Checker.DefaultTimeout
    const cond = new webdriver.Condition(util.format('for %s to be located %s', count > 1 ? count + " elements" : 'element', locator), () => {
      return this.driver.findElements(locator).then(elems => {
        if(elems.length >= count){
          return elems
        }

        return false
      })
    })

    return this.driver.wait(cond, timeout)
  }

  waitElement(locator, timeout){
    if(timeout === undefined) timeout = Checker.DefaultTimeout;
    return this.driver
      .wait(until.elementLocated(locator), timeout)
      .then(elem => this.driver.wait(until.elementIsVisible(elem), timeout))
  }

  _detectFunction(functions, obj){
    const keys = []
    let func = undefined
    for(let key in functions){
      if(obj.hasOwnProperty(key)){
        keys.push(key)
        if(func) throw new Error("Found two identify keys. " + keys.join(','))
        func = functions[key]
      }
    }

    if(!func){
      throw new Error("Missing supported directive in " + JSON.stringify(obj))
    }

    return func
  }

  _testItem(condition){
    if(condition.hasOwnProperty('bool')){
      return Promise.resolve(condition.bool !== false)
    } else {
      return this._detectFunction(assertions, condition)(this, condition)
        .then(() => true)
        .catch(err => {
          if(['UnexpectedValue', 'NoSuchElementError', 'ExistsError'].indexOf(err.name) >= 0){
            return false
          }

          throw err
        })
    }
  }

  _testGroup(conditions){
    let promise = Promise.resolve(false)
    conditions.forEach(item => {
      promise = promise.then(res => {
        if(res === true) return true//OR
        return this._testItem(item)
      })
    })

    return promise
  }

  _testExecif(conditions){
    let promise = Promise.resolve(true)
    if(conditions){
      conditions.forEach(group => {
        promise = promise.then(res => {
          if(res === false) return false//AND
          return this._testGroup(group)
        })
      })
    }

    return promise
  }

  _execForeach(elems, item){
    let promise = Promise.resolve()
    elems.forEach((value, index) => {
      promise = promise
        .then(() => this.driver.findElements(item.foreach))
        .then(targets => targets[index])
        .then(elem => elem.click())
        .then(() => this.run(item.scenario))
    })

    return promise
  }

  executeWhile(promise, item){
    return promise.then(res => {
      if(res === true){
        return this.run(item.scenario).then(() => this.executeWhile(this._testExecif(item.while), item))
      } else {
        return Promise.resolve()
      }
    })
  }

  run(scenario, promise){
    if(!promise){
      promise = Promise.resolve()
    }

    scenario.forEach(item => {
      if(item.foreach){
        promise = promise
          .then(() => this.driver.findElements(item.foreach))
          .then(elems => this._execForeach(elems, item))
      } else if(item.while) {
        promise = promise.then(() => this.executeWhile(this._testExecif(item.while), item))
      } else if(item.scenario) {
        promise = this.run(item.scenario, promise)
      } else {
        //directive count check.
        const directives = Object.keys(item)
        if(directives.length > 1){
          throw new Error('Only one directive can be placed in one scenario item.')
        }

        //check supported directives
        if(directives.length === 1 && ['execif', 'url', 'actions', 'assertions'].indexOf(directives[0]) === -1){
          throw new Error("Illegal directive object. " + JSON.stringify(item))
        }

        item = this._applyPlaceholder(item)

        //execif
        if(item.execif){
          promise = promise.then(() => this._testExecif(item.execif))
        } else if(item.url) {
          //Until authenticateAs is officially supported, basic authentication is attempted based on the last displayed URL.
          //see actions.authenticateAs()
          this.lastUrl = item.url
          promise = promise.then(res => {
            if(res === false) return false
            return this.driver.get(item.url)
          })
        } else if(item.actions) {
          item.actions.forEach(action => {
            promise = promise.then(res => {
              if(res === false) return false
              return this._detectFunction(actions, action)(this, action)
            })
          })

          promise = promise.then(() => this.driver.getCurrentUrl().then(url => this.lastUrl = url))
        } else if(item.assertions) {
          item.assertions.forEach(check => {
            promise = promise.then(res => {
              if(res === false) return false
              return this._detectFunction(assertions, check)(this, check)
            })
          })
        }

        //Check javascript and response errors using browser logs.
        promise = promise.then(res => {
          if(res === false) return false
          return this.driver.getCurrentUrl().then(url => {
            return new Promise(resolve => {
              this.driver.manage().logs().get('browser').then(logs => {
                logs.forEach(log => {
                  //skip
                  if(this.ignoreConsoleCheck && this.ignoreConsoleCheck.some(func => func(log) === true)){
                    return
                  }

                  //javascript
                  if(Checker.JsErrorStrings.some(err => log.message.indexOf(err) >= 0)){
                    throw new errors.JavascriptError(log.message)
                  }

                  //Mixed Content for SSL
                  if(log.message.indexOf("Mixed Content") != -1){
                    throw new errors.ExistsError(log.message)
                  }

                  //response
                  if(log.message.indexOf(url + " - ") === 0){
                    const msg = log.message.split(url).join("")
                    for(let i = 400;i <= 599; i++){
                      if(msg.indexOf(" " + i + " ") >= 0){
                        throw new errors.StatusCodeError(log.message)
                      }
                    }
                  }

                  //Failed to load resource or GET 404
                  if(log.message.indexOf("Failed to load resource") != -1){
                    throw new errors.ExistsError(log.message)
                  } else if (log.message.indexOf("GET") != -1 && log.message.indexOf("Not Found") != -1) {
                    throw new errors.ExistsError(log.message)
                  }
                })
                resolve()
              })
            })
          })
        })

        //Format the error.
        if(this.debug === false){
          promise = promise.catch(err => {
            return this.driver.findElement(By.css('html'))
              .then(elem => elem.getAttribute('outerHTML'))
              .then(html => {
                return this.driver.getCurrentUrl().then(url => {
                  const data = Object.assign({}, this.data)
                  delete data.next
                  const message = url + "\n" +
                    "JSON: " + JSON.stringify(item) + "\n" +
                    "Name: " + err.name + "\n" +
                    "Message: " + err.message + "\n" +
                    html
                  throw new errors.VerboseError(message, err)
                })
              })
          })
        }
      }
    })

    return promise.then(() => undefined);
  }

  _applyPlaceholderToValue(value){
    if(value instanceof Placeholder){
      if(this.placeholder.hasOwnProperty(value.placeholderKey)){
        return value.apply(this.placeholder[value.placeholderKey])
      } else {
        throw new Error('Missing ' + value.placeholderKey + ' key in placeholder.')
      }
    } else if(typeof value != 'string') {//for attr
      for(var key in value){
        value[key] = this._applyPlaceholderToValue(value[key])
      }
      return value
    } else {
      return value
    }
  }

  _applyPlaceholderToArray(elems){
    const newElems = []
    elems.forEach(elem => {
      if(elem.forEach){
        newElems.push(this._applyPlaceholderToArray(elem))
      } else {
        const newElem = {}
        for(let elemKey in elem){
          newElem[elemKey] = this._applyPlaceholderToValue(elem[elemKey])
        }
        newElems.push(newElem)
      }
    })

    return newElems
  }

  _applyPlaceholder(scenarioItem){
    if(this.placeholder === undefined){
      return scenarioItem
    }

    const newItem = {}
    for(let itemKey in scenarioItem){
      const elem = scenarioItem[itemKey]
      if(elem.forEach){
        newItem[itemKey] = this._applyPlaceholderToArray(elem)
      } else {
        newItem[itemKey] = this._applyPlaceholderToValue(elem)
      }
    }

    return newItem
  }

  addIgnoreConsoleCheck(func)
  {
    this.ignoreConsoleCheck.push(func)
  }
}

Checker.IgnoreConsoleCheck = []
Checker.addIgnoreConsoleCheck = (func) => Checker.IgnoreConsoleCheck.push(func);

Checker.JsErrorStrings = [
  "SyntaxError",
  "EvalError",
  "ReferenceError",
  "RangeError",
  "TypeError",
  "URIError"
]

Checker.Debug = false

Checker.DefaultTimeout = 12000