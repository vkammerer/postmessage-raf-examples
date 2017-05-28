/******/ (function(modules) { // webpackBootstrap
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var loginButton = exports.loginButton = document.querySelector("#loginButton");
var logoutButton = exports.logoutButton = document.querySelector("#logoutButton");

var applyLoggedUi = exports.applyLoggedUi = function applyLoggedUi() {
  return authContainer.classList.add("logged");
};
var applyAnonymousUi = exports.applyAnonymousUi = function applyAnonymousUi() {
  return authContainer.classList.remove("logged");
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenToAuthChange = exports.logout = exports.login = undefined;

var _firebaseConfig = __webpack_require__(4);

var _messager = __webpack_require__(6);

window.firebase.initializeApp(_firebaseConfig.firebaseConfig);

var firebaseAuth = firebase.auth();

var login = exports.login = function login() {
  var firebaseFacebookProvider = new firebase.auth.FacebookAuthProvider();
  firebaseAuth.signInWithPopup(firebaseFacebookProvider).then(function (result) {
    var accessToken = result.credential.accessToken;
    window.localStorage.setItem("app_firebaseAccessToken", accessToken);
    _messager.messager.post({
      type: "MAIN_AUTH_LOGIN_SUCCESS",
      payload: accessToken
    });
  }).catch(function (error) {
    window.localStorage.removeItem("app_firebaseAccessToken");
    _messager.messager.post({
      type: "MAIN_AUTH_LOGIN_ERROR",
      error: error
    });
  });
};

var logout = exports.logout = function logout() {
  return firebaseAuth.signOut();
};

var listenToAuthChange = exports.listenToAuthChange = function listenToAuthChange() {
  return firebaseAuth.onAuthStateChanged(function (user) {
    if (user) {
      var accessToken = window.localStorage["app_firebaseAccessToken"];
      _messager.messager.post({
        type: "MAIN_AUTH_LOGGED",
        payload: accessToken
      });
    } else {
      window.localStorage.removeItem("app_firebaseAccessToken");
      _messager.messager.post({ type: "MAIN_AUTH_ANONYMOUS" });
    }
  });
};

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(3);


const mainMessager = ({ worker, onAction }) => {
  // STATE
  const s = {
    pinging: false,
    inOperations: {},
    outOperations: [],
    count: 0
  };
  window.operations = s.operations;

  // INIT
  worker.addEventListener("message", function handleMessage(mE) {
    const message = JSON.parse(mE.data);
    if (!message.type || message.type !== "PMRAF_TO_MAIN") return;
    message.payload.forEach(onOperation);
    if (message.meta.pingRequest === "start") startPing();
    if (message.meta.pingRequest === "stop") stopPing();
  });

  // PRIVATE
  const onOperation = operation => {
    if (!s.pinging) return onAction(operation.payload);
    if (!operation.meta || !operation.meta.delay) {
      s.inOperations[s.count] = s.inOperations[s.count] || [];
      return s.inOperations[s.count].push(operation);
    }
    if (operation.meta.delay.count && operation.meta.delay.count >= s.count) {
      s.inOperations[operation.meta.delay.count] = s.inOperations[
        operation.meta.delay.count
      ] || [];
      return s.inOperations[operation.meta.delay.count].push(operation);
    }
    if (operation.meta.delay.index && operation.meta.delay.index >= 0) {
      s.inOperations[s.count + operation.meta.delay.index] = s.inOperations[
        s.count + operation.meta.delay.index
      ] || [];
      return s.inOperations[s.count + operation.meta.delay.index].push(
        operation
      );
    }
  };
  const processInOperations = () => {
    if (!s.inOperations[s.count]) return;
    s.inOperations[s.count].forEach(operation => onAction(operation.payload));
    s.inOperations[s.count].length = 0;
  };
  const sendAll = ({ pingData }) => {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* sendToWorker */])(worker, {
      type: "PMRAF_TO_WORKER",
      meta: { pingData },
      payload: s.outOperations
    });
    s.outOperations.length = 0;
  };
  const ping = () => {
    if (!s.pinging) return;
    requestAnimationFrame(ping);
    sendAll({ pingData: { count: s.count } });
    processInOperations();
    s.count++;
  };

  // PUBLIC
  const post = action => {
    s.outOperations.push({ payload: action });
    if (!s.pinging) sendAll({});
  };
  const startPing = () => {
    s.pinging = true;
    s.count = 0;
    requestAnimationFrame(ping);
  };
  const stopPing = () => {
    s.pinging = false;
    sendAll({});
    processInOperations();
  };
  return { post };
};
/* harmony export (immutable) */ __webpack_exports__["mainMessager"] = mainMessager;


const workerMessager = ({ onAction, onPong }) => {
  // STATE
  const s = {
    pinging: false,
    outOperations: []
  };
  self.operations = s.operations;

  // INIT
  self.addEventListener("message", function handleMessage(mE) {
    const message = JSON.parse(mE.data);
    if (!message.type || message.type !== "PMRAF_TO_WORKER") return;
    if (message.meta.pingData) pong(message.meta.pingData);
    message.payload.forEach(onOperation);
  });

  // PRIVATE
  const onOperation = operation => onAction(operation.payload);
  const sendAll = ({ pingRequest, pongData }) => {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* sendToMain */])({
      type: "PMRAF_TO_MAIN",
      meta: { pingRequest, pongData },
      payload: s.outOperations
    });
    s.outOperations.length = 0;
  };
  const pong = pingData => {
    if (!s.pinging) return;
    sendAll({ pongData: pingData });
    if (onPong) onPong(pingData);
  };

  // PUBLIC
  const post = (action, meta) => {
    s.outOperations.push({ payload: action, meta });
    if (!s.pinging) sendAll({});
  };
  const startPing = () => {
    s.pinging = true;
    sendAll({ pingRequest: "start" });
  };
  const stopPing = () => {
    s.pinging = false;
    sendAll({ pingRequest: "stop" });
  };
  return {
    post,
    startPing,
    stopPing
  };
};
/* harmony export (immutable) */ __webpack_exports__["workerMessager"] = workerMessager;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const sendToWorker = (worker, message) => {
  const stringed = JSON.stringify(message);
  worker.postMessage(stringed);
};
/* harmony export (immutable) */ __webpack_exports__["a"] = sendToWorker;


const sendToMain = message => {
  const stringed = JSON.stringify(message);
  self.postMessage(stringed);
};
/* harmony export (immutable) */ __webpack_exports__["b"] = sendToMain;



/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var firebaseConfig = exports.firebaseConfig = {
  apiKey: "AIzaSyCBIMlB5WlOTufqVo3tMwcJoAbNV76BVwc",
  authDomain: "test-project-44341.firebaseapp.com",
  databaseURL: "https://test-project-44341.firebaseio.com",
  storageBucket: "test-project-44341.appspot.com"
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ui = __webpack_require__(0);

var _firebase = __webpack_require__(1);

_ui.loginButton.addEventListener("click", _firebase.login);
_ui.logoutButton.addEventListener("click", _firebase.logout);

(0, _firebase.listenToAuthChange)();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messager = undefined;

var _postmessageRaf = __webpack_require__(2);

var _slaveWorker = __webpack_require__(7);

var _ui = __webpack_require__(0);

var onAction = function onAction(action) {
  console.log("master: action", action);
  switch (action.type) {
    case "WORKER_AUTH_LOGGED":
      {
        return (0, _ui.applyLoggedUi)();
      }
    case "WORKER_AUTH_ANONYMOUS":
      {
        return (0, _ui.applyAnonymousUi)();
      }
    default:
      {
        return;
      }
  }
};

var messager = exports.messager = (0, _postmessageRaf.mainMessager)({ worker: _slaveWorker.slaveWorker, onAction: onAction });

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var SlaveWorker = __webpack_require__(8);
var slaveWorker = exports.slaveWorker = new SlaveWorker();

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
	return new Worker(__webpack_require__.p + "1ea9c1de8b8a25702b52.worker.js");
};

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNmQ5MDFmZDk0YTcxNjE0MTM5YmMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci91aS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWFzdGVyL2ZpcmViYXNlLmpzIiwid2VicGFjazovLy8uL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21tb24vZmlyZWJhc2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci9tYXN0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci9tZXNzYWdlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWFzdGVyL3NsYXZlV29ya2VyLmpzIiwid2VicGFjazovLy8uL3NyYy9zbGF2ZS9zbGF2ZS5qcyJdLCJuYW1lcyI6WyJsb2dpbkJ1dHRvbiIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImxvZ291dEJ1dHRvbiIsImFwcGx5TG9nZ2VkVWkiLCJhdXRoQ29udGFpbmVyIiwiY2xhc3NMaXN0IiwiYWRkIiwiYXBwbHlBbm9ueW1vdXNVaSIsInJlbW92ZSIsIndpbmRvdyIsImZpcmViYXNlIiwiaW5pdGlhbGl6ZUFwcCIsImZpcmViYXNlQXV0aCIsImF1dGgiLCJsb2dpbiIsImZpcmViYXNlRmFjZWJvb2tQcm92aWRlciIsIkZhY2Vib29rQXV0aFByb3ZpZGVyIiwic2lnbkluV2l0aFBvcHVwIiwidGhlbiIsInJlc3VsdCIsImFjY2Vzc1Rva2VuIiwiY3JlZGVudGlhbCIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJwb3N0IiwidHlwZSIsInBheWxvYWQiLCJjYXRjaCIsImVycm9yIiwicmVtb3ZlSXRlbSIsImxvZ291dCIsInNpZ25PdXQiLCJsaXN0ZW5Ub0F1dGhDaGFuZ2UiLCJvbkF1dGhTdGF0ZUNoYW5nZWQiLCJ1c2VyIiwiZmlyZWJhc2VDb25maWciLCJhcGlLZXkiLCJhdXRoRG9tYWluIiwiZGF0YWJhc2VVUkwiLCJzdG9yYWdlQnVja2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uQWN0aW9uIiwiY29uc29sZSIsImxvZyIsImFjdGlvbiIsIm1lc3NhZ2VyIiwid29ya2VyIiwiU2xhdmVXb3JrZXIiLCJyZXF1aXJlIiwic2xhdmVXb3JrZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2hFTyxJQUFNQSxvQ0FBY0MsU0FBU0MsYUFBVCxDQUF1QixjQUF2QixDQUFwQjtBQUNBLElBQU1DLHNDQUFlRixTQUFTQyxhQUFULENBQXVCLGVBQXZCLENBQXJCOztBQUVBLElBQU1FLHdDQUFnQixTQUFoQkEsYUFBZ0I7QUFBQSxTQUFNQyxjQUFjQyxTQUFkLENBQXdCQyxHQUF4QixDQUE0QixRQUE1QixDQUFOO0FBQUEsQ0FBdEI7QUFDQSxJQUFNQyw4Q0FBbUIsU0FBbkJBLGdCQUFtQjtBQUFBLFNBQU1ILGNBQWNDLFNBQWQsQ0FBd0JHLE1BQXhCLENBQStCLFFBQS9CLENBQU47QUFBQSxDQUF6QixDOzs7Ozs7Ozs7Ozs7OztBQ0pQOztBQUNBOztBQUVBQyxPQUFPQyxRQUFQLENBQWdCQyxh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QTtBQUNBO0FBQUE7QUFBQTs7Ozs7Ozs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztBQ1JPLElBQU1VLDBDQUFpQjtBQUM1QkMsVUFBUSx5Q0FEb0I7QUFFNUJDLGNBQVksb0NBRmdCO0FBRzVCQyxlQUFhLDJDQUhlO0FBSTVCQyxpQkFBZTtBQUphLENBQXZCLEM7Ozs7Ozs7OztBQ0FQOztBQUNBOztBQUVBLGdCQUFZQyxnQkFBWixDQUE2QixPQUE3QjtBQUNBLGlCQUFhQSxnQkFBYixDQUE4QixPQUE5Qjs7QUFFQSxvQzs7Ozs7Ozs7Ozs7Ozs7QUNOQTs7QUFDQTs7QUFDQTs7QUFFQSxJQUFNQyxXQUFXLFNBQVhBLFFBQVcsU0FBVTtBQUN6QkMsVUFBUUMsR0FBUixDQUFZLGdCQUFaLEVBQThCQyxNQUE5QjtBQUNBLFVBQVFBLE9BQU9uQixJQUFmO0FBQ0UsU0FBSyxvQkFBTDtBQUEyQjtBQUN6QixlQUFPLHdCQUFQO0FBQ0Q7QUFDRCxTQUFLLHVCQUFMO0FBQThCO0FBQzVCLGVBQU8sMkJBQVA7QUFDRDtBQUNEO0FBQVM7QUFDUDtBQUNEO0FBVEg7QUFXRCxDQWJEOztBQWVPLElBQU1vQiw4QkFBVyxrQ0FBYSxFQUFFQyxnQ0FBRixFQUF1Qkwsa0JBQXZCLEVBQWIsQ0FBakIsQzs7Ozs7Ozs7Ozs7O0FDbkJQLElBQU1NLGNBQWMsbUJBQUFDLENBQVEsQ0FBUixDQUFwQjtBQUNPLElBQU1DLG9DQUFjLElBQUlGLFdBQUosRUFBcEIsQzs7Ozs7O0FDRFA7QUFDQTtBQUNBLEUiLCJmaWxlIjoibWFzdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA2ZDkwMWZkOTRhNzE2MTQxMzliYyIsImV4cG9ydCBjb25zdCBsb2dpbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbG9naW5CdXR0b25cIik7XG5leHBvcnQgY29uc3QgbG9nb3V0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNsb2dvdXRCdXR0b25cIik7XG5cbmV4cG9ydCBjb25zdCBhcHBseUxvZ2dlZFVpID0gKCkgPT4gYXV0aENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwibG9nZ2VkXCIpO1xuZXhwb3J0IGNvbnN0IGFwcGx5QW5vbnltb3VzVWkgPSAoKSA9PiBhdXRoQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2dnZWRcIik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbWFzdGVyL3VpLmpzIiwiaW1wb3J0IHsgZmlyZWJhc2VDb25maWcgfSBmcm9tIFwiLi4vY29tbW9uL2ZpcmViYXNlQ29uZmlnXCI7XG5pbXBvcnQgeyBtZXNzYWdlciB9IGZyb20gXCIuL21lc3NhZ2VyXCI7XG5cbndpbmRvdy5maXJlYmFzZS5pbml0aWFsaXplQXBwKGZpcmViYXNlQ29uZmlnKTtcblxuY29uc3QgZmlyZWJhc2VBdXRoID0gZmlyZWJhc2UuYXV0aCgpO1xuXG5leHBvcnQgY29uc3QgbG9naW4gPSAoKSA9PiB7XG4gIGNvbnN0IGZpcmViYXNlRmFjZWJvb2tQcm92aWRlciA9IG5ldyBmaXJlYmFzZS5hdXRoLkZhY2Vib29rQXV0aFByb3ZpZGVyKCk7XG4gIGZpcmViYXNlQXV0aFxuICAgIC5zaWduSW5XaXRoUG9wdXAoZmlyZWJhc2VGYWNlYm9va1Byb3ZpZGVyKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSByZXN1bHQuY3JlZGVudGlhbC5hY2Nlc3NUb2tlbjtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImFwcF9maXJlYmFzZUFjY2Vzc1Rva2VuXCIsIGFjY2Vzc1Rva2VuKTtcbiAgICAgIG1lc3NhZ2VyLnBvc3Qoe1xuICAgICAgICB0eXBlOiBcIk1BSU5fQVVUSF9MT0dJTl9TVUNDRVNTXCIsXG4gICAgICAgIHBheWxvYWQ6IGFjY2Vzc1Rva2VuXG4gICAgICB9KTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiYXBwX2ZpcmViYXNlQWNjZXNzVG9rZW5cIik7XG4gICAgICBtZXNzYWdlci5wb3N0KHtcbiAgICAgICAgdHlwZTogXCJNQUlOX0FVVEhfTE9HSU5fRVJST1JcIixcbiAgICAgICAgZXJyb3JcbiAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGxvZ291dCA9ICgpID0+IGZpcmViYXNlQXV0aC5zaWduT3V0KCk7XG5cbmV4cG9ydCBjb25zdCBsaXN0ZW5Ub0F1dGhDaGFuZ2UgPSAoKSA9PlxuICBmaXJlYmFzZUF1dGgub25BdXRoU3RhdGVDaGFuZ2VkKHVzZXIgPT4ge1xuICAgIGlmICh1c2VyKSB7XG4gICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHdpbmRvdy5sb2NhbFN0b3JhZ2VbXCJhcHBfZmlyZWJhc2VBY2Nlc3NUb2tlblwiXTtcbiAgICAgIG1lc3NhZ2VyLnBvc3Qoe1xuICAgICAgICB0eXBlOiBcIk1BSU5fQVVUSF9MT0dHRURcIixcbiAgICAgICAgcGF5bG9hZDogYWNjZXNzVG9rZW5cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJhcHBfZmlyZWJhc2VBY2Nlc3NUb2tlblwiKTtcbiAgICAgIG1lc3NhZ2VyLnBvc3QoeyB0eXBlOiBcIk1BSU5fQVVUSF9BTk9OWU1PVVNcIiB9KTtcbiAgICB9XG4gIH0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci9maXJlYmFzZS5qcyIsImltcG9ydCB7IHNlbmRUb1dvcmtlciwgc2VuZFRvTWFpbiB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBjb25zdCBtYWluTWVzc2FnZXIgPSAoeyB3b3JrZXIsIG9uQWN0aW9uIH0pID0+IHtcbiAgLy8gU1RBVEVcbiAgY29uc3QgcyA9IHtcbiAgICBwaW5naW5nOiBmYWxzZSxcbiAgICBpbk9wZXJhdGlvbnM6IHt9LFxuICAgIG91dE9wZXJhdGlvbnM6IFtdLFxuICAgIGNvdW50OiAwXG4gIH07XG4gIHdpbmRvdy5vcGVyYXRpb25zID0gcy5vcGVyYXRpb25zO1xuXG4gIC8vIElOSVRcbiAgd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UobUUpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShtRS5kYXRhKTtcbiAgICBpZiAoIW1lc3NhZ2UudHlwZSB8fCBtZXNzYWdlLnR5cGUgIT09IFwiUE1SQUZfVE9fTUFJTlwiKSByZXR1cm47XG4gICAgbWVzc2FnZS5wYXlsb2FkLmZvckVhY2gob25PcGVyYXRpb24pO1xuICAgIGlmIChtZXNzYWdlLm1ldGEucGluZ1JlcXVlc3QgPT09IFwic3RhcnRcIikgc3RhcnRQaW5nKCk7XG4gICAgaWYgKG1lc3NhZ2UubWV0YS5waW5nUmVxdWVzdCA9PT0gXCJzdG9wXCIpIHN0b3BQaW5nKCk7XG4gIH0pO1xuXG4gIC8vIFBSSVZBVEVcbiAgY29uc3Qgb25PcGVyYXRpb24gPSBvcGVyYXRpb24gPT4ge1xuICAgIGlmICghcy5waW5naW5nKSByZXR1cm4gb25BY3Rpb24ob3BlcmF0aW9uLnBheWxvYWQpO1xuICAgIGlmICghb3BlcmF0aW9uLm1ldGEgfHwgIW9wZXJhdGlvbi5tZXRhLmRlbGF5KSB7XG4gICAgICBzLmluT3BlcmF0aW9uc1tzLmNvdW50XSA9IHMuaW5PcGVyYXRpb25zW3MuY291bnRdIHx8IFtdO1xuICAgICAgcmV0dXJuIHMuaW5PcGVyYXRpb25zW3MuY291bnRdLnB1c2gob3BlcmF0aW9uKTtcbiAgICB9XG4gICAgaWYgKG9wZXJhdGlvbi5tZXRhLmRlbGF5LmNvdW50ICYmIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmNvdW50ID49IHMuY291bnQpIHtcbiAgICAgIHMuaW5PcGVyYXRpb25zW29wZXJhdGlvbi5tZXRhLmRlbGF5LmNvdW50XSA9IHMuaW5PcGVyYXRpb25zW1xuICAgICAgICBvcGVyYXRpb24ubWV0YS5kZWxheS5jb3VudFxuICAgICAgXSB8fCBbXTtcbiAgICAgIHJldHVybiBzLmluT3BlcmF0aW9uc1tvcGVyYXRpb24ubWV0YS5kZWxheS5jb3VudF0ucHVzaChvcGVyYXRpb24pO1xuICAgIH1cbiAgICBpZiAob3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXggJiYgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXggPj0gMCkge1xuICAgICAgcy5pbk9wZXJhdGlvbnNbcy5jb3VudCArIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmluZGV4XSA9IHMuaW5PcGVyYXRpb25zW1xuICAgICAgICBzLmNvdW50ICsgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXhcbiAgICAgIF0gfHwgW107XG4gICAgICByZXR1cm4gcy5pbk9wZXJhdGlvbnNbcy5jb3VudCArIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmluZGV4XS5wdXNoKFxuICAgICAgICBvcGVyYXRpb25cbiAgICAgICk7XG4gICAgfVxuICB9O1xuICBjb25zdCBwcm9jZXNzSW5PcGVyYXRpb25zID0gKCkgPT4ge1xuICAgIGlmICghcy5pbk9wZXJhdGlvbnNbcy5jb3VudF0pIHJldHVybjtcbiAgICBzLmluT3BlcmF0aW9uc1tzLmNvdW50XS5mb3JFYWNoKG9wZXJhdGlvbiA9PiBvbkFjdGlvbihvcGVyYXRpb24ucGF5bG9hZCkpO1xuICAgIHMuaW5PcGVyYXRpb25zW3MuY291bnRdLmxlbmd0aCA9IDA7XG4gIH07XG4gIGNvbnN0IHNlbmRBbGwgPSAoeyBwaW5nRGF0YSB9KSA9PiB7XG4gICAgc2VuZFRvV29ya2VyKHdvcmtlciwge1xuICAgICAgdHlwZTogXCJQTVJBRl9UT19XT1JLRVJcIixcbiAgICAgIG1ldGE6IHsgcGluZ0RhdGEgfSxcbiAgICAgIHBheWxvYWQ6IHMub3V0T3BlcmF0aW9uc1xuICAgIH0pO1xuICAgIHMub3V0T3BlcmF0aW9ucy5sZW5ndGggPSAwO1xuICB9O1xuICBjb25zdCBwaW5nID0gKCkgPT4ge1xuICAgIGlmICghcy5waW5naW5nKSByZXR1cm47XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBpbmcpO1xuICAgIHNlbmRBbGwoeyBwaW5nRGF0YTogeyBjb3VudDogcy5jb3VudCB9IH0pO1xuICAgIHByb2Nlc3NJbk9wZXJhdGlvbnMoKTtcbiAgICBzLmNvdW50Kys7XG4gIH07XG5cbiAgLy8gUFVCTElDXG4gIGNvbnN0IHBvc3QgPSBhY3Rpb24gPT4ge1xuICAgIHMub3V0T3BlcmF0aW9ucy5wdXNoKHsgcGF5bG9hZDogYWN0aW9uIH0pO1xuICAgIGlmICghcy5waW5naW5nKSBzZW5kQWxsKHt9KTtcbiAgfTtcbiAgY29uc3Qgc3RhcnRQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IHRydWU7XG4gICAgcy5jb3VudCA9IDA7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBpbmcpO1xuICB9O1xuICBjb25zdCBzdG9wUGluZyA9ICgpID0+IHtcbiAgICBzLnBpbmdpbmcgPSBmYWxzZTtcbiAgICBzZW5kQWxsKHt9KTtcbiAgICBwcm9jZXNzSW5PcGVyYXRpb25zKCk7XG4gIH07XG4gIHJldHVybiB7IHBvc3QgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB3b3JrZXJNZXNzYWdlciA9ICh7IG9uQWN0aW9uLCBvblBvbmcgfSkgPT4ge1xuICAvLyBTVEFURVxuICBjb25zdCBzID0ge1xuICAgIHBpbmdpbmc6IGZhbHNlLFxuICAgIG91dE9wZXJhdGlvbnM6IFtdXG4gIH07XG4gIHNlbGYub3BlcmF0aW9ucyA9IHMub3BlcmF0aW9ucztcblxuICAvLyBJTklUXG4gIHNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShtRSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKG1FLmRhdGEpO1xuICAgIGlmICghbWVzc2FnZS50eXBlIHx8IG1lc3NhZ2UudHlwZSAhPT0gXCJQTVJBRl9UT19XT1JLRVJcIikgcmV0dXJuO1xuICAgIGlmIChtZXNzYWdlLm1ldGEucGluZ0RhdGEpIHBvbmcobWVzc2FnZS5tZXRhLnBpbmdEYXRhKTtcbiAgICBtZXNzYWdlLnBheWxvYWQuZm9yRWFjaChvbk9wZXJhdGlvbik7XG4gIH0pO1xuXG4gIC8vIFBSSVZBVEVcbiAgY29uc3Qgb25PcGVyYXRpb24gPSBvcGVyYXRpb24gPT4gb25BY3Rpb24ob3BlcmF0aW9uLnBheWxvYWQpO1xuICBjb25zdCBzZW5kQWxsID0gKHsgcGluZ1JlcXVlc3QsIHBvbmdEYXRhIH0pID0+IHtcbiAgICBzZW5kVG9NYWluKHtcbiAgICAgIHR5cGU6IFwiUE1SQUZfVE9fTUFJTlwiLFxuICAgICAgbWV0YTogeyBwaW5nUmVxdWVzdCwgcG9uZ0RhdGEgfSxcbiAgICAgIHBheWxvYWQ6IHMub3V0T3BlcmF0aW9uc1xuICAgIH0pO1xuICAgIHMub3V0T3BlcmF0aW9ucy5sZW5ndGggPSAwO1xuICB9O1xuICBjb25zdCBwb25nID0gcGluZ0RhdGEgPT4ge1xuICAgIGlmICghcy5waW5naW5nKSByZXR1cm47XG4gICAgc2VuZEFsbCh7IHBvbmdEYXRhOiBwaW5nRGF0YSB9KTtcbiAgICBpZiAob25Qb25nKSBvblBvbmcocGluZ0RhdGEpO1xuICB9O1xuXG4gIC8vIFBVQkxJQ1xuICBjb25zdCBwb3N0ID0gKGFjdGlvbiwgbWV0YSkgPT4ge1xuICAgIHMub3V0T3BlcmF0aW9ucy5wdXNoKHsgcGF5bG9hZDogYWN0aW9uLCBtZXRhIH0pO1xuICAgIGlmICghcy5waW5naW5nKSBzZW5kQWxsKHt9KTtcbiAgfTtcbiAgY29uc3Qgc3RhcnRQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IHRydWU7XG4gICAgc2VuZEFsbCh7IHBpbmdSZXF1ZXN0OiBcInN0YXJ0XCIgfSk7XG4gIH07XG4gIGNvbnN0IHN0b3BQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IGZhbHNlO1xuICAgIHNlbmRBbGwoeyBwaW5nUmVxdWVzdDogXCJzdG9wXCIgfSk7XG4gIH07XG4gIHJldHVybiB7XG4gICAgcG9zdCxcbiAgICBzdGFydFBpbmcsXG4gICAgc3RvcFBpbmdcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydCBjb25zdCBzZW5kVG9Xb3JrZXIgPSAod29ya2VyLCBtZXNzYWdlKSA9PiB7XG4gIGNvbnN0IHN0cmluZ2VkID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gIHdvcmtlci5wb3N0TWVzc2FnZShzdHJpbmdlZCk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2VuZFRvTWFpbiA9IG1lc3NhZ2UgPT4ge1xuICBjb25zdCBzdHJpbmdlZCA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICBzZWxmLnBvc3RNZXNzYWdlKHN0cmluZ2VkKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL3V0aWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydCBjb25zdCBmaXJlYmFzZUNvbmZpZyA9IHtcbiAgYXBpS2V5OiBcIkFJemFTeUNCSU1sQjVXbE9UdWZxVm8zdE13Y0pvQWJOVjc2QlZ3Y1wiLFxuICBhdXRoRG9tYWluOiBcInRlc3QtcHJvamVjdC00NDM0MS5maXJlYmFzZWFwcC5jb21cIixcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90ZXN0LXByb2plY3QtNDQzNDEuZmlyZWJhc2Vpby5jb21cIixcbiAgc3RvcmFnZUJ1Y2tldDogXCJ0ZXN0LXByb2plY3QtNDQzNDEuYXBwc3BvdC5jb21cIlxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vZmlyZWJhc2VDb25maWcuanMiLCJpbXBvcnQgeyBsb2dpbkJ1dHRvbiwgbG9nb3V0QnV0dG9uIH0gZnJvbSBcIi4vdWlcIjtcbmltcG9ydCB7IGxvZ2luLCBsb2dvdXQsIGxpc3RlblRvQXV0aENoYW5nZSB9IGZyb20gXCIuL2ZpcmViYXNlXCI7XG5cbmxvZ2luQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsb2dpbik7XG5sb2dvdXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGxvZ291dCk7XG5cbmxpc3RlblRvQXV0aENoYW5nZSgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci9tYXN0ZXIuanMiLCJpbXBvcnQgeyBtYWluTWVzc2FnZXIgfSBmcm9tIFwiQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWZcIjtcbmltcG9ydCB7IHNsYXZlV29ya2VyIH0gZnJvbSBcIi4vc2xhdmVXb3JrZXJcIjtcbmltcG9ydCB7IGFwcGx5TG9nZ2VkVWksIGFwcGx5QW5vbnltb3VzVWkgfSBmcm9tIFwiLi91aVwiO1xuXG5jb25zdCBvbkFjdGlvbiA9IGFjdGlvbiA9PiB7XG4gIGNvbnNvbGUubG9nKFwibWFzdGVyOiBhY3Rpb25cIiwgYWN0aW9uKTtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJXT1JLRVJfQVVUSF9MT0dHRURcIjoge1xuICAgICAgcmV0dXJuIGFwcGx5TG9nZ2VkVWkoKTtcbiAgICB9XG4gICAgY2FzZSBcIldPUktFUl9BVVRIX0FOT05ZTU9VU1wiOiB7XG4gICAgICByZXR1cm4gYXBwbHlBbm9ueW1vdXNVaSgpO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbWVzc2FnZXIgPSBtYWluTWVzc2FnZXIoeyB3b3JrZXI6IHNsYXZlV29ya2VyLCBvbkFjdGlvbiB9KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYXN0ZXIvbWVzc2FnZXIuanMiLCJjb25zdCBTbGF2ZVdvcmtlciA9IHJlcXVpcmUoXCJ3b3JrZXItbG9hZGVyIS4uL3NsYXZlL3NsYXZlLmpzXCIpO1xuZXhwb3J0IGNvbnN0IHNsYXZlV29ya2VyID0gbmV3IFNsYXZlV29ya2VyKCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbWFzdGVyL3NsYXZlV29ya2VyLmpzIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIG5ldyBXb3JrZXIoX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjFlYTljMWRlOGI4YTI1NzAyYjUyLndvcmtlci5qc1wiKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dvcmtlci1sb2FkZXIhLi9zcmMvc2xhdmUvc2xhdmUuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==