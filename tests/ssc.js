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
    const args = ["--window-size=1024,768"]
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
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: By.css(".main .col-sm-6:nth-child(2) h3"), value: "Home 002"},
          {equals: By.css(".main .col-sm-6:nth-child(3) img"), type: {attr: 'alt'}, value: "Home alt 003"},
          {likes: "html", value: "<title>Simple selenium checker - Home</title>"} 
        ]
      },{
        actions:[
          {click: By.css(".nav > li:nth-child(2) > a")},
        ]
      },{
        checks: [
          {exists: By.css(".delay-content"), timeout: 8000},
          {equals: By.css(".main .col-sm-6:nth-child(2) h3"), value: "Foo 002"},
          {equals: By.css(".main .col-sm-6:nth-child(3) img"), type: {attr: "alt"}, value: "Foo alt 003"},
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
        url: "http://127.0.0.1:8080/"
      },{
        checks: [
          {exists: By.css("#foo")},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotSuchElementError")
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
        assert(err.name == "NotSuchElementError")
      })
    })
  })

  test.it('should fail when the inner text of the element does not match.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      }, {
        checks: [
          {equals: By.css(".main .col-sm-6:nth-child(2) h3"), value: "Hoge 002"},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Hoge 002') >= 0)
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
          {equals: By.css(".main .col-sm-6:nth-child(3) h3"), value: "Bar 003"},
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Bar 003') >= 0)
      })
    })
  })

  test.it('should fail when text that is not in the page is specified.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/"
      },{
        checks: [
          {likes: "html", value: "<title>Simple selenium checker - Hoge</title>"} 
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('<title>Simple selenium checker - Hoge</title>') >= 0)
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
          {likes: "html", value: "<title>Simple selenium checker - Bar</title>"} 
        ],
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('<title>Simple selenium checker - Bar</title>') >= 0)
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
        assert(err.name == "JavascriptError")
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
        assert(err.name == "StatusCodeError")
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
          {equals: "url", value: "http://127.0.0.1:8080/index.html?name=fooBarTest&send=send"} ,
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
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {equals: 'url', value: "http://127.0.0.1:8080/"} ,
          {likes: 'url', value: "127.0.0.1"} ,
          {notEquals: 'url', value: "http://127.0.0.1:8080/foobar.html"} ,
          {notLikes: 'url', value: "foobar"} ,
        ]
      }]

      return checker.run(scenario)
    }).then(() => {
      return checker.run([{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {equals: 'url', value: "http://127.0.0.1:8080/hoge.html"} ,
        ]
      }]).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('http://127.0.0.1:8080/hoge.html') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {likes: 'url', value: "hoge.html"} ,
        ]
      }]).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('hoge.html') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {notEquals: 'url', value: "http://127.0.0.1:8080/"} ,
        ]
      }]).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('http://127.0.0.1:8080/') >= 0)
      })
    }).then(() => {
      return checker.run([{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {notLikes: 'url', value: "127.0.0.1"} ,
        ]
      }]).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('127.0.0.1') >= 0)
      })
    })
  })

  test.it('should stop formatting the error when the debug property is true.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {equals: 'url', value: "http://127.0.0.1:8080/hoge.html"} ,
        ]
      }]

      const checker = new Checker(driver)
      checker.debug = true;
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('http://127.0.0.1:8080/hoge.html') >= 0)
      })
    })
  })

  test.it('should check partial match with the like keyword of checks option.', () => {
    return Promise.resolve().then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {likes: By.css(".main .col-sm-6:nth-child(1) h3"), value: "ome 00"},
          {likes: By.css(".main .col-sm-6:nth-child(2) h3"), value: "ome 00"},
          {likes: By.css(".main .col-sm-6:nth-child(3) h3"), value: "ome 00"}
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario)
    }).then(() => {
      const scenario = [{
        url: "http://127.0.0.1:8080/",
      },{
        checks: [
          {likes: By.css(".main .col-sm-6:nth-child(1) h3"), value: "bar"},
        ]
      }]

      const checker = new Checker(driver)
      return checker.run(scenario).catch(err => err).then(err => {
        assert(err != undefined)
        assert(err.name == "NotMatchError")
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
        checks: [
          {exists: placeholder('checks_by')},
          {equals: By.css(".main .col-sm-6:nth-child(1) h3"), value: placeholder('checks_equals')},
          {likes: By.css(".main .col-sm-6:nth-child(2) h3"), value: placeholder('checks_likes')},
          {equals: By.css(".main .col-sm-6:nth-child(3) h3"), type: {attr:"value"}, value: placeholder('checks_attr_value')}
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
          {equals: By.css(".input"), type: {attr: 'value'}, value: 'placeholdercheck'}
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
      assert(resScenario[2].checks[1].value === 'Foo 001')
      assert(resScenario[2].checks[2].value === 'oo 00')
      // https://gist.github.com/gomo/474b14bbf8955e0a20d56902eafd0fb8
      assert(resScenario[2].checks[3].value === null)
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
      //equals true
      return checker._testExecif([
        [{equals: By.css('h2'), value: "Home"}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //equals false
      return checker._testExecif([
        [{equals: By.css('h2'), value: "Foo"}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //notEquals true
      return checker._testExecif([
        [{notEquals: By.css('h2'), value: "Foo"}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //notEquals false
      return checker._testExecif([
        [{notEquals: By.css('h2'), value: "Home"}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //likes true
      return checker._testExecif([
        [{likes: By.css('h2'), value: "om"}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //likes false
      return checker._testExecif([
        [{likes: By.css('h2'), value: "Foo"}]
      ]).then(res => assert(res === false))
    }).then(() => {
      //notLikes true
      return checker._testExecif([
        [{notLikes: By.css('h2'), value: "Foo"}]
      ]).then(res => assert(res === true))
    }).then(() => {
      //notLikes false
      return checker._testExecif([
        [{notLikes: By.css('h2'), value: "om"}]
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
      return driver.get('http://127.0.0.1:8080/options.html')
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
        assert(err.name == "NotSuchElementError")
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
        assert(err.name == "NotSuchElementError")
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
        assert(err.name == "NotSuchElementError")
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
        assert(err.name == "NotSuchElementError")
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
        assert(err.name == "NotSuchElementError")
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
        assert(err.name == "NotSuchElementError")
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
        assert(err.name == "NotSuchElementError")
      })
    })
  })

  test.it('should be able to check HTML attributes.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {equals: By.css(".nav > li:nth-child(2) > a"), type: {attr: "href"}, value: 'http://127.0.0.1:8080/foo.html'},
          {equals: By.css("header"), type: {attr: "class"}, value: 'page-header'},
          {equals: By.css(".nav"), type: {attr: "class"}, value: 'nav nav-pills'},
          {equals: By.css(".nav"), type: {attr: "class"}, value: 'nav'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('`nav`') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {likes: By.css(".nav > li:nth-child(2) > a"), type: {attr: "href"}, value: '/foo.html'},
          {likes: By.css("header"), type: {attr: "class"}, value: 'ge-head'},
          {likes: By.css(".nav"), type: {attr: "class"}, value: 'nav-pil'},
          {likes: By.css(".nav"), type: {attr: "class"}, value: 'foooo'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('foooo') >= 0)
      })
    })
  })

  test.it('should be able to do a negative check.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notEquals: By.css(".nav > li:nth-child(1) > a"), value: 'Bar'},
          {notEquals: By.css(".nav > li:nth-child(2) > a"), value: 'Bar'},
          {notEquals: By.css(".nav > li:nth-child(2) > a"), type: {attr: "href"}, value: 'http://127.0.0.1:8080/bar.html'},
          {notEquals: By.css("header"), type: {attr: "class"}, value: 'page-footer'},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notEquals: By.css(".nav > li:nth-child(1) > a"), value: 'Home'}
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Home') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notEquals: By.css(".nav > li:nth-child(2) > a"), type: {attr: "href"}, value: 'http://127.0.0.1:8080/foo.html'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('http://127.0.0.1:8080/foo.html') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notLikes: By.css(".nav > li:nth-child(1) > a"), value: 'Bar'},
          {notLikes: By.css(".nav > li:nth-child(2) > a"), value: 'Bar'},
          {notLikes: By.css(".nav > li:nth-child(2) > a"), type: {attr: "href"}, value: 'http://127.0.0.1:8080/bar.html'},
          {notLikes: By.css("header"), type: {attr: "class"}, value: 'page-footer'},
          {notLikes: 'html', value: 'foobarfoobar'} 
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notLikes: By.css(".nav > li:nth-child(2) > a"), value: 'Foo'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Foo') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notLikes: By.css("header"), type: {attr: "class"}, value: 'page-header'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('page-header') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notLikes: 'html', value: 'Simple selenium checker'} ,
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('Simple selenium checker') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notExists: By.css(".not-exists")},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/"},
        {checks: [
          {notExists: By.css("body")},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "ElementExistsError")
      })
    })
  })

  test.it('should be able to handle checkboxes.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox', values: ['checkbox2']},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox', values: ['checkbox1', 'checkbox2']},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('checkbox1,checkbox2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
        ]},
        {checks: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox', values: []},
          {unchecked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']} 
        ]},
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox3']},
        ]},
        {checks: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox', values: ['checkbox1', 'checkbox3']},
          {checked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']} ,
          {checked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox3']} 
        ]}
        ,
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1', 'checkbox2']},
        ]},
        {checks: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox', values: ['checkbox1', 'checkbox2', 'checkbox3']},
        ]},
        {actions: [
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {checks: [
          {equals: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox', values: ['checkbox1', 'checkbox2', 'checkbox3']},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
        ]},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {checks: [
          {unchecked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']} 
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('checkbox1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
        ]},
        {actions: [
          {clear: By.css(".checkbox-inline input[name=checkbox]"), type: 'checkbox'},
          {check: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox1']},
        ]},
        {checks: [
          {checked: By.css(".checkbox-inline input[name=checkbox]"), values: ['checkbox2']} 
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('checkbox2') >= 0)
      })
    })
  })

  test.it('should be able to handle radio buttons.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: By.css(".radio-inline input[name=radio]"), value: 'radio2', type: 'radio'},
        ]},
      ])
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: By.css(".radio-inline input[name=radio]"), value: 'radio1', type: 'radio'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('radio1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
        {checks: [
          {equals: By.css(".radio-inline input[name=radio]"), value: 'radio1', type: 'radio'},
        ]},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio99'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotSuchElementError")
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {check: By.css(".radio-inline input[name=radio]"), value: 'radio1'},
        ]},
        {checks: [
          {notEquals: By.css(".radio-inline input[name=radio]"), value: 'radio2', type: 'radio'},
          {notEquals: By.css(".radio-inline input[name=radio]"), value: 'radio1', type: 'radio'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('radio1') >= 0)
      })
    })
  })

  test.it('should be able to handle non multiple select tag.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: By.css(".select-single"), value: 'option1', type: 'select'},
          {equals: By.css(".select-single"), value: 'option2', type: 'select'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {select: By.css(".select-single"), value: 'option3'},
        ]},
        {checks: [
          {equals: By.css(".select-single"), value: 'option3', type: 'select'},
          {equals: By.css(".select-single"), value: 'option2', type: 'select'},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {selected: By.css(".select-single"), value: 'option1'} ,
          {selected: By.css(".select-single"), value: 'option2'} ,
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option2') >= 0)
      })
    })
    .then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {unselected: By.css(".select-single"), value: 'option2'} ,
          {unselected: By.css(".select-single"), value: 'option3'} ,
          {unselected: By.css(".select-single"), value: 'option1'} ,
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option1') >= 0)
      })
    })
  })

  test.it('should be able to handle multiple select tag.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {equals: By.css(".select-multiple"), type: 'select', values: ['option2', 'option3']},
          {equals: By.css(".select-multiple"), type: 'select', values: ['option1']},
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {checks: [
          {selected: By.css(".select-multiple"), values: ['option2']} ,
          {selected: By.css(".select-multiple"), values: ['option3']} ,
          {selected: By.css(".select-multiple"), values: ['option1']} ,
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option1') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".select-multiple"), type: 'select'},
          {select: By.css(".select-multiple"), values: ['option2']},
        ]},
        {checks: [
          {unselected: By.css(".select-multiple"), values: ['option1']} ,
          {unselected: By.css(".select-multiple"), values: ['option3']} ,
          {unselected: By.css(".select-multiple"), values: ['option2']} ,
        ]},
      ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf('option2') >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/options.html"},
        {actions: [
          {clear: By.css(".select-multiple"), type: 'select'},
        ]},
        {checks: [
          {equals: By.css(".select-multiple"), type: 'select', values: []},
        ]},
        {actions: [
          {select: By.css(".select-multiple"), values: ['option1', 'option3']},
        ]},
        {checks: [
          {equals: By.css(".select-multiple"), type: 'select', values: ['option1', 'option3']},
        ]},
        {actions: [
          {select: By.css(".select-multiple"), values: ['option2', 'option3']},
        ]},
        {checks: [
          {equals: By.css(".select-multiple"), type: 'select', values: ['option1', 'option2', 'option3']},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option3']},
        ]},
        {checks: [
          {equals: By.css(".select-multiple"), type: 'select', values: ['option1', 'option2']},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option3']},
        ]},
        {checks: [
          {equals: By.css(".select-multiple"), type: 'select', values: ['option1', 'option2']},
        ]},
        {actions: [
          {unselect: By.css(".select-multiple"), values: ['option1', 'option2']},
        ]},
        {checks: [
          {equals: By.css(".select-multiple"), type: 'select', values: []},
        ]},
      ])
    })
  })

  test.it('should be able to handle alert and confirm.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
       return checker.run([
        {url: "http://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#alert")},
          {alert: "accept", timeout: 3000}
        ]},
        {checks: [
          {equals: By.css("#display"), value: "Alert", timeout: 3000},
        ]},
       ])
    }).then(() => {
       return checker.run([
        {url: "http://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#confirm")},
          {alert: "accept", timeout: 3000}
        ]},
        {checks: [
          {equals: By.css("#display"), value: "Confirm OK", timeout: 3000},
        ]},
       ])
    }).then(() => {
       return checker.run([
        {url: "http://127.0.0.1:8080/alert.html"},
        {actions: [
          {click: By.css("#confirm")},
          {alert: "dismiss", timeout: 3000}
        ]},
        {checks: [
          {equals: By.css("#display"), value: "Confirm Cancel", timeout: 3000},
        ]},
       ])
    })
  })

  test.it('should be able to handle frame.', () => {
    const checker = new Checker(driver)
    return Promise.resolve().then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/frame.html"},
        {actions: [
          {switchTo: By.css("#index_frame")},
        ]},
        {checks: [
          {equals: By.css("h2"), value: "Home"},
          {equals: By.css("h2"), value: "FooBar"},
        ]},
       ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf("FooBar") >= 0)
      })
    }).then(() => {
      return checker.run([
        {url: "http://127.0.0.1:8080/frame.html"},
        {actions: [
          {switchTo: By.css("#index_frame")},
        ]},
        {checks: [
          {equals: By.css("h2"), value: "Home"},
        ]},
        {actions: [
          {switchTo: 'default'},
        ]},
        {checks: [
          {equals: By.css("h2"), value: "Frame"},
          {equals: By.css("h2"), value: "FooBar"},
        ]},
       ]).catch(err => {
        assert(err !== undefined)
        assert(err.name == "NotMatchError")
        assert(err.message.indexOf("FooBar") >= 0)
      })
    })
  })
})
