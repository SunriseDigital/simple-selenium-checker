(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("selenium-webdriver"));
	else if(typeof define === 'function' && define.amd)
		define(["selenium-webdriver"], factory);
	else if(typeof exports === 'object')
		exports["SimpleSeleniumChecker"] = factory(require("selenium-webdriver"));
	else
		root["SimpleSeleniumChecker"] = factory(root["WebDriver"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(8);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(9);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6), __webpack_require__(7)))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UnexpectedValue = exports.UnexpectedValue = function (_Error) {
  _inherits(UnexpectedValue, _Error);

  function UnexpectedValue(message, error) {
    _classCallCheck(this, UnexpectedValue);

    var _this = _possibleConstructorReturn(this, (UnexpectedValue.__proto__ || Object.getPrototypeOf(UnexpectedValue)).call(this, message, error));

    _this.name = "UnexpectedValue";
    if (error !== undefined) {
      _this.stack = error.stack;
    }
    return _this;
  }

  return UnexpectedValue;
}(Error);

var NoSuchElementError = exports.NoSuchElementError = function (_Error2) {
  _inherits(NoSuchElementError, _Error2);

  function NoSuchElementError(message, error) {
    _classCallCheck(this, NoSuchElementError);

    var _this2 = _possibleConstructorReturn(this, (NoSuchElementError.__proto__ || Object.getPrototypeOf(NoSuchElementError)).call(this, message, error));

    _this2.name = "NoSuchElementError";
    if (error !== undefined) {
      _this2.stack = error.stack;
    }
    return _this2;
  }

  return NoSuchElementError;
}(Error);

var ExistsError = exports.ExistsError = function (_Error3) {
  _inherits(ExistsError, _Error3);

  function ExistsError(message, error) {
    _classCallCheck(this, ExistsError);

    var _this3 = _possibleConstructorReturn(this, (ExistsError.__proto__ || Object.getPrototypeOf(ExistsError)).call(this, message, error));

    _this3.name = "ExistsError";
    if (error !== undefined) {
      _this3.stack = error.stack;
    }
    return _this3;
  }

  return ExistsError;
}(Error);

var JavascriptError = exports.JavascriptError = function (_Error4) {
  _inherits(JavascriptError, _Error4);

  function JavascriptError(message, error) {
    _classCallCheck(this, JavascriptError);

    var _this4 = _possibleConstructorReturn(this, (JavascriptError.__proto__ || Object.getPrototypeOf(JavascriptError)).call(this, message, error));

    _this4.name = "JavascriptError";
    if (error !== undefined) {
      _this4.stack = error.stack;
    }
    return _this4;
  }

  return JavascriptError;
}(Error);

var StatusCodeError = exports.StatusCodeError = function (_Error5) {
  _inherits(StatusCodeError, _Error5);

  function StatusCodeError(message, error) {
    _classCallCheck(this, StatusCodeError);

    var _this5 = _possibleConstructorReturn(this, (StatusCodeError.__proto__ || Object.getPrototypeOf(StatusCodeError)).call(this, message, error));

    _this5.name = "StatusCodeError";
    if (error !== undefined) {
      _this5.stack = error.stack;
    }
    return _this5;
  }

  return StatusCodeError;
}(Error);

var VerboseError = exports.VerboseError = function (_Error6) {
  _inherits(VerboseError, _Error6);

  function VerboseError(message, error) {
    _classCallCheck(this, VerboseError);

    var _this6 = _possibleConstructorReturn(this, (VerboseError.__proto__ || Object.getPrototypeOf(VerboseError)).call(this, message));

    _this6.name = error.name;
    _this6.stack = error.stack;
    return _this6;
  }

  return VerboseError;
}(Error);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _seleniumWebdriver = __webpack_require__(0);

var _seleniumWebdriver2 = _interopRequireDefault(_seleniumWebdriver);

var _util = __webpack_require__(1);

var _util2 = _interopRequireDefault(_util);

var _assertions = __webpack_require__(10);

var assertions = _interopRequireWildcard(_assertions);

var _actions = __webpack_require__(11);

var actions = _interopRequireWildcard(_actions);

var _errors = __webpack_require__(2);

var errors = _interopRequireWildcard(_errors);

var _placeholder = __webpack_require__(4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var until = _seleniumWebdriver2.default.until;
var By = _seleniumWebdriver2.default.By;
var Key = _seleniumWebdriver2.default.Key;

var Checker = function () {
  function Checker(driver) {
    var _this = this;

    _classCallCheck(this, Checker);

    this.driver = driver;
    this.debug = Checker.Debug;
    this.ignoreConsoleCheck = [];
    Checker.IgnoreConsoleCheck.forEach(function (func) {
      return _this.addIgnoreConsoleCheck(func);
    });
  }

  _createClass(Checker, [{
    key: 'handleAlert',
    value: function handleAlert(alertAction, timeout) {
      return this.waitAlert(timeout).then(function (alert) {
        if (!alert[alertAction]) {
          throw new Error("Missing " + alertAction + " action in alert.");
        }

        return alert[alertAction]();
      });
    }
  }, {
    key: 'waitAlert',
    value: function waitAlert(timeout) {
      var _this2 = this;

      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      return this.driver.wait(until.alertIsPresent(), timeout).then(function () {
        return _this2.driver.switchTo().alert();
      });
    }
  }, {
    key: 'assembleFromElements',
    value: function assembleFromElements(elems, values) {
      var promise = _seleniumWebdriver2.default.promise.map(elems, function (elem) {
        return { elem: elem };
      });

      Object.keys(values).forEach(function (key) {
        var func = values[key];
        promise = promise.then(function (composits) {
          return _seleniumWebdriver2.default.promise.map(composits, function (composit) {
            return func(composit.elem).then(function (value) {
              composit[key] = value;
              return composit;
            });
          });
        });
      });

      return promise;
    }
  }, {
    key: 'waitForValueCheck',
    value: function waitForValueCheck(check, action) {
      var timeout = check.timeout;
      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      return this.driver.wait(new _seleniumWebdriver2.default.Condition('', function () {
        return action();
      }), timeout).catch(function (err) {
        if (err.name == 'TimeoutError') {
          var message = '';
          if (check.type == 'html') {
            message = _util2.default.format("%s: [%s], expected: `%s`", check.name, check.type, check.value || check.values);
          } else if (check.hasOwnProperty('locator')) {
            message = _util2.default.format("%s: [%s] %s, expected: `%s`, actual: `%s`", check.name, check.type, check.locator, check.value || check.values, check.actual_values);
          } else {
            message = _util2.default.format("%s: [%s], expected: `%s`, actual: `%s`", check.name, check.type, check.value || check.values, check.actual_values);
          }

          throw new errors.UnexpectedValue(message, err);
        }
        throw err;
      });
    }
  }, {
    key: 'waitDissapearElements',
    value: function waitDissapearElements(locator, timeout) {
      var _this3 = this;

      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      var cond = new _seleniumWebdriver2.default.Condition(locator + ' disappear from the screen.', function () {
        return _this3.driver.findElements(locator).then(function (elems) {
          return elems.length === 0;
        });
      });
      return this.driver.wait(cond, timeout);
    }
  }, {
    key: 'waitElementsIn',
    value: function waitElementsIn(element, locator, count, timeout) {
      if (count === undefined) count = 1;
      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      var cond = new _seleniumWebdriver2.default.Condition(_util2.default.format('for %s to be located %s in specified element', count > 1 ? count + " elements" : 'element', locator), function () {
        return element.findElements(locator).then(function (elems) {
          if (elems.length >= count) {
            return elems;
          }

          return false;
        });
      });

      return this.driver.wait(cond, timeout);
    }
  }, {
    key: 'waitElements',
    value: function waitElements(locator, count, timeout) {
      var _this4 = this;

      if (count === undefined) count = 1;
      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      var cond = new _seleniumWebdriver2.default.Condition(_util2.default.format('for %s to be located %s', count > 1 ? count + " elements" : 'element', locator), function () {
        return _this4.driver.findElements(locator).then(function (elems) {
          if (elems.length >= count) {
            return elems;
          }

          return false;
        });
      });

      return this.driver.wait(cond, timeout);
    }
  }, {
    key: 'waitElement',
    value: function waitElement(locator, timeout) {
      var _this5 = this;

      if (timeout === undefined) timeout = Checker.DefaultTimeout;
      return this.driver.wait(until.elementLocated(locator), timeout).then(function (elem) {
        return _this5.driver.wait(until.elementIsVisible(elem), timeout);
      });
    }
  }, {
    key: '_detectFunction',
    value: function _detectFunction(functions, obj) {
      var keys = [];
      var func = undefined;
      for (var key in functions) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key);
          if (func) throw new Error("Found two identify keys. " + keys.join(','));
          func = functions[key];
        }
      }

      if (!func) {
        throw new Error("Missing supported directive in " + JSON.stringify(obj));
      }

      return func;
    }
  }, {
    key: '_testItem',
    value: function _testItem(condition) {
      if (condition.hasOwnProperty('bool')) {
        return Promise.resolve(condition.bool !== false);
      } else {
        return this._detectFunction(assertions, condition)(this, condition).then(function () {
          return true;
        }).catch(function (err) {
          if (['UnexpectedValue', 'NoSuchElementError', 'ExistsError'].indexOf(err.name) >= 0) {
            return false;
          }

          throw err;
        });
      }
    }
  }, {
    key: '_testGroup',
    value: function _testGroup(conditions) {
      var _this6 = this;

      var promise = Promise.resolve(false);
      conditions.forEach(function (item) {
        promise = promise.then(function (res) {
          if (res === true) return true; //OR
          return _this6._testItem(item);
        });
      });

      return promise;
    }
  }, {
    key: '_testExecif',
    value: function _testExecif(conditions) {
      var _this7 = this;

      var promise = Promise.resolve(true);
      if (conditions) {
        conditions.forEach(function (group) {
          promise = promise.then(function (res) {
            if (res === false) return false; //AND
            return _this7._testGroup(group);
          });
        });
      }

      return promise;
    }
  }, {
    key: '_execForeach',
    value: function _execForeach(elems, item) {
      var _this8 = this;

      var promise = Promise.resolve();
      elems.forEach(function (value, index) {
        promise = promise.then(function () {
          return _this8.driver.findElements(item.foreach);
        }).then(function (targets) {
          return targets[index];
        }).then(function (elem) {
          return elem.click();
        }).then(function () {
          return _this8.run(item.scenario);
        });
      });

      return promise;
    }
  }, {
    key: 'executeWhile',
    value: function executeWhile(promise, item) {
      var _this9 = this;

      return promise.then(function (res) {
        if (res === true) {
          return _this9.run(item.scenario).then(function () {
            return _this9.executeWhile(_this9._testExecif(item.while), item);
          });
        } else {
          return Promise.resolve();
        }
      });
    }
  }, {
    key: 'run',
    value: function run(scenario, promise) {
      var _this10 = this;

      if (!promise) {
        promise = Promise.resolve();
      }

      scenario.forEach(function (item) {
        if (item.foreach) {
          promise = promise.then(function () {
            return _this10.driver.findElements(item.foreach);
          }).then(function (elems) {
            return _this10._execForeach(elems, item);
          });
        } else if (item.while) {
          promise = promise.then(function () {
            return _this10.executeWhile(_this10._testExecif(item.while), item);
          });
        } else if (item.scenario) {
          promise = _this10.run(item.scenario, promise);
        } else {
          //directive count check.
          var directives = Object.keys(item);
          if (directives.length > 1) {
            throw new Error('Only one directive can be placed in one scenario item.');
          }

          //check supported directives
          if (directives.length === 1 && ['execif', 'url', 'actions', 'assertions'].indexOf(directives[0]) === -1) {
            throw new Error("Illegal directive object. " + JSON.stringify(item));
          }

          item = _this10._applyPlaceholder(item);

          //execif
          if (item.execif) {
            promise = promise.then(function () {
              return _this10._testExecif(item.execif);
            });
          } else if (item.url) {
            //Until authenticateAs is officially supported, basic authentication is attempted based on the last displayed URL.
            //see actions.authenticateAs()
            _this10.lastUrl = item.url;
            promise = promise.then(function (res) {
              if (res === false) return false;
              return _this10.driver.get(item.url);
            });
          } else if (item.actions) {
            item.actions.forEach(function (action) {
              promise = promise.then(function (res) {
                if (res === false) return false;
                return _this10._detectFunction(actions, action)(_this10, action);
              });
            });

            promise = promise.then(function () {
              return _this10.driver.getCurrentUrl().then(function (url) {
                return _this10.lastUrl = url;
              });
            });
          } else if (item.assertions) {
            item.assertions.forEach(function (check) {
              promise = promise.then(function (res) {
                if (res === false) return false;
                return _this10._detectFunction(assertions, check)(_this10, check);
              });
            });
          }

          //Check javascript and response errors using browser logs.
          promise = promise.then(function (res) {
            if (res === false) return false;
            return _this10.driver.getCurrentUrl().then(function (url) {
              return new Promise(function (resolve) {
                _this10.driver.manage().logs().get('browser').then(function (logs) {
                  logs.forEach(function (log) {
                    //skip
                    if (_this10.ignoreConsoleCheck && _this10.ignoreConsoleCheck.some(function (func) {
                      return func(log) === true;
                    })) {
                      return;
                    }

                    //javascript
                    if (Checker.JsErrorStrings.some(function (err) {
                      return log.message.indexOf(err) >= 0;
                    })) {
                      throw new errors.JavascriptError(log.message);
                    }

                    //Mixed Content for SSL
                    if (log.message.indexOf("Mixed Content") != -1) {
                      throw new errors.ExistsError(log.message);
                    }

                    //response
                    if (log.message.indexOf(url + " - ") === 0) {
                      var msg = log.message.split(url).join("");
                      for (var i = 400; i <= 599; i++) {
                        if (msg.indexOf(" " + i + " ") >= 0) {
                          throw new errors.StatusCodeError(log.message);
                        }
                      }
                    }

                    //Failed to load resource or GET 404
                    if (log.message.indexOf("Failed to load resource") != -1) {
                      throw new errors.ExistsError(log.message);
                    } else if (log.message.indexOf("GET") != -1 && log.message.indexOf("Not Found") != -1) {
                      throw new errors.ExistsError(log.message);
                    }
                  });
                  resolve();
                });
              });
            });
          });

          //Format the error.
          if (_this10.debug === false) {
            promise = promise.catch(function (err) {
              return _this10.driver.findElement(By.css('html')).then(function (elem) {
                return elem.getAttribute('outerHTML');
              }).then(function (html) {
                return _this10.driver.getCurrentUrl().then(function (url) {
                  var data = Object.assign({}, _this10.data);
                  delete data.next;
                  var message = url + "\n" + "JSON: " + JSON.stringify(item) + "\n" + "Name: " + err.name + "\n" + "Message: " + err.message + "\n" + html;
                  throw new errors.VerboseError(message, err);
                });
              });
            });
          }
        }
      });

      return promise.then(function () {
        return undefined;
      });
    }
  }, {
    key: '_applyPlaceholderToValue',
    value: function _applyPlaceholderToValue(value) {
      if (value instanceof _placeholder.Placeholder) {
        if (this.placeholder.hasOwnProperty(value.placeholderKey)) {
          return value.apply(this.placeholder[value.placeholderKey]);
        } else {
          throw new Error('Missing ' + value.placeholderKey + ' key in placeholder.');
        }
      } else if (typeof value != 'string') {
        //for attr
        for (var key in value) {
          value[key] = this._applyPlaceholderToValue(value[key]);
        }
        return value;
      } else {
        return value;
      }
    }
  }, {
    key: '_applyPlaceholderToArray',
    value: function _applyPlaceholderToArray(elems) {
      var _this11 = this;

      var newElems = [];
      elems.forEach(function (elem) {
        if (elem.forEach) {
          newElems.push(_this11._applyPlaceholderToArray(elem));
        } else {
          var newElem = {};
          for (var elemKey in elem) {
            newElem[elemKey] = _this11._applyPlaceholderToValue(elem[elemKey]);
          }
          newElems.push(newElem);
        }
      });

      return newElems;
    }
  }, {
    key: '_applyPlaceholder',
    value: function _applyPlaceholder(scenarioItem) {
      if (this.placeholder === undefined) {
        return scenarioItem;
      }

      var newItem = {};
      for (var itemKey in scenarioItem) {
        var elem = scenarioItem[itemKey];
        if (elem.forEach) {
          newItem[itemKey] = this._applyPlaceholderToArray(elem);
        } else {
          newItem[itemKey] = this._applyPlaceholderToValue(elem);
        }
      }

      return newItem;
    }
  }, {
    key: 'addIgnoreConsoleCheck',
    value: function addIgnoreConsoleCheck(func) {
      this.ignoreConsoleCheck.push(func);
    }
  }]);

  return Checker;
}();

exports.default = Checker;


Checker.IgnoreConsoleCheck = [];
Checker.addIgnoreConsoleCheck = function (func) {
  return Checker.IgnoreConsoleCheck.push(func);
};

Checker.JsErrorStrings = ["SyntaxError", "EvalError", "ReferenceError", "RangeError", "TypeError", "URIError"];

Checker.Debug = false;

Checker.DefaultTimeout = 12000;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = placeholder;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Placeholder = exports.Placeholder = function () {
  function Placeholder(key) {
    _classCallCheck(this, Placeholder);

    this.key = key;
    this.appendedTexts = [];
  }

  _createClass(Placeholder, [{
    key: 'append',
    value: function append(text) {
      this.appendedTexts.push(text);
      return this;
    }
  }, {
    key: 'apply',
    value: function apply(holderItem) {
      if (this.appendedTexts.length) {
        return holderItem + this.appendedTexts.join('');
      } else {
        return holderItem;
      }
    }
  }, {
    key: 'placeholderKey',
    get: function get() {
      return this.key;
    }
  }]);

  return Placeholder;
}();

function placeholder(key) {
  return new Placeholder(key);
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attr = exports.placeholder = exports.Checker = undefined;

var _Checker = __webpack_require__(3);

var _Checker2 = _interopRequireDefault(_Checker);

var _placeholder = __webpack_require__(4);

var _placeholder2 = _interopRequireDefault(_placeholder);

var _attr = __webpack_require__(12);

var _attr2 = _interopRequireDefault(_attr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Checker2.default;
exports.Checker = _Checker2.default;
exports.placeholder = _placeholder2.default;
exports.attr = _attr2.default;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exists = exists;
exports.notExists = notExists;
exports.likes = likes;
exports.notLikes = notLikes;
exports.equals = equals;
exports.notEquals = notEquals;
exports.unchecked = unchecked;
exports.checked = checked;
exports.selected = selected;
exports.unselected = unselected;

var _seleniumWebdriver = __webpack_require__(0);

var _seleniumWebdriver2 = _interopRequireDefault(_seleniumWebdriver);

var _util = __webpack_require__(1);

var _util2 = _interopRequireDefault(_util);

var _errors = __webpack_require__(2);

var errors = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var By = _seleniumWebdriver2.default.By;

function createPromise(checker, assertion) {
  if (assertion.locator) {
    return checker.waitElements(assertion.locator, assertion.count, assertion.timeout).then(function (elems) {
      return checker.assembleFromElements(elems, {
        tag_name: function tag_name(elem) {
          return elem.getTagName();
        },
        type: function type(elem) {
          return elem.getAttribute('type');
        },
        value: function value(elem) {
          return elem.getAttribute('value');
        },
        multiple: function multiple(elem) {
          return elem.getAttribute('multiple');
        },
        selected: function selected(elem) {
          return elem.isSelected();
        },
        inner_text: function inner_text(elem) {
          return elem.getText();
        },
        attr: function attr(elem) {
          return assertion.type && assertion.type.hasOwnProperty('attr') ? elem.getAttribute(assertion.type.attr) : Promise.resolve(false);
        }
      });
    }).then(function (composits) {
      if (composits[0].tag_name == 'select') {
        return checker.waitElementsIn(composits[0].elem, By.css('option'), assertion.count, assertion.timeout).then(function (elems) {
          return checker.assembleFromElements(elems, {
            value: function value(elem) {
              return elem.getAttribute('value');
            },
            selected: function selected(elem) {
              return elem.isSelected();
            }
          });
        }).then(function (sComposits) {
          return sComposits.filter(function (sComposit) {
            return sComposit.selected;
          });
        }).then(function (sComposits) {
          return {
            values: sComposits.map(function (sComposit) {
              return sComposit.value;
            }),
            type: 'select value'
          };
        });
      } else if (composits[0].attr !== false) {
        return {
          values: composits.map(function (composit) {
            return composit.attr;
          }),
          type: assertion.type.attr + ' attribute'
        };
      } else if (composits[0].type == "checkbox" || composits[0].type == "radio") {
        return {
          values: composits.filter(function (composit) {
            return composit.selected;
          }).map(function (composit) {
            return composit.value;
          }),
          type: composits[0].type + ' value'
        };
      } else if (composits[0].tag_name == "input") {
        return {
          values: composits.map(function (composit) {
            return composit.value;
          }),
          type: 'input value'
        };
      } else {
        return {
          values: composits.map(function (composit) {
            return composit.inner_text;
          }),
          type: 'inner text'
        };
      }
    });
  } else if (assertion.type == 'html') {
    return checker.driver.findElement(By.css('html')).then(function (elem) {
      return elem.getAttribute('outerHTML');
    }).then(function (html) {
      return {
        values: [html],
        type: assertion.type
      };
    });
  } else if (assertion.type == 'url') {
    return checker.driver.getCurrentUrl().then(function (url) {
      return {
        values: [url],
        type: assertion.type
      };
    });
  } else {
    throw Error("Illegal directive is specified " + JSON.stringify(assertion) + '.');
  }
}

function normalizeDirective(orgAssertion, name) {
  var assertion = Object.assign({}, orgAssertion);

  assertion.name = name;

  if (typeof assertion[name] == 'string') {
    assertion.type = assertion[name];
  } else {
    assertion.locator = assertion[name];
  }

  //attr
  if (assertion.hasOwnProperty('value') && typeof assertion.value != 'string' && assertion.value.hasOwnProperty('attr')) {
    var obj = assertion.value;
    assertion.type = { attr: obj.attr };
    assertion.value = obj.value;
  } else if (['exists', 'notExists'].indexOf(assertion.name) === -1) {
    if (!assertion.hasOwnProperty('value') && !assertion.hasOwnProperty('values')) {
      throw new Error("Require value or values key " + JSON.stringify(assertion) + '.');
    }
  }

  //The locator is required, except `url` and `html`.
  if (['url', 'html'].indexOf(assertion.type) === -1 && !assertion.locator) {
    throw new Error("Missing locator " + JSON.stringify(orgAssertion) + '.');
  }

  //`value` or `values` is required, except `exists` and `notExists`.
  if (['exists', 'notExists'].indexOf(assertion.name) === -1 && !(assertion.hasOwnProperty('value') || assertion.hasOwnProperty('values'))) {
    throw new Error("Missing value or values " + JSON.stringify(orgAssertion) + '.');
  }

  //`likes` and `notLikes` can't use `values`.
  if (['likes', 'notLikes'].indexOf(assertion.name) >= 0 && assertion.hasOwnProperty('values')) {
    throw new Error("You can't use `values` for `likes` and `notLikes`, instead use `checked|unchecked`, `selected|unselected` " + JSON.stringify(orgAssertion) + '.');
  }

  return assertion;
}

function compareArray(array1, array2) {
  return JSON.stringify(array1.sort()) === JSON.stringify(array2.sort());
}

function exists(checker, assertion) {
  assertion = normalizeDirective(assertion, 'exists');
  return checker.waitElements(assertion.exists, assertion.count, assertion.timeout).catch(function (err) {
    if (err.name == 'TimeoutError') {
      throw new errors.NoSuchElementError(_util2.default.format("%s: %s", assertion.name, assertion.locator), err);
    }
    throw err;
  });
}

function notExists(checker, assertion) {
  assertion = normalizeDirective(assertion, 'notExists');
  return checker.waitDissapearElements(assertion.notExists, assertion.timeout).catch(function (err) {
    if (err.name == 'TimeoutError') {
      throw new errors.ExistsError(_util2.default.format("%s: %s", assertion.name, assertion.locator), err);
    }
    throw err;
  });
}

function likes(checker, assertion) {
  assertion = normalizeDirective(assertion, 'likes');
  return checker.waitForValueCheck(assertion, function () {
    return createPromise(checker, assertion).then(function (data) {
      assertion.actual_values = data.values;
      assertion.type = data.type;
      if (data.values.length > 1) throw new Error('Multiple values were detected `' + data.values + '`.');
      return data.values[0].indexOf(assertion.value) >= 0;
    });
  });
}

function notLikes(checker, assertion) {
  assertion = normalizeDirective(assertion, 'notLikes');
  return checker.waitForValueCheck(assertion, function () {
    return createPromise(checker, assertion).then(function (data) {
      assertion.type = data.type;
      assertion.actual_values = data.values;
      if (data.values.length > 1) throw new Error('Multiple values were detected `' + data.values + '`.');
      return data.values[0].indexOf(assertion.value) === -1;
    });
  });
}

function equals(checker, assertion) {
  assertion = normalizeDirective(assertion, 'equals');
  return checker.waitForValueCheck(assertion, function () {
    return createPromise(checker, assertion).then(function (data) {
      assertion.type = data.type;
      assertion.actual_values = data.values;
      if (assertion.hasOwnProperty('values')) {
        return compareArray(data.values, assertion.values);
      } else if (assertion.hasOwnProperty('value')) {
        return data.values[0] === assertion.value;
      }
    });
  });
}

function notEquals(checker, assertion) {
  assertion = normalizeDirective(assertion, 'notEquals');
  return checker.waitForValueCheck(assertion, function () {
    return createPromise(checker, assertion).then(function (data) {
      assertion.actual_values = data.values;
      assertion.type = data.type;
      if (assertion.values) {
        return !compareArray(data.values, assertion.values);
      } else if (assertion.value) {
        return data.values[0] !== assertion.value;
      }
    });
  });
}

function unchecked(checker, assertion) {
  assertion = normalizeDirective(assertion, 'unchecked');
  return checker.waitForValueCheck(assertion, function () {
    return createPromise(checker, assertion).then(function (data) {
      assertion.type = data.type;
      assertion.actual_values = data.values;
      if (assertion.value === undefined && assertion.values === undefined) throw new Error("Missing value or values.");
      var expectedList = assertion.values ? assertion.values : [assertion.value];
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if (data.values.indexOf(expected) >= 0) return false;
      }

      return true;
    });
  });
}

function checked(checker, assertion) {
  assertion = normalizeDirective(assertion, 'checked');
  return checker.waitForValueCheck(assertion, function () {
    return createPromise(checker, assertion).then(function (data) {
      assertion.actual_values = data.values;
      assertion.type = data.type;
      if (assertion.value === undefined && assertion.values === undefined) throw new Error("Missing value or values.");
      var expectedList = assertion.values ? assertion.values : [assertion.value];
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if (data.values.indexOf(expected) === -1) return false;
      }

      return true;
    });
  });
}

function selected(checker, assertion) {
  assertion = normalizeDirective(assertion, 'selected');
  return checker.waitForValueCheck(assertion, function () {
    return createPromise(checker, assertion).then(function (data) {
      assertion.actual_values = data.values;
      assertion.type = data.type;
      if (assertion.value === undefined && assertion.values === undefined) throw new Error("Missing value or values.");
      var expectedList = assertion.values ? assertion.values : [assertion.value];
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if (data.values.indexOf(expected) === -1) return false;
      }

      return true;
    });
  });
}

function unselected(checker, assertion) {
  assertion = normalizeDirective(assertion, 'unselected');
  return checker.waitForValueCheck(assertion, function () {
    return createPromise(checker, assertion).then(function (data) {
      assertion.actual_values = data.values;
      assertion.type = data.type;
      if (assertion.value === undefined && assertion.values === undefined) throw new Error("Missing value or values.");
      var expectedList = assertion.values ? assertion.values : [assertion.value];
      for (var i = 0; i < expectedList.length; i++) {
        var expected = expectedList[i];
        if (data.values.indexOf(expected) >= 0) return false;
      }

      return true;
    });
  });
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.click = click;
exports.sendKeys = sendKeys;
exports.check = check;
exports.uncheck = uncheck;
exports.select = select;
exports.unselect = unselect;
exports.clear = clear;
exports.alert = alert;
exports.switchTo = switchTo;
exports.authenticateAs = authenticateAs;
exports.scrollTo = scrollTo;

var _seleniumWebdriver = __webpack_require__(0);

var _seleniumWebdriver2 = _interopRequireDefault(_seleniumWebdriver);

var _util = __webpack_require__(1);

var _util2 = _interopRequireDefault(_util);

var _Checker = __webpack_require__(3);

var _Checker2 = _interopRequireDefault(_Checker);

var _errors = __webpack_require__(2);

var errors = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var By = _seleniumWebdriver2.default.By;

function click(checker, action) {
  return checker.waitElement(action.click, action.timeout).then(function (elem) {
    return elem.click();
  });
}

function sendKeys(checker, action) {
  return checker.waitElement(action.sendKeys, action.timeout).then(function (elem) {
    return elem.sendKeys(action.value);
  });
}

function check(checker, action) {
  if (action.hasOwnProperty('values')) {
    //checkbox
    return checker.waitElements(action.check, action.count, action.timeout).then(function (elems) {
      return checker.assembleFromElements(elems, {
        value: function value(elem) {
          return elem.getAttribute('value');
        },
        isSelected: function isSelected(elem) {
          return elem.isSelected();
        }
      });
    }).then(function (composits) {
      return composits.filter(function (composit) {
        return !composit.isSelected && action.values.indexOf(composit.value) >= 0;
      });
    }).then(function (composits) {
      return _seleniumWebdriver2.default.promise.map(composits, function (composit) {
        return composit.elem.click();
      });
    });
  } else if (action.hasOwnProperty('value')) {
    //radio
    return checker.waitElements(action.check, action.count, action.timeout).then(function (elems) {
      return checker.assembleFromElements(elems, { value: function value(elem) {
          return elem.getAttribute('value');
        } });
    }).then(function (composits) {
      return composits.filter(function (composit) {
        return composit.value == action.value;
      });
    }).then(function (composits) {
      if (composits.length == 0) {
        throw new errors.NoSuchElementError(_util2.default.format("Radio button with `%s` were not found in %s.", action.value, action.check));
      }

      return composits[0].elem.click();
    });
  } else {
    throw new Error("value or values is required.");
  }
}

function uncheck(checker, action) {
  return checker.waitElements(action.uncheck, action.count, action.timeout).then(function (elems) {
    return checker.assembleFromElements(elems, {
      value: function value(elem) {
        return elem.getAttribute('value');
      },
      selected: function selected(elem) {
        return elem.isSelected();
      }
    });
  }).then(function (composits) {
    return composits.filter(function (composit) {
      return composit.selected && action.values.indexOf(composit.value) >= 0;
    });
  }).then(function (composits) {
    return _seleniumWebdriver2.default.promise.map(composits, function (composit) {
      return composit.elem.click();
    });
  });
}

function select(checker, action) {
  var values = action.value ? [action.value] : action.values;
  return checker.waitElement(action.select, action.timeout).then(function (elem) {
    return checker.waitElementsIn(elem, By.css('option'));
  }).then(function (elems) {
    return checker.assembleFromElements(elems, {
      value: function value(elem) {
        return elem.getAttribute('value');
      },
      isSelected: function isSelected(elem) {
        return elem.isSelected();
      }
    });
  }).then(function (composits) {
    return composits.filter(function (composit) {
      return !composit.isSelected && values.indexOf(composit.value) >= 0;
    }).map(function (composit) {
      return composit.elem;
    });
  }).then(function (elems) {
    return _seleniumWebdriver2.default.promise.map(elems, function (elem) {
      return elem.click();
    });
  });
}

function unselect(checker, action) {
  return checker.waitElement(action.unselect, action.timeout).then(function (elem) {
    return checker.waitElementsIn(elem, By.css('option'));
  }).then(function (elems) {
    return checker.assembleFromElements(elems, {
      value: function value(elem) {
        return elem.getAttribute('value');
      },
      isSelected: function isSelected(elem) {
        return elem.isSelected();
      }
    });
  }).then(function (composits) {
    return composits.filter(function (composit) {
      return composit.isSelected && action.values.indexOf(composit.value) >= 0;
    }).map(function (composit) {
      return composit.elem;
    });
  }).then(function (elems) {
    return _seleniumWebdriver2.default.promise.map(elems, function (elem) {
      return elem.click();
    });
  });
}

function clear(checker, action) {
  return checker.waitElements(action.clear, action.count, action.timeout).then(function (elems) {
    return checker.assembleFromElements(elems, {
      tag_name: function tag_name(elem) {
        return elem.getTagName();
      },
      type: function type(elem) {
        return elem.getAttribute('type');
      },
      selected: function selected(elem) {
        return elem.isSelected();
      }
    });
  }).then(function (composits) {
    if (composits[0].tag_name == 'select') {
      return checker.waitElementsIn(composits[0].elem, By.css('option'), check.count, check.timeout).then(function (elems) {
        return checker.assembleFromElements(elems, {
          tag_name: function tag_name(elem) {
            return elem.getTagName();
          },
          type: function type(elem) {
            return elem.getAttribute('type');
          },
          selected: function selected(elem) {
            return elem.isSelected();
          }
        });
      });
    } else {
      return composits;
    }
  }).then(function (composits) {
    if (composits[0].tag_name == 'option' || composits[0].type == 'checkbox' || composits[0].type == 'radio') {
      composits.filter(function (composit) {
        return composit.selected;
      }).forEach(function (composit) {
        return composit.elem.click();
      });
    } else {
      composits.forEach(function (composit) {
        return composit.elem.clear();
      });
    }
  });
}

function alert(checker, action) {
  return checker.handleAlert(action.alert, action.timeout);
}

function switchTo(checker, action) {
  if (action.switchTo === 'default' || !action.switchTo) {
    return checker.driver.switchTo().frame(null);
  } else {
    return checker.waitElement(action.switchTo, action.timeout).then(function (elem) {
      return checker.driver.switchTo().frame(elem);
    });
  }
}

function authenticateAs(checker, action) {
  //TODO change to driver.switchTo().alert().authenticateAs().
  // return checker.waitAlert(action.timeout).then(alert => {
  //   return alert.authenticateAs(action.authenticateAs, action.password)
  // })
  return Promise.resolve().then(function () {
    var reg = /(https?):\/\/([^/]+)(\/?.*)/;
    var res = reg.exec(checker.lastUrl);
    if (res === null) {
      throw new Error();
    }
    var authUrl = _util2.default.format("%s://%s:%s@%s%s", res[1], action.authenticateAs, action.password, res[2], res[3]);
    return checker.driver.get(authUrl).then(function () {
      return checker.driver.get(checker.lastUrl);
    });
  });
}

function scrollTo(checker, action) {
  if (action.scrollTo.hasOwnProperty("x") || action.scrollTo.hasOwnProperty("y")) {
    var xcoord = action.scrollTo.hasOwnProperty("x") ? action.scrollTo.x : 0;
    var ycoord = action.scrollTo.hasOwnProperty("y") ? action.scrollTo.y : 0;
    return checker.driver.executeScript("window.scrollTo(" + xcoord + "," + ycoord + ")");
  } else {
    return checker.waitElement(action.scrollTo, action.timeout).then(function (elem) {
      return checker.driver.executeScript("arguments[0].scrollIntoView()", elem);
    });
  }
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = attr;
function attr(name, value) {
  return { attr: name, value: value };
}

/***/ })
/******/ ]);
});