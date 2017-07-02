import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import assert from 'power-assert'
import pauser from 'selenium-pauser'
import Checker from '../src/Checker'
import placeholder from '../src/placeholder'
const By = webdriver.By;

const isDebug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1

let driver;
test.describe('SSC', () => {
  test.before(() => {
    Checker.Debug = isDebug
    Checker.DefaultTimeout = 1
    const chromeCapabilities = webdriver.Capabilities.chrome();
    chromeCapabilities.set('chromeOptions', {
      // 'args': ['--headless', '--disable-gpu']
    });
    driver = new webdriver.Builder()
      .usingServer('http://localhost:4444/wd/hub')
      .withCapabilities(chromeCapabilities)
      .build();
  });

  test.after(() => {
    if(isDebug){
      return pauser.pause().then(() => driver.quit())
    } else {
      return driver.quit()
    }
  });

  test.it('should succeed when giving correct page data.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: "Home 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {equals: "Home alt 003", attr: 'alt', by: By.css(".main .col-sm-6:nth-child(3) img")},
          {likes: "<title>Simple selenium checker - Home</title>"}
        ]
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ]
      },{
        checks: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: "Foo 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {equals: "Foo alt 003", attr: "alt", by: By.css(".main .col-sm-6:nth-child(3) img")},
          {likes: "<title>Simple selenium checker - Foo"},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    })
  })

  test.it('should fail when you specify an element that is not on the page.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/"
      },{
        checks: [
          {exists: By.css("#foo")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #foo)") >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ]
      },{
        checks: [
          {exists: By.css("#home")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #home)") >= 0)
      })
    })
  })

  test.it('should fail when the inner text of the element does not match.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      }, {
        checks: [
          {equals: "Hoge 002", by: By.css(".main .col-sm-6:nth-child(2) h3")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(2) h3) is not `Hoge 002` actual `Home 002`") >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
      },{
        checks: [
          {equals: "Bar 003", by: By.css(".main .col-sm-6:nth-child(3) h3")},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(3) h3) is not `Bar 003` actual `Foo 003") >= 0)
      })
    })
  })

  test.it('should fail when text that is not in the page is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/"
      },{
        checks: [
          {likes: "<title>Simple selenium checker - Hoge</title>"}
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Missing text `<title>Simple selenium checker - Hoge</title>`") >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
      },{
        checks: [
          {likes: "<title>Simple selenium checker - Bar</title>"}
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Missing text `<title>Simple selenium checker - Bar</title>`") >= 0)
      })
    })
  })

  test.it('should fail when a javascript error was detected.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/javascript-error.html",
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Uncaught ReferenceError: foobar is not defined") >= 0)
      })
    })
  })

  test.it('should fail when the server return a status code 400 to 599.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/not-exists.html",
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("the server responded with a status of 404 (Not Found)") >= 0)
      })
    })
  })

  test.it('should be able to perform actions such as click and sendKyes with the actions option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/form.html",
      },{
        checks: [
          {exists: By.css(".input")},
        ],
      },{
        actions: [
          {sendKeys: By.css(".input"), value: "fooBarTest"},
          {click: By.css(".submit")},
        ],
      },{
        checks: [
          {exists: By.css(".main .col-sm-6:nth-child(1) h3")},
          {url: "http://127.0.0.1:8080/index.html?name=fooBarTest&send=send"},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    })
  })

  test.it('should fail when a URL different from the actual URL is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {url: "http://127.0.0.1:8080/hoge.html"},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("The specified URL was not included in the actual URL") >= 0)
      })
    })
  })

  test.it('should stop formatting the error when the debug property is true.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {url: "http://127.0.0.1:8080/hoge.html"},
        ]
      }]

      const checker = new Checker(driver)
      checker.debug = true;
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("The specified URL was not included in the actual URL") >= 0)
        assert(err.message.indexOf('<html lang="en">') === -1)
      })
    })
  })

  test.it('should check partial match with the like keyword of checks option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {likes: "ome 00", by: By.css(".main .col-sm-6:nth-child(1) h3")},
          {likes: "ome 00", by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {likes: "ome 00", by: By.css(".main .col-sm-6:nth-child(3) h3")}
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {likes: "bar", by: By.css(".main .col-sm-6:nth-child(1) h3")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.message.indexOf("Text in By(css selector, .main .col-sm-6:nth-child(1) h3) dose not like `bar` actual `Home 001`") >= 0)
      })
    })
  })

  test.it('should replace the value of the element of the scenario when the placeholder is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: placeholder('url').append('/'),
      },{
        actions: [
          {click: placeholder('actions_click')},
        ],
      },{
        checks: [
          {exists: placeholder('checks_by')},
          {equals: placeholder('checks_equals'), by: By.css(".main .col-sm-6:nth-child(1) h3")},
          {likes: placeholder('checks_likes'), by: By.css(".main .col-sm-6:nth-child(2) h3")},
          {equals: placeholder('checks_attr_value'), attr:"value", by: By.css(".main .col-sm-6:nth-child(3) h3")}
        ],
      },{
        url: placeholder('url').append('/form.html'),
      },{
        actions: [
          {sendKeys: placeholder('actions_sendkey'), value: "fooBarTest"},
          {clear: By.css(".input")},
          {sendKeys: By.css(".input"), value: placeholder('actions_sendkey_value')},
        ]
      },{
        checks: [
          {equals: 'placeholdercheck', attr: 'value', by: By.css(".input")}
        ]
      }]

      const checker = new Checker(driver)
      checker.placeholder = {
        'url': 'http://127.0.0.1:8080',
        'checks_by': By.css(".main .col-sm-6:nth-child(2) h3"),
        'checks_equals': 'Foo 001',
        'checks_likes': 'oo 00',
        'checks_attr_value': null,
        'actions_click': By.css(".nav > li:nth-child(2) > a"),
        'actions_sendkey': By.css(".input"),
        'actions_sendkey_value': 'placeholdercheck'
      }

      const resScenario = []
      scenario.forEach(scenarioItem => resScenario.push(checker._applyPlaceholder(scenarioItem)))
      assert(resScenario[0].url === 'http://127.0.0.1:8080/')
      assert(resScenario[1].actions[0].click.toString() === By.css(".nav > li:nth-child(2) > a").toString())
      assert(resScenario[2].checks[0].exists.toString() === By.css(".main .col-sm-6:nth-child(2) h3").toString())
      assert(resScenario[2].checks[1].equals === 'Foo 001')
      assert(resScenario[2].checks[2].likes === 'oo 00')
      // https://gist.github.com/gomo/474b14bbf8955e0a20d56902eafd0fb8
      assert(resScenario[2].checks[3].equals === null)
      assert(resScenario[3].url === 'http://127.0.0.1:8080/form.html')
      assert(resScenario[4].actions[0].sendKeys.toString() === By.css(".input").toString())

      return checker.run(scenario)
    })
  })

  test.it('should when there is an execif directive, evaluate whether to execute that block.', () => {
    const checker = new Checker(driver)
    let promise =  Promise.resolve().then(() => {
      return driver.get('http://127.0.0.1:8080')
    }).then(() => {
      // exists
      return checker._testExecif([
        [{exists: By.css('header')}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //non exists
      return checker._testExecif([
        [{notExists: By.css('header')}]
      ]).then(res => assert(res === false))
    }).then(() => {
      // bool true
      return checker._testExecif([
        [{bool: true}]
      ]).then(res => assert(res === true))
    }).then(() => {
      // bool false
      return checker._testExecif([
        [{bool: false}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //or
      return checker._testExecif([
        [{exists: By.css('header')}, {notExists: By.css('header')}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //and
      return checker._testExecif([
        [{exists: By.css('header')}],
        [{notExists: By.css('header')}]
      ]).then(res => assert(res === false))
    })

    //From here down is checker.run tests.
    promise = promise.then(() => {
      // execute checks
      return checker.run([{
        url: 'http://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]],
        },{
          checks: [
            {exists: By.css(".non-exists")},
          ]
        }]
      }]).catch(err => err).then(err => assert(err !== undefined))
    }).then(() => {
      //ignore checks
      return checker.run([{
        url: 'http://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{notExists: By.css('header')}]],
        },{
          checks: [
            {exists: By.css(".non-exists")},
            {exists: By.css(".non-exists2")},
          ]
        }]
      }])
    })
    .then(() => {
      // execute url
      return checker.run([{
        url: 'http://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]]
        },{
          url: "http://127.0.0.1:8080/foo.html"
        }]
      },{
        checks: [
          {exists: By.css("#foo")},
          {exists: By.css("#fail-on-execute-url")},
        ]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #fail-on-execute-url)") >= 0)
      })
    }).then(() => {
      // ignore url
      return checker.run([{
        url: 'http://127.0.0.1:8080/foo.html'
      },{
        scenario: [{
          execif: [[{notExists: By.css('header')}]]
        },{
          url: "http://127.0.0.1:8080/form.html"
        }]
      },{
        checks: [
          {exists: By.css("#foo")},
          {exists: By.css("#fail-on-ignore-url")},
        ]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #fail-on-ignore-url)") >= 0)
      })
    }).then(() => {
      // execute action
      return checker.run([{
        url: 'http://127.0.0.1:8080/foo.html'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]]
        },{
          actions: [
            {click: By.css(".nav > li:nth-child(1) > a")},
          ]
        }]
      },{
        checks: [
          {exists: By.css("#home")},
          {exists: By.css("#fail-on-execute-action")},
        ]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #fail-on-execute-action)") >= 0)
      })
    }).then(() => {
      // ignore action
      return checker.run([{
        url: 'http://127.0.0.1:8080/'
      },{
        scenario: [
          {execif: [[{notExists: By.css('header')}]]
        },{
          actions: [
            {click: By.css(".non-exists")},
            {click: By.css(".non-exists2")},
          ]
        }]
      },{
        checks: [
          {exists: By.css("#home")},
          {exists: By.css("#fail-on-ignore-action")},
        ]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #fail-on-ignore-action)") >= 0)
      })
    })

    return promise
  })

  test.it('should be able to handle nested scenarios.', () => {
    const checker = new Checker(driver)

    return Promise.resolve().then(() => {
      // second level
      return checker.run([{
        url: "http://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "http://127.0.0.1:8080/foo.html"
        },{
          checks: [
            {exists: By.css("#foo")},
            {exists: By.css("#nothing2")}
          ]
        }]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #nothing2)") >= 0)
      })
    }).then(() => {
      // third level
      return checker.run([{
        url: "http://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "http://127.0.0.1:8080/foo.html"
        },{
          checks: [{exists: By.css("#foo")}]
        },{
          scenario: [{
            url: "http://127.0.0.1:8080/form.html"
          },{
            checks: [
              {exists: By.css(".input[name=name]")},
              {exists: By.css("#nothing3")}
            ]
          }]
        }]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #nothing3)") >= 0)
      })
    }).then(() => {
      //execif third level
      return checker.run([{
        url: "http://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "http://127.0.0.1:8080/foo.html"
        },{
          checks: [{exists: By.css("#foo")}]
        },{
          scenario: [{
            url: "http://127.0.0.1:8080/form.html"
          },{
            execif: [[{exists: By.css('#home')}]]
          },{
            checks: [
              {exists: By.css("#home")}
            ]
          }]
        }]
      },{
        url: "http://127.0.0.1:8080/"
      },{
        checks: [{exists: By.css("#foo")}]
      }]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("Waiting for element to be located By(css selector, #foo)") >= 0)
      })
    })
  })

  test.it('should be able to check HTML attributes.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {equals: 'http://127.0.0.1:8080/foo.html', attr: "href", by: By.css(".nav > li:nth-child(2) > a")},
          {equals: 'page-header', attr: "class", by: By.css("header")},
          {equals: 'nav nav-pills', attr: "class", by: By.css(".nav")},
          {equals: 'nav', attr: "class", by: By.css(".nav")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("class of By(css selector, .nav) is not `nav` actual `nav nav-pills`") >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {likes: '/foo.html', attr: "href", by: By.css(".nav > li:nth-child(2) > a")},
          {likes: 'ge-head', attr: "class", by: By.css("header")},
          {likes: 'nav-pil', attr: "class", by: By.css(".nav")},
          {likes: 'foooo', attr: "class", by: By.css(".nav")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.message.indexOf("class of By(css selector, .nav) dose not like `foooo` actual `nav nav-pills`") >= 0)
      })
    })
  })
})
