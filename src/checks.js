import webdriver from 'selenium-webdriver';
const By = webdriver.By;

export function by(checker, check){
  return checker.waitElement(check.by, check.timeout).then(elem => {
    if(check.equals){
      return elem.getText().then(text => {
        if(text !== check.equals) throw new Error('Text in ' + check.by.toString() + ' is not `' + check.equals + '` actual `' + text + "`")
      })
    } else if(check.likes){
      return elem.getText().then(text => {
        if(text.indexOf(check.likes) === -1) throw new Error('Text in ' + check.by.toString() + ' dose not like `' + check.likes + '` actual `' + text + '`')
      })
    } else if(check.callback) {
      return check.callback(elem).then(res => {
        if(!res) throw new Error(check.callback.toString() + ' is failed')
      })
    }
  })
}

export function body(checker, check){
  return checker.driver.findElement(By.css('html'))
    .then(elem => elem.getAttribute('outerHTML'))
    .then(html => {
      if(html.indexOf(check.body) === -1) throw new Error("Missing text `" + check.body + "`")
    })
}

export function url(checker, check){
  return checker.driver.getCurrentUrl().then(url => {
    if(url.indexOf(check.url) === -1){
      throw new Error('The specified URL was not included in the actual URL')
    }
  })
}
