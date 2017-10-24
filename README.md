# Simple selenium checker

[![npm version](https://badge.fury.io/js/simple-selenium-checker.svg)](https://badge.fury.io/js/simple-selenium-checker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a tool to make it easy to write tests for web applications without knowledge of Selenium and difficult Promise.

## Installation

npm install simple-selenium-checker

## Usage

Initialize Checker object with WebDriver as the argument.

```js
import webdriver from 'selenium-webdriver'
import Checker from 'simple-selenium-checker'
const By = webdriver.By;

const driver = new webdriver.Builder()
    .forBrowser('firefox')
    .build();

const checker = new Checker(driver)
```

Call run() method with the scenario as an array of objects.

```js
const checker = new Checker(driver)

const scenario = [
  {url: "https://http://127.0.0.1:8080/"},
  {assertions: [
    {exists: By.css("header")},
    {equals: By.css("h2"), value: "Home"},
  ]},
  {actions:[{click: By.css(".nav > li:nth-child(2) > a")}]},
  {assertions: [
    {equals: By.css("h2"), value: "Foo"},
  ]},
]

checker.run(scenario)
```

In the above scenario the following will be done.

1. opens `https://http://127.0.0.1:8080/`.
1. checks if there is a `header` element on the page.
1. checks if the inner text of `h2` tag is `Home`.
1. clicks second navigation menu link.
1. checks if the inner text of `h2` tag is `Foo`,  after the page loaded.

Javascript error and response status code error are checked automatically. These are implemented by checking the browser console log.

### url directive

Opens the specified URL. 

### assertions directive

```
{$assertion_name: locator|string $target [, value|values: string|string array|object(retval of attr()) $value] [, timeout: int $milliseconds]}
```

`assertions` directive checks the page is displayed correctly. All assertion of `assertions` directive waits for the element to be visible and wait until it is in the expected state. The wait time can change with a timeout property. The default timeout is 1200 ms. You can change the default timeout globally with `Checker.DefaultTimeout` property.

```js
Checker.DefaultTimeout = 1;

const checker = new Checker(driver)
...
```

#### $assertion_name

```
exsits|notExists|equals|notEquals|likes|notLikes|selected|unselected|checked|unchecked
```

| action | description |
|:--|:--|
| exsits notExists | check only the existence of the element. |
| equals notEquals | check the inner text or value with exact match |
| likes notLikes | check with partial match. |
| selected unselected | for select tag. |
| checked unchecked | for checkbox tag. |


#### $target

```
string html|string url|object By
```

Specify the check target.

| target | description |
|:--|:--|
| html | the entire response body. |
| url | the current page URL. |
| By | the HTML element by [the selenium By](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html) instance. |


#### value|values

Specify the expected value. When the target is form element (except textarea), compare with value, otherwise with inner text. checkbox and radio can handle multiple elements together.

If you set the return value of the attr function, it will be compared with the value of that attribute.

#### samples

```js
const scenario = [
  //Opens the specified page.
  {url: "https://http://127.0.0.1:8080/"}

  //Check the elements and text on the page.
  {assertions: [
    //Only the existence of the element.
    {exists: By.css("header")}
    {notExists: By.css("header .nav")}

    //Compare with the inner text of the element exactly.
    {equals: By.css(".main .col-sm-6:nth-child(2) h3"), value: "Home 002"},
    //When `timeout` is specified, it checks repeatedly for the specified milliseconds until the target element is visible.
    {notEquals: By.css(".main .col-sm-6:nth-child(2) h3"), , value: "Foo 002", timeout: 1000},
    
    //Compare with the inner text of the element partially.
    {likes: By.css(".main .col-sm-6:nth-child(2) h3"), value: "ome 00"},
    {notLikes: By.css(".main .col-sm-6:nth-child(2) h3"), value: "oo 00"},

    //Search with the entire body of the response partially.
    {likes: "html", value: "<title>Simple selenium checker - Home</title>"}

    //Compare with url.
    {equals: "url", value: "https://http://127.0.0.1:8080/"}


    //Html attribute
    {equals: By.css('img#foobar'), value: attr("alt", "foobar")}

    //checkboxes
    //<input type="checkobx" name="tag" value="tag1" checked> tag1
    //<input type="checkobx" name="tag" value="tag2" checked> tag2
    //<input type="checkobx" name="tag" value="tag3"> tag3
    {equals: By.css('input[type=checkbox][name=tag]'), values: ['tag1', 'tag2']}
    {checked: By.css('input[type=checkbox][name=tag]'), values: ['tag1']}
    {unchecked: By.css('input[type=checkbox][name=tag]'), values: ['tag3']}

    //radio
    {equals: By.css('input[type=radio][name=yea_or_no]'), value: 'yes'}

    //select with multilple attribute
    {equals: By.css('select.area'), values: ['area1', 'area2']}
    {selected: By.css('select.area'), values: ['area1']}
    {unselected: By.css('select.area'), values: ['area3']}
  ]}
]
```

### actions directive

`actions` directive deals with actions such as button clicks and form inputs. `actions` wait until the specified element becomes available, like `assertions`. It is also possible to specify a timeout property for each action, and the `Checker.DefaultTimeout` property is applied.

#### click

Click on the specified element such as button or link, etc.

```js
  {actions: [
    {click: By.css(".nav li:nth-child(2) > a")}
  ]}
```

#### sendKey

Enter a string in `input[type=text]` or `textarea`. Because it will be added, please use the `clear` action when you want to enter a new text.

```js
  {actions: [
    {sendKey: By.css("form input[type=text].name"), value: "Tom Chandler"}
  ]}
```

#### clear

This action clears the contents of `input[type=text]` or `textarea`. Also, use this to clear the checkbox or multiple selectable select tags.

```js
  {actions: [
    {clear: By.css("form input[type=text].name")}
  ]}
```

#### check|uncheck

`check` action check radio and checkbox. `uncheck` action unchecks the checkbox. You can not uncheck the radio. Although it can be checked by `click`, it is convenient because it does not do anything when already checked values is specified.


```js
  {actions: [
    //checkbox group
    {check: By.css("form input[type=checkbox][name=tag]"), values: ['tag1', 'tag2']}
    {unselect: By.css("form input[type=checkbox][name=tag]"), values: ['tag2', 'tag3']}
    
    //radio
    {check: By.css("form input[type=radio][name=sex]"), value: 'man'}
  ]}
```

#### select|unselect

Use `select` `unselect` to select and release select tag values.

```js
  {actions: [
    //select with multiple
    {select: By.css("form select.area"), values: ['area1', 'area2']}
    {unselect: By.css("form select.area"), values: ['area1']}

    //select without multiple
    {select: By.css("form select.sex"), value: 'man'}
    {unselect: By.css("form select.sex"), value: 'man'}
  ]}
```

#### alert

You can handle alert and confirm with the alert action. `accept` and `dismiss` can be specified for the value of the `alert`.

```js
  {actions: [
    //Click the button display alert.
    {click: By.css("#alert")},
    //Click OK button on alert.
    {alert: "accept"}

    {click: By.css("#confirm")},
    //Click cancel button on confirm.
    {alert: "dismiss"}
  ]}
```

#### switchTo

You can handle iframes with `switchTo` action.

```js
  {actions: [
    {switchTo: By.css("#index_frame")},
  ]},
  //... do something
  {actions: [
    {switchTo: 'default'},
  ]},
```

#### scrollTo

You can scroll the window by specifying coordinates.

```js
  {actions: [
    {scrollTo: {x: 30, y: 300}},
    {scrollTo: {x: 50}}, //The omitted axes will be 0.
    {scrollTo: {y: 300}},
  ]},
```

You can also scroll by specifying element.

```js
  {actions: [
    {scrollTo: By.css(".botton")},
  ]},
```

### execif directive

The scenario can be nested. If you use the execif directive, you skip the after that. Every key of assertions is available for each function of execif. Also, the key `bool` is available. this is useful in placeholder described below.

```js
const scenario = [
  //Opens the specified page.
  {url: "https://http://127.0.0.1:8080/"}

  //Scenarios can be nested.
  scenario: [
    //If `execif` evaluates to false, ignoring after directives.
    {execif: [//Elements in this array evaluated in the AND.
      [{exists: By.css('.foo')}, {exists: By.css('.bar')}], //Elements in this array evaluated in the OR.
      [{nonExists: By.css('.main')}],
      [{bool: true}],
    ]}
    
    //({exists: By.css('.foo')} OR {exists: By.css('.bar')}) AND {nonExists: By.css('.main')} AND {bool: true}
  ]
]
```

### foreach directive

The scenario can be nested. If you use the foreach directive, loop until the target is the last.
If you specify "By" instance in the "foreach" directive, click the target element in turn and execute the specified scenario repeatedly.

``` js
const scenario = [
  {url: "http://127.0.0.1:8080/foreach.html"},
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
  ]}
]
```

### while directive
If you specify conditions in the while directive, the specified scenario continues to run while the conditions are satisfied.  
The conditions that can be specified for the "while" directive are the same as those of the "execif" directive.

```js
const scenario = [
  //Opens the specified page.
  {url: "https://http://127.0.0.1:8080/"},

  //As long as the condition of 'while' is met, the 'scenario' will continue to run.
  {
    while:
    [
      [{notExists: By.css(".foo")}]
    ],
    scenario:
    [
      {actions: [
        {click: By.css(".next") }
      ]}
    ]
  },
  {actions:[
    {click: By.css(".foo")},
  ]}
]
```

### placeholder

With `placeholder` you can replace the elements in the scenario. Use this when you want to change the behavior by switching the setting file.

```js
import {placeholder} from 'simple-selenium-checker'

const scenario = [
  {url: placeholder('host_name').append('/form.html')}
  {assertions: [
    {exists: placeholder('assertions_exists_foo')}
  ]}
]
checker.placeholder = {
  'host_name': 'http://127.0.0.1:8080/',
  'assertions_exists_foo': By.css('.foo'),
}
checker.run(scenario)
```

This scenario is replaced as follows.

```js
[
  {url: 'http://127.0.0.1:8080/form.html'}
  {assertions: [
    {exists: By.css('.foo')}
  ]}
]
```

### debug

When Checker.run() fails, it displays all sources of HTML in the message. If you set to true the debug property, only the original error message is displayed.

```js
const checker = new Checker(driver)
checker.debug = true
```

### ignoreConsoleCheck

If use `addIgnoreConsoleCheck`, you can ignore the console error specified during test execution.  
The argument of `addIgnoreConsoleCheck` is a function to judge ignore target. Please return true if it is an ignore target.

* It is always active during test run.
```js
test.before(() => {
  Checker.addIgnoreConsoleCheck(log => log.message.indexOf("ignore target") != -1)//default ignore item.
```

* It is active only in running scenario.
```js
const checker = new Checker(driver)
checker.addIgnoreConsoleCheck(log => log.message.indexOf("ignore target") != -1)
```

## Test sample

* [mocha test sample](./samples/mocha/)

## Development

1. Fork and clone this repository. `git clone git@github.com:SunriseDigital/simple-selenium-checker.git`
1. Install dependencies. `npm install`
1. Install http-server. `npm install http-server -g`
1. Start http-server. `http-server -S`
1. Install selenium-standalone. `npm install selenium-standalone -g`
1. Start selenium-standalone. `selenium-standalone start`
1. Install gulp. `npm install gulp -g`
1. Start gulp task. `gulp`
1. Install mocha `npm install mocha -g`
1. Run test. `npm test`
