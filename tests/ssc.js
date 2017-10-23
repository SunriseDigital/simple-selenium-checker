import webdriver from 'selenium-webdriver'
import test from 'selenium-webdriver/testing'
import assert from 'power-assert'
import pauser from 'selenium-pauser'
import Checker from '../src/Checker'
import placeholder from '../src/placeholder'
import attr from '../src/attr'
// import {Checker, placeholder, attr} from '../dist/'
const By = webdriver.By;

const isDebug = process.execArgv.indexOf('--debug') > -1 || process.execArgv.indexOf('--debug-brk') > -1
const noCatchTest = process.argv.indexOf('--no-catch') >= 0

let driver;
test.describe('SSC', () => {
  test.before(() => {
    Checker.addIgnoreConsoleCheck((log) => log.message.indexOf("favicon.ico") != -1)//default ignore
    Checker.Debug = isDebug
    Checker.DefaultTimeout = 1
    const chromeCapabilities = webdriver.Capabilities.chrome();
    const args = ["--window-size=1024,768", "--ignore-certificate-errors"]
    if(!isDebug){
      // args.push('--headless', '--disable-gpu')
    }
    chromeCapabilities.set('chromeOptions', {
      'args': args
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
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: By.css(".main .col-sm-6:nth-child(2) h3"), value: "Home 002"},
          {equals: By.css(".main .col-sm-6:nth-child(3) img"), value: attr("alt", "Home alt 003")},
          {likes: "html", value: "<title>Simple selenium checker - Home</title>"} 
        ]
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ]
      },{
        assertions: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: By.css(".main .col-sm-6:nth-child(2) h3"), value: "Foo 002"},
          {equals: By.css(".main .col-sm-6:nth-child(3) img"), value: attr("alt", "Foo alt 003")},
          {likes: "html", value: "<title>Simple selenium checker - Foo"} ,
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    })
  })

  test.it('should fail when you specify an element that is not on the page.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/"
      },{
        assertions: [
          {exists: By.css("#foo")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "NoSuchElementError")
      })
    }).then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ]
      },{
        assertions: [
          {exists: By.css("#home")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "NoSuchElementError")
      })
    })
  })

  test.it('should fail when the inner text of the element does not match.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/",
      }, {
        assertions: [
          {equals: By.css(".main .col-sm-6:nth-child(2) h3"), value: "Hoge 002"},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('Hoge 002') >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
      },{
        assertions: [
          {equals: By.css(".main .col-sm-6:nth-child(3) h3"), value: "Bar 003"},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('Bar 003') >= 0)
      })
    })
  })

  test.it('should fail when text that is not in the page is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/"
      },{
        assertions: [
          {likes: "html", value: "<title>Simple selenium checker - Hoge</title>"} 
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('<title>Simple selenium checker - Hoge</title>') >= 0)
      })
    }).then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/",
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ],
      },{
        assertions: [ 
          {likes: "html", value: "<title>Simple selenium checker - Bar</title>"} 
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('<title>Simple selenium checker - Bar</title>') >= 0)
      })
    })
  })

  test.it('should fail when a javascript error was detected.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/javascript-error.html",
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "JavascriptError")
      })
    })
  })

  test.it('should fail when the server return a status code 400 to 599.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/not-exists.html",
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "StatusCodeError")
      })
    })
  })

  test.it('should be able to perform actions such as click and sendKyes with the actions option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/form.html",
      },{
        assertions: [
          {exists: By.css(".input")},
        ],
      },{
        actions: [
          {sendKeys: By.css(".input"), value: "fooBarTest"},
          {click: By.css(".submit")},
        ],
      },{
        assertions: [
          {exists: By.css(".main .col-sm-6:nth-child(1) h3")},
          {equals: "url", value: "https://127.0.0.1:8080/index.html?name=fooBarTest&send=send"} ,
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    })
  })

  test.it('should be able to check url.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {equals: 'url', value: "https://127.0.0.1:8080/"} ,
          {likes: 'url', value: "127.0.0.1"} ,
          {notEquals: 'url', value: "https://127.0.0.1:8080/foobar.html"} ,
          {notLikes: 'url', value: "foobar"} ,
        ]
      }]

      return checker.run(scenario)
    }).then(() => {
      return checker.run([{
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {equals: 'url', value: "https://127.0.0.1:8080/hoge.html"} ,
        ]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('https://127.0.0.1:8080/hoge.html') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {likes: 'url', value: "hoge.html"} ,
        ]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('hoge.html') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {notEquals: 'url', value: "https://127.0.0.1:8080/"} ,
        ]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('https://127.0.0.1:8080/') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {notLikes: 'url', value: "127.0.0.1"} ,
        ]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('127.0.0.1') >= 0)
      })
    })
  })

  test.it('should stop formatting the error when the debug property is true.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {equals: 'url', value: "https://127.0.0.1:8080/hoge.html"} ,
        ]
      }]

      const checker = new Checker(driver)
      checker.debug = true;
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('https://127.0.0.1:8080/hoge.html') >= 0)
      })
    })
  })

  test.it('should check partial match with the like keyword of checks option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {likes: By.css(".main .col-sm-6:nth-child(1) h3"), value: "ome 00"},
          {likes: By.css(".main .col-sm-6:nth-child(2) h3"), value: "ome 00"},
          {likes: By.css(".main .col-sm-6:nth-child(3) h3"), value: "ome 00"}
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    }).then(() => {
      const scenario = [{
        url: "https://127.0.0.1:8080/",
      },{
        assertions: [
          {likes: By.css(".main .col-sm-6:nth-child(1) h3"), value: "bar"},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('bar') >= 0)
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
        assertions: [
          {exists: placeholder('assertions_by')},
          {equals: By.css(".main .col-sm-6:nth-child(1) h3"), value: placeholder('assertions_equals')},
          {likes: By.css(".main .col-sm-6:nth-child(2) h3"), value: placeholder('assertions_likes')},
          {equals: By.css(".main .col-sm-6:nth-child(3) h3"), value: attr('value', placeholder('assertions_attr_value'))}
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
        assertions: [
          {equals: By.css(".input"), value: attr("value", "placeholdercheck")}
        ]
      }]

      const checker = new Checker(driver)
      checker.placeholder = {
        'url': 'https://127.0.0.1:8080',
        'assertions_by': By.css(".main .col-sm-6:nth-child(2) h3"),
        'assertions_equals': 'Foo 001',
        'assertions_likes': 'oo 00',
        'assertions_attr_value': null,
        'actions_click': By.css(".nav > li:nth-child(2) > a"),
        'actions_sendkey': By.css(".input"),
        'actions_sendkey_value': 'placeholdercheck'
      }

      const resScenario = []
      scenario.forEach(scenarioItem => resScenario.push(checker._applyPlaceholder(scenarioItem)))
      assert(resScenario[0].url === 'https://127.0.0.1:8080/')
      assert(resScenario[1].actions[0].click.toString() === By.css(".nav > li:nth-child(2) > a").toString())
      assert(resScenario[2].assertions[0].exists.toString() === By.css(".main .col-sm-6:nth-child(2) h3").toString())
      assert(resScenario[2].assertions[1].value === 'Foo 001')
      assert(resScenario[2].assertions[2].value === 'oo 00')
      assert(resScenario[2].assertions[3].value.value === null)
      assert(resScenario[3].url === 'https://127.0.0.1:8080/form.html')
      assert(resScenario[4].actions[0].sendKeys.toString() === By.css(".input").toString())

      return checker.run(scenario)
    })
  })

  test.it('should when there is an execif directive, evaluate whether to execute that block.', () => {
    const checker = new Checker(driver)
    let promise =  Promise.resolve().then(() => {
      return driver.get('https://127.0.0.1:8080')
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
      //equals true
      return checker._testExecif([
        [{equals: By.css('#home h2'), value: "Home"}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //equals false
      return checker._testExecif([
        [{equals: By.css('#home h2'), value: "Foo"}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //notEquals true
      return checker._testExecif([
        [{notEquals: By.css('#home h2'), value: "Foo"}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //notEquals false
      return checker._testExecif([
        [{notEquals: By.css('#home h2'), value: "Home"}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //likes true
      return checker._testExecif([
        [{likes: By.css('#home h2'), value: "om"}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //likes false
      return checker._testExecif([
        [{likes: By.css('#home h2'), value: "Foo"}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //notLikes true
      return checker._testExecif([
        [{notLikes: By.css('#home h2'), value: "Foo"}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //notLikes false
      return checker._testExecif([
        [{notLikes: By.css('#home h2'), value: "om"}]
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
    }).then(() => {
      return driver.get('https://127.0.0.1:8080/options.html')
    }).then(() => {
      //checked true
      return checker._testExecif([
        [{checked: By.css('.checkbox-inline input'), values: ["checkbox2"]}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //checked false
      return checker._testExecif([
        [{checked: By.css('.checkbox-inline input'), values: ["checkbox1"]}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //unchecked true
      return checker._testExecif([
        [{unchecked: By.css('.checkbox-inline input'), values: ["checkbox1"]}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //unchecked false
      return checker._testExecif([
        [{unchecked: By.css('.checkbox-inline input'), values: ["checkbox2"]}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //selected true
      return checker._testExecif([
        [{selected: By.css('.select-multiple'), values: ["option2"]}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //selected false
      return checker._testExecif([
        [{selected: By.css('.select-multiple'), values: ["option1"]}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //unselected true
      return checker._testExecif([
        [{unselected: By.css('.select-multiple'), values: ["option1"]}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //unselected false
      return checker._testExecif([
        [{unselected: By.css('.select-multiple'), values: ["option2"]}]
      ]).then(res => assert(res === false))
    })

    //From here down is checker.run tests.
    promise = promise.then(() => {
      // execute checks
      return checker.run([{
        url: 'https://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]],
        },{
          assertions: [
            {exists: By.css(".non-exists")},
          ]
        }]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
      })
    }).then(() => {
      //ignore checks
      return checker.run([{
        url: 'https://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{notExists: By.css('header')}]],
        },{
          assertions: [
            {exists: By.css(".non-exists")},
            {exists: By.css(".non-exists2")},
          ]
        }]
      }])
    })
    .then(() => {
      // execute url
      return checker.run([{
        url: 'https://127.0.0.1:8080/'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]]
        },{
          url: "https://127.0.0.1:8080/foo.html"
        }]
      },{
        assertions: [
          {exists: By.css("#foo")},
          {exists: By.css("#fail-on-execute-url")},
        ]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "NoSuchElementError")
      })
    }).then(() => {
      // ignore url
      return checker.run([{
        url: 'https://127.0.0.1:8080/foo.html'
      },{
        scenario: [{
          execif: [[{notExists: By.css('header')}]]
        },{
          url: "https://127.0.0.1:8080/form.html"
        }]
      },{
        assertions: [
          {exists: By.css("#foo")},
          {exists: By.css("#fail-on-ignore-url")},
        ]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "NoSuchElementError")
      })
    }).then(() => {
      // execute action
      return checker.run([{
        url: 'https://127.0.0.1:8080/foo.html'
      },{
        scenario: [{
          execif: [[{exists: By.css('header')}]]
        },{
          actions: [
            {click: By.css(".nav > li:nth-child(1) > a")},
          ]
        }]
      },{
        assertions: [
          {exists: By.css("#home")},
          {exists: By.css("#fail-on-execute-action")},
        ]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "NoSuchElementError")
      })
    }).then(() => {
      // ignore action
      return checker.run([{
        url: 'https://127.0.0.1:8080/'
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
        assertions: [
          {exists: By.css("#home")},
          {exists: By.css("#fail-on-ignore-action")},
        ]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "NoSuchElementError")
      })
    })

    return promise
  })

  test.it('should be able to handle nested scenarios.', () => {
    const checker = new Checker(driver)

    return Promise.resolve().then(() => {
      // second level
      return checker.run([{
        url: "https://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "https://127.0.0.1:8080/foo.html"
        },{
          assertions: [
            {exists: By.css("#foo")},
            {exists: By.css("#nothing2")}
          ]
        }]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "NoSuchElementError")
      })
    }).then(() => {
      // third level
      return checker.run([{
        url: "https://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "https://127.0.0.1:8080/foo.html"
        },{
          assertions: [{exists: By.css("#foo")}]
        },{
          scenario: [{
            url: "https://127.0.0.1:8080/form.html"
          },{
            assertions: [
              {exists: By.css(".input[name=name]")},
              {exists: By.css("#nothing3")}
            ]
          }]
        }]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "NoSuchElementError")
      })
    }).then(() => {
      //execif third level
      return checker.run([{
        url: "https://127.0.0.1:8080/"
      },{
        scenario: [{
          url: "https://127.0.0.1:8080/foo.html"
        },{
          assertions: [{exists: By.css("#foo")}]
        },{
          scenario: [{
            url: "https://127.0.0.1:8080/form.html"
          },{
            execif: [[{exists: By.css('#home')}]]
          },{
            assertions: [
              {exists: By.css("#home")}
            ]
          }]
        }]
      },{
        url: "https://127.0.0.1:8080/"
      },{
        assertions: [{exists: By.css("#foo")}]
      }]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "NoSuchElementError")
      })
    })
  })

  test.it('should be able to check HTML attributes.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {equals: By.css(".nav > li:nth-child(2) > a"), value: attr("href", "https://127.0.0.1:8080/foo.html")},
          {equals: By.css("header"), value: attr("class", "page-header")},
          {equals: By.css(".nav"), value: attr("class", "nav nav-pills")},
          {equals: By.css(".nav"), value: attr("class", "nav")},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('`nav`') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {likes: By.css(".nav > li:nth-child(2) > a"), value: attr("href", "/foo.html")},
          {likes: By.css("header"), value: attr("class", "ge-head")},
          {likes: By.css(".nav"), value: attr("class", "nav-pil")},
          {likes: By.css(".nav"), value: attr("class", "foooo")},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('foooo') >= 0)
      })
    })
  })

  test.it('should be able to do a negative check.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notEquals: By.css(".nav > li:nth-child(1) > a"), value: 'Bar'},
          {notEquals: By.css(".nav > li:nth-child(2) > a"), value: 'Bar'},
          {notEquals: By.css(".nav > li:nth-child(2) > a"), value: attr("href", "https://127.0.0.1:8080/bar.html")},
          {notEquals: By.css("header"), value: attr("class", "page-footer")},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notEquals: By.css(".nav > li:nth-child(1) > a"), value: 'Home'}
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('Home') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notEquals: By.css(".nav > li:nth-child(2) > a"), value: attr("href", "https://127.0.0.1:8080/foo.html")},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('https://127.0.0.1:8080/foo.html') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notLikes: By.css(".nav > li:nth-child(1) > a"), value: 'Bar'},
          {notLikes: By.css(".nav > li:nth-child(2) > a"), value: 'Bar'},
          {notLikes: By.css(".nav > li:nth-child(2) > a"), value: attr("href", "https://127.0.0.1:8080/bar.html")},
          {notLikes: By.css("header"), value: attr("class", "page-footer")},
          {notLikes: 'html', value: 'foobarfoobar'} 
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notLikes: By.css(".nav > li:nth-child(2) > a"), value: 'Foo'},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('Foo') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notLikes: By.css("header"), value: attr("class", "page-header")},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('page-header') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notLikes: 'html', value: 'Simple selenium checker'} ,
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('Simple selenium checker') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notExists: By.css(".not-exists")},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {assertions: [
          {notExists: By.css("body")},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "ExistsError")
      })
    })
  })

  test.it('should be able to handle checkboxes.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox2']},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2']},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('checkbox1,checkbox2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2', 'checkbox3']},
        ]},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2', 'checkbox3']},
        ]},
        {actions: [
          {uncheck: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2']},
        ]},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox3']},
        ]},
        {actions: [
          {uncheck: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox2', 'checkbox3']},
        ]},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: []},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]")},
        ]},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: []},
          {unchecked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']} 
        ]},
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox3']},
        ]},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox3']},
          {checked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']} ,
          {checked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox3']} 
        ]}
        ,
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2']},
        ]},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2', 'checkbox3']},
        ]},
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {assertions: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2', 'checkbox3']},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]")},
        ]},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]")},
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {assertions: [
          {unchecked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']} 
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('checkbox1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]")},
        ]},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]")},
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {assertions: [
          {checked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox2']} 
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('checkbox2') >= 0)
      })
    })
  })

  test.it('should be able to handle radio buttons.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {equals: By.css(".radio-inline input[name=radio]"), value: 'radio2'},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {equals: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('radio1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
        {assertions: [
          {equals: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio99'},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "NoSuchElementError")
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
        {assertions: [
          {notEquals: By.css(".radio-inline input[name=radio]"), value: 'radio2'},
          {notEquals: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('radio1') >= 0)
      })
    })
  })

  test.it('should be able to handle non multiple select tag.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {equals: By.css(".select-single"), value: 'option1'},
          {equals: By.css(".select-single"), value: 'option2'},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {select: By.css(".select-single"), value: 'option3'},
        ]},
        {assertions: [
          {equals: By.css(".select-single"), value: 'option3'},
          {equals: By.css(".select-single"), value: 'option2'},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {selected: By.css(".select-single"), value: 'option1'} ,
          {selected: By.css(".select-single"), value: 'option2'} ,
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('option2') >= 0)
      })
    })
    .then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {unselected: By.css(".select-single"), value: 'option2'} ,
          {unselected: By.css(".select-single"), value: 'option3'} ,
          {unselected: By.css(".select-single"), value: 'option1'} ,
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('option1') >= 0)
      })
    })
  })

  test.it('should be able to handle multiple select tag.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {equals: By.css(".select-multiple"), values: ['option2', 'option3']},
          {equals: By.css(".select-multiple"), values: ['option1']},
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('option1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {assertions: [
          {selected: By.css(".select-multiple"), values: ['option2']} ,
          {selected: By.css(".select-multiple"), values: ['option3']} ,
          {selected: By.css(".select-multiple"), values: ['option1']} ,
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('option1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".select-multiple")},
          {select: By.css(".select-multiple"), values: ['option2']},
        ]},
        {assertions: [
          {unselected: By.css(".select-multiple"), values: ['option1']} ,
          {unselected: By.css(".select-multiple"), values: ['option3']} ,
          {unselected: By.css(".select-multiple"), values: ['option2']} ,
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".select-multiple")},
        ]},
        {assertions: [
          {equals: By.css(".select-multiple"), values: []},
        ]},
        {actions: [
          {select: By.css(".select-multiple"), values: ['option1', 'option3']},
        ]},
        {assertions: [
          {equals: By.css(".select-multiple"), values: ['option1', 'option3']},
        ]},
        {actions: [
          {select: By.css(".select-multiple"), values: ['option2', 'option3']},
        ]},
        {assertions: [
          {equals: By.css(".select-multiple"), values: ['option1', 'option2', 'option3']},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option3']},
        ]},
        {assertions: [
          {equals: By.css(".select-multiple"), values: ['option1', 'option2']},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option3']},
        ]},
        {assertions: [
          {equals: By.css(".select-multiple"), values: ['option1', 'option2']},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option1', 'option2']},
        ]},
        {assertions: [
          {equals: By.css(".select-multiple"), values: []},
        ]},
      ])
    })
  })

  test.it('should be able to handle alert and confirm.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
       return checker.run([
        {url: "https://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#alert")},
          {alert: "accept", timeout: 3000}
        ]},
        {assertions: [
          {equals: By.css("#display"), value: "Alert", timeout: 3000},
        ]},
       ])
    }).then(() => {
       return checker.run([
        {url: "https://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#confirm")},
          {alert: "accept", timeout: 3000}
        ]},
        {assertions: [
          {equals: By.css("#display"), value: "Confirm OK", timeout: 3000},
        ]},
       ])
    }).then(() => {
       return checker.run([
        {url: "https://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#confirm")},
          {alert: "dismiss", timeout: 3000}
        ]},
        {assertions: [
          {equals: By.css("#display"), value: "Confirm Cancel", timeout: 3000},
        ]},
       ])
    })
  })

  test.it('should be able to handle frame.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/frame.html"},
        {actions: [
          {switchTo: By.css("#index_frame")},
        ]},
        {assertions: [
          {equals: By.css("h2"), value: "Home"},
          {equals: By.css("h2"), value: "FooBar"},
        ]},
       ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf("FooBar") >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/frame.html"},
        {actions: [
          {switchTo: By.css("#index_frame")},
        ]},
        {assertions: [
          {equals: By.css("h2"), value: "Home"},
        ]},
        {actions: [
          {switchTo: 'default'},
        ]},
        {assertions: [
          {equals: By.css("h2"), value: "Frame"},
          {equals: By.css("h2"), value: "FooBar"},
        ]},
       ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err !== undefined)
        assert(err.name == "UnexpectedValue")
        assert(err.message.indexOf("FooBar") >= 0)
      })
    })
  })

  test.it('should ignore any empty scenario items.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/"},
        {},
        {},
       ]).catch(err => err).then(err => {
        assert(err === undefined)
      })
    })
  })

  test.it('should be able to scroll.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/scroll.html"},
        {actions: [
          {scrollTo: {x:200, y:500}}
        ]},
        {assertions:[
          {equals: By.css("#scroll-info-x"), value: "200"},
          {equals: By.css("#scroll-info-y"), value: "500"},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/scroll.html"},
        {actions: [
          {scrollTo: {x:0, y:0}},
          {scrollTo: {x:150}}
        ]},
        {assertions:[
          {equals: By.css("#scroll-info-x"), value: "150"},
          {equals: By.css("#scroll-info-y"), value: "0"},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/scroll.html"},
        {actions: [
          {scrollTo: {x:0, y:0}},
          {scrollTo: By.css(".bottom")}
        ]},
        {assertions:[
          {equals: By.css("#scroll-info-x"), value: "0"},
          {equals: By.css("#scroll-info-y"), value: "2000"},
        ]},
      ])
    })
  })

  test.it('The foreach directive must loop until the target is the last', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "https://127.0.0.1:8080/foreach.html"},
        {foreach: By.css("#foreach-test li>a"), scenario:[
          {execif: [ 
            [{exists: By.css('#contents')}],
            [{bool: true}], 
          ]},
          {assertions:[
            {likes: By.css("#contents span"), value: "This page is foreach-detail"},
          ]},
          {actions:[
            {click: By.css("#contents a")},
          ]}
        ]},
      ]).then(() => {
        return checker.run([
          {url: "https://127.0.0.1:8080/foreach.html"},
          {foreach: By.css("#select-link option"), scenario:[
            {execif: [ 
              [{exists: By.css('#contents')}],
              [{bool: true}], 
            ]},
            {assertions:[
              {likes: By.css("#contents span"), value: "This page is foreach-detail"},
            ]},
            {actions:[
              {click: By.css("#contents a")},
            ]}
          ]},
        ])
      })
    })
  })

  test.it('should when there is an while directive, operation continues as long as the condition is satisfied', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return driver.get("https://127.0.0.1:8080/transit-page.html")
    }).then(() => {
      return checker.run([
        {while: [
          [{notExists: By.css("#search-target")}]
        ], scenario: [
          {actions: [
            {click: By.css("#next") }
          ]}
        ]},
        {assertions:[
          {exists: By.css("#search-target")},
        ]}
      ])
    })
  })

  test.it('Confirm existence of "Failed to load resource".', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return driver.get("https://127.0.0.1:8080/failed-to-load-resource.html")
    }).then(() => {
      return checker.run([
        {actions: [
          {scrollTo: {x:1}}
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "ExistsError")
        assert(err.message.indexOf("Failed to load resource") != -1)
      })
    })
  })

  test.it('Confirm existence of "Mixed Content".', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return driver.get("https://127.0.0.1:8080/mixed-content.html")
    }).then(() => {
      return checker.run([
        {actions: [
          {scrollTo: {x:1}}
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err != undefined)
        assert(err.name == "ExistsError")
        assert(err.message.indexOf("Mixed Content") != -1)
      })
    })
  })

  test.it('Added to "IgnoreConsoleCheck" are ignored during console check.', () => {
    var checker = new Checker(driver)
    checker.addIgnoreConsoleCheck(log => log.message.indexOf("Mixed Content") != -1)
    return Promise.resolve().then(() => {
      return driver.get("https://127.0.0.1:8080/mixed-content.html")
    }).then(() => {
      return checker.run([
        {actions: [
          {scrollTo: {x:1}}
        ]},
      ]).catch(err => err).then(err => {
        if(noCatchTest) throw err
        assert(err == undefined)
      })
    })
  })
})
