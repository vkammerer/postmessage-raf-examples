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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.postMousePositionIfChanged = exports.updateMousePositionStore = undefined;

var _messager = __webpack_require__(2);

var mousePosition = {};

var updateMousePositionStore = exports.updateMousePositionStore = function updateMousePositionStore(e) {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
};

var savedMousePosition = {};

var postMousePositionIfChanged = exports.postMousePositionIfChanged = function postMousePositionIfChanged() {
  if (mousePosition.x === savedMousePosition.x && mousePosition.y === savedMousePosition.y) return;
  _messager.messager.post({
    type: "MOUSE_POSITION",
    payload: mousePosition
  });
  savedMousePosition.x = mousePosition.x;
  savedMousePosition.y = mousePosition.y;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var loginButton = exports.loginButton = document.querySelector("#loginButton");
var logoutButton = exports.logoutButton = document.querySelector("#logoutButton");
var follower = exports.follower = document.querySelector("#follower");

var applyLoggedUi = exports.applyLoggedUi = function applyLoggedUi() {
  return authContainer.classList.add("logged");
};
var applyAnonymousUi = exports.applyAnonymousUi = function applyAnonymousUi() {
  return authContainer.classList.remove("logged");
};

var applyFollowerUi = exports.applyFollowerUi = function applyFollowerUi(followerPosition) {
  follower.style.transform = "translateX(" + followerPosition.x + "px) translateY(" + followerPosition.y + "px)";
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messager = undefined;

var _postmessageRaf = __webpack_require__(4);

var _slaveWorker = __webpack_require__(8);

var _mouse = __webpack_require__(0);

var _ui = __webpack_require__(1);

var onAction = function onAction(action) {
  switch (action.type) {
    case "WORKER_AUTH_LOGGED":
      return (0, _ui.applyLoggedUi)();
    case "WORKER_AUTH_ANONYMOUS":
      return (0, _ui.applyAnonymousUi)();
    case "FOLLOWER":
      return (0, _ui.applyFollowerUi)(action.payload);
    default:
      {
        return;
      }
  }
};

var messager = exports.messager = (0, _postmessageRaf.mainMessager)({
  worker: _slaveWorker.slaveWorker,
  onAction: onAction,
  beforePing: function beforePing() {
    return (0, _mouse.postMousePositionIfChanged)();
  }
});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenToAuthChange = exports.logout = exports.login = undefined;

var _firebaseConfig = __webpack_require__(6);

var _messager = __webpack_require__(2);

window.firebase.initializeApp(_firebaseConfig.firebaseConfig);

var firebaseAuth = firebase.auth();

var login = exports.login = function login() {
  var firebaseFacebookProvider = new firebase.auth.FacebookAuthProvider();
  firebaseAuth.signInWithPopup(firebaseFacebookProvider).then(function (result) {
    var accessToken = result.credential.accessToken;
    window.localStorage.setItem("APP_firebaseAccessToken", accessToken);
    _messager.messager.post({
      type: "MAIN_AUTH_LOGIN_SUCCESS",
      payload: accessToken
    });
  }).catch(function (error) {
    window.localStorage.removeItem("APP_firebaseAccessToken");
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
      var accessToken = window.localStorage["APP_firebaseAccessToken"];
      _messager.messager.post({
        type: "MAIN_AUTH_LOGGED",
        payload: accessToken
      });
    } else {
      window.localStorage.removeItem("APP_firebaseAccessToken");
      _messager.messager.post({ type: "MAIN_AUTH_ANONYMOUS" });
    }
  });
};

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(5);


const mainMessager = ({ worker, onAction, beforePing, afterPing }) => {
  // STATE
  const s = {
    pinging: false,
    inOperations: {},
    outOperations: [],
    pingCount: 0
  };

  // INIT
  worker.addEventListener("message", function handleMessage(mE) {
    const message = JSON.parse(mE.data);
    if (!message.type || message.type !== "PMRAF_TO_MAIN") return;
    message.payload.forEach(onOperation);
    if (message.meta && message.meta.pingCommand === "start") startPing();
    if (message.meta && message.meta.pingCommand === "stop") stopPing();
  });

  // PRIVATE
  const onOperation = operation => {
    if (!s.pinging) return onAction(operation.payload);
    if (!operation.meta || !operation.meta.delay) {
      s.inOperations[s.pingCount] = s.inOperations[s.pingCount] || [];
      return s.inOperations[s.pingCount].push(operation);
    }
    if (
      operation.meta.delay.pingCount &&
      operation.meta.delay.pingCount >= s.pingCount
    ) {
      s.inOperations[operation.meta.delay.pingCount] = s.inOperations[
        operation.meta.delay.pingCount
      ] || [];
      return s.inOperations[operation.meta.delay.pingCount].push(operation);
    }
    if (operation.meta.delay.index && operation.meta.delay.index >= 0) {
      s.inOperations[s.pingCount + operation.meta.delay.index] = s.inOperations[
        s.pingCount + operation.meta.delay.index
      ] || [];
      return s.inOperations[s.pingCount + operation.meta.delay.index].push(
        operation
      );
    }
  };
  const processInOperations = () => {
    if (!s.inOperations[s.pingCount]) return;
    s.inOperations[s.pingCount].forEach(o => onAction(o.payload));
    s.inOperations[s.pingCount].length = 0;
  };
  const sendAll = meta => {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["a" /* sendToWorker */])(worker, {
      type: "PMRAF_TO_WORKER",
      meta,
      payload: s.outOperations
    });
    s.outOperations.length = 0;
  };
  const ping = () => {
    if (!s.pinging) return;
    requestAnimationFrame(ping);
    if (beforePing) beforePing(s.pingCount);
    sendAll({ pingCount: s.pingCount });
    if (afterPing) afterPing(s.pingCount + 1);
    processInOperations(s.pingCount);
    s.pingCount++;
  };

  // PUBLIC
  const post = action => {
    s.outOperations.push({ payload: action });
    if (!s.pinging) sendAll();
  };
  const startPing = () => {
    s.pinging = true;
    s.pingCount = 0;
    requestAnimationFrame(ping);
  };
  const stopPing = () => {
    s.pinging = false;
    sendAll();
    processInOperations();
  };
  return { post };
};
/* harmony export (immutable) */ __webpack_exports__["mainMessager"] = mainMessager;


const workerMessager = ({ onAction, beforePong, afterPong }) => {
  // STATE
  const s = {
    pinging: false,
    outOperations: []
  };

  // INIT
  self.addEventListener("message", function handleMessage(mE) {
    const message = JSON.parse(mE.data);
    if (!message.type || message.type !== "PMRAF_TO_WORKER") return;
    if (message.meta && typeof message.meta.pingCount !== "undefined")
      pong(message.meta.pingCount);
    message.payload.forEach(o => onAction(o.payload));
  });

  // PRIVATE
  const sendAll = meta => {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* sendToMain */])({
      type: "PMRAF_TO_MAIN",
      meta,
      payload: s.outOperations
    });
    s.outOperations.length = 0;
  };
  const pong = pingCount => {
    if (!s.pinging) return;
    if (beforePong) beforePong(pingCount);
    sendAll({ pingCount });
    if (afterPong) afterPong(pingCount + 1);
  };

  // PUBLIC
  const post = (action, meta) => {
    s.outOperations.push({ payload: action, meta });
    if (!s.pinging) sendAll();
  };
  const startPing = () => {
    s.pinging = true;
    sendAll({ pingCommand: "start" });
  };
  const stopPing = () => {
    s.pinging = false;
    sendAll({ pingCommand: "stop" });
  };
  return {
    post,
    startPing,
    stopPing
  };
};
/* harmony export (immutable) */ __webpack_exports__["workerMessager"] = workerMessager;



/***/ }),
/* 5 */
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
/* 6 */
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _ui = __webpack_require__(1);

var _mouse = __webpack_require__(0);

var _firebase = __webpack_require__(3);

_ui.loginButton.addEventListener("click", _firebase.login);
_ui.logoutButton.addEventListener("click", _firebase.logout);
window.addEventListener("mousemove", _mouse.updateMousePositionStore);

(0, _firebase.listenToAuthChange)();

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var SlaveWorker = __webpack_require__(9);
var slaveWorker = exports.slaveWorker = new SlaveWorker();

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
	return new Worker(__webpack_require__.p + "f54a88fb3715be1ee594.worker.js");
};

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgN2I5YjZhMGMyMDc0NWI5NDI2MDciLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci9tb3VzZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWFzdGVyL3VpLmpzIiwid2VicGFjazovLy8uL3NyYy9tYXN0ZXIvbWVzc2FnZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci9maXJlYmFzZS5qcyIsIndlYnBhY2s6Ly8vLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2ZpcmViYXNlQ29uZmlnLmpzIiwid2VicGFjazovLy8uL3NyYy9tYXN0ZXIvbWFzdGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9tYXN0ZXIvc2xhdmVXb3JrZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NsYXZlL3NsYXZlLmpzIl0sIm5hbWVzIjpbIm1vdXNlUG9zaXRpb24iLCJ1cGRhdGVNb3VzZVBvc2l0aW9uU3RvcmUiLCJ4IiwiZSIsImNsaWVudFgiLCJ5IiwiY2xpZW50WSIsInNhdmVkTW91c2VQb3NpdGlvbiIsInBvc3RNb3VzZVBvc2l0aW9uSWZDaGFuZ2VkIiwicG9zdCIsInR5cGUiLCJwYXlsb2FkIiwibG9naW5CdXR0b24iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJsb2dvdXRCdXR0b24iLCJmb2xsb3dlciIsImFwcGx5TG9nZ2VkVWkiLCJhdXRoQ29udGFpbmVyIiwiY2xhc3NMaXN0IiwiYWRkIiwiYXBwbHlBbm9ueW1vdXNVaSIsInJlbW92ZSIsImFwcGx5Rm9sbG93ZXJVaSIsInN0eWxlIiwidHJhbnNmb3JtIiwiZm9sbG93ZXJQb3NpdGlvbiIsIm9uQWN0aW9uIiwiYWN0aW9uIiwibWVzc2FnZXIiLCJ3b3JrZXIiLCJiZWZvcmVQaW5nIiwid2luZG93IiwiZmlyZWJhc2UiLCJpbml0aWFsaXplQXBwIiwiZmlyZWJhc2VBdXRoIiwiYXV0aCIsImxvZ2luIiwiZmlyZWJhc2VGYWNlYm9va1Byb3ZpZGVyIiwiRmFjZWJvb2tBdXRoUHJvdmlkZXIiLCJzaWduSW5XaXRoUG9wdXAiLCJ0aGVuIiwicmVzdWx0IiwiYWNjZXNzVG9rZW4iLCJjcmVkZW50aWFsIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsImNhdGNoIiwiZXJyb3IiLCJyZW1vdmVJdGVtIiwibG9nb3V0Iiwic2lnbk91dCIsImxpc3RlblRvQXV0aENoYW5nZSIsIm9uQXV0aFN0YXRlQ2hhbmdlZCIsInVzZXIiLCJmaXJlYmFzZUNvbmZpZyIsImFwaUtleSIsImF1dGhEb21haW4iLCJkYXRhYmFzZVVSTCIsInN0b3JhZ2VCdWNrZXQiLCJhZGRFdmVudExpc3RlbmVyIiwiU2xhdmVXb3JrZXIiLCJyZXF1aXJlIiwic2xhdmVXb3JrZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDaEVBOztBQUVBLElBQU1BLGdCQUFnQixFQUF0Qjs7QUFFTyxJQUFNQyw4REFBMkIsU0FBM0JBLHdCQUEyQixJQUFLO0FBQzNDRCxnQkFBY0UsQ0FBZCxHQUFrQkMsRUFBRUMsT0FBcEI7QUFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxZQUFZO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQix3QkFBd0I7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLHVCQUF1QjtBQUNwQztBQUNBO0FBQ0E7QUFDQSxhQUFhLHNCQUFzQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7Ozs7Ozs7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7QUNSTyxJQUFNNkMsMENBQWlCO0FBQzVCQyxVQUFRLHlDQURvQjtBQUU1QkMsY0FBWSxvQ0FGZ0I7QUFHNUJDLGVBQWEsMkNBSGU7QUFJNUJDLGlCQUFlO0FBSmEsQ0FBdkIsQzs7Ozs7Ozs7O0FDQVA7O0FBQ0E7O0FBQ0E7O0FBRUEsZ0JBQVlDLGdCQUFaLENBQTZCLE9BQTdCO0FBQ0EsaUJBQWFBLGdCQUFiLENBQThCLE9BQTlCO0FBQ0E1QixPQUFPNEIsZ0JBQVAsQ0FBd0IsV0FBeEI7O0FBRUEsb0M7Ozs7Ozs7Ozs7OztBQ1JBLElBQU1DLGNBQWMsbUJBQUFDLENBQVEsQ0FBUixDQUFwQjtBQUNPLElBQU1DLG9DQUFjLElBQUlGLFdBQUosRUFBcEIsQzs7Ozs7O0FDRFA7QUFDQTtBQUNBLEUiLCJmaWxlIjoibWFzdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA3KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA3YjliNmEwYzIwNzQ1Yjk0MjYwNyIsImltcG9ydCB7IG1lc3NhZ2VyIH0gZnJvbSBcIi4vbWVzc2FnZXJcIjtcblxuY29uc3QgbW91c2VQb3NpdGlvbiA9IHt9O1xuXG5leHBvcnQgY29uc3QgdXBkYXRlTW91c2VQb3NpdGlvblN0b3JlID0gZSA9PiB7XG4gIG1vdXNlUG9zaXRpb24ueCA9IGUuY2xpZW50WDtcbiAgbW91c2VQb3NpdGlvbi55ID0gZS5jbGllbnRZO1xufTtcblxuY29uc3Qgc2F2ZWRNb3VzZVBvc2l0aW9uID0ge307XG5cbmV4cG9ydCBjb25zdCBwb3N0TW91c2VQb3NpdGlvbklmQ2hhbmdlZCA9ICgpID0+IHtcbiAgaWYgKFxuICAgIG1vdXNlUG9zaXRpb24ueCA9PT0gc2F2ZWRNb3VzZVBvc2l0aW9uLnggJiZcbiAgICBtb3VzZVBvc2l0aW9uLnkgPT09IHNhdmVkTW91c2VQb3NpdGlvbi55XG4gIClcbiAgICByZXR1cm47XG4gIG1lc3NhZ2VyLnBvc3Qoe1xuICAgIHR5cGU6IFwiTU9VU0VfUE9TSVRJT05cIixcbiAgICBwYXlsb2FkOiBtb3VzZVBvc2l0aW9uXG4gIH0pO1xuICBzYXZlZE1vdXNlUG9zaXRpb24ueCA9IG1vdXNlUG9zaXRpb24ueDtcbiAgc2F2ZWRNb3VzZVBvc2l0aW9uLnkgPSBtb3VzZVBvc2l0aW9uLnk7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci9tb3VzZS5qcyIsImV4cG9ydCBjb25zdCBsb2dpbkJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbG9naW5CdXR0b25cIik7XG5leHBvcnQgY29uc3QgbG9nb3V0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNsb2dvdXRCdXR0b25cIik7XG5leHBvcnQgY29uc3QgZm9sbG93ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2ZvbGxvd2VyXCIpO1xuXG5leHBvcnQgY29uc3QgYXBwbHlMb2dnZWRVaSA9ICgpID0+IGF1dGhDb250YWluZXIuY2xhc3NMaXN0LmFkZChcImxvZ2dlZFwiKTtcbmV4cG9ydCBjb25zdCBhcHBseUFub255bW91c1VpID0gKCkgPT4gYXV0aENvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKFwibG9nZ2VkXCIpO1xuXG5leHBvcnQgY29uc3QgYXBwbHlGb2xsb3dlclVpID0gZm9sbG93ZXJQb3NpdGlvbiA9PiB7XG4gIGZvbGxvd2VyLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGVYKCR7Zm9sbG93ZXJQb3NpdGlvbi54fXB4KSB0cmFuc2xhdGVZKCR7Zm9sbG93ZXJQb3NpdGlvbi55fXB4KWA7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci91aS5qcyIsImltcG9ydCB7IG1haW5NZXNzYWdlciB9IGZyb20gXCJAdmthbW1lcmVyL3Bvc3RtZXNzYWdlLXJhZlwiO1xuaW1wb3J0IHsgc2xhdmVXb3JrZXIgfSBmcm9tIFwiLi9zbGF2ZVdvcmtlclwiO1xuaW1wb3J0IHsgcG9zdE1vdXNlUG9zaXRpb25JZkNoYW5nZWQgfSBmcm9tIFwiLi9tb3VzZVwiO1xuaW1wb3J0IHsgYXBwbHlMb2dnZWRVaSwgYXBwbHlBbm9ueW1vdXNVaSwgYXBwbHlGb2xsb3dlclVpIH0gZnJvbSBcIi4vdWlcIjtcblxuY29uc3Qgb25BY3Rpb24gPSBhY3Rpb24gPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBcIldPUktFUl9BVVRIX0xPR0dFRFwiOlxuICAgICAgcmV0dXJuIGFwcGx5TG9nZ2VkVWkoKTtcbiAgICBjYXNlIFwiV09SS0VSX0FVVEhfQU5PTllNT1VTXCI6XG4gICAgICByZXR1cm4gYXBwbHlBbm9ueW1vdXNVaSgpO1xuICAgIGNhc2UgXCJGT0xMT1dFUlwiOlxuICAgICAgcmV0dXJuIGFwcGx5Rm9sbG93ZXJVaShhY3Rpb24ucGF5bG9hZCk7XG4gICAgZGVmYXVsdDoge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IG1lc3NhZ2VyID0gbWFpbk1lc3NhZ2VyKHtcbiAgd29ya2VyOiBzbGF2ZVdvcmtlcixcbiAgb25BY3Rpb24sXG4gIGJlZm9yZVBpbmc6ICgpID0+IHBvc3RNb3VzZVBvc2l0aW9uSWZDaGFuZ2VkKClcbn0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci9tZXNzYWdlci5qcyIsImltcG9ydCB7IGZpcmViYXNlQ29uZmlnIH0gZnJvbSBcIi4uL2NvbW1vbi9maXJlYmFzZUNvbmZpZ1wiO1xuaW1wb3J0IHsgbWVzc2FnZXIgfSBmcm9tIFwiLi9tZXNzYWdlclwiO1xuXG53aW5kb3cuZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZyk7XG5cbmNvbnN0IGZpcmViYXNlQXV0aCA9IGZpcmViYXNlLmF1dGgoKTtcblxuZXhwb3J0IGNvbnN0IGxvZ2luID0gKCkgPT4ge1xuICBjb25zdCBmaXJlYmFzZUZhY2Vib29rUHJvdmlkZXIgPSBuZXcgZmlyZWJhc2UuYXV0aC5GYWNlYm9va0F1dGhQcm92aWRlcigpO1xuICBmaXJlYmFzZUF1dGhcbiAgICAuc2lnbkluV2l0aFBvcHVwKGZpcmViYXNlRmFjZWJvb2tQcm92aWRlcilcbiAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gcmVzdWx0LmNyZWRlbnRpYWwuYWNjZXNzVG9rZW47XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJBUFBfZmlyZWJhc2VBY2Nlc3NUb2tlblwiLCBhY2Nlc3NUb2tlbik7XG4gICAgICBtZXNzYWdlci5wb3N0KHtcbiAgICAgICAgdHlwZTogXCJNQUlOX0FVVEhfTE9HSU5fU1VDQ0VTU1wiLFxuICAgICAgICBwYXlsb2FkOiBhY2Nlc3NUb2tlblxuICAgICAgfSk7XG4gICAgfSlcbiAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIkFQUF9maXJlYmFzZUFjY2Vzc1Rva2VuXCIpO1xuICAgICAgbWVzc2FnZXIucG9zdCh7XG4gICAgICAgIHR5cGU6IFwiTUFJTl9BVVRIX0xPR0lOX0VSUk9SXCIsXG4gICAgICAgIGVycm9yXG4gICAgICB9KTtcbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBsb2dvdXQgPSAoKSA9PiBmaXJlYmFzZUF1dGguc2lnbk91dCgpO1xuXG5leHBvcnQgY29uc3QgbGlzdGVuVG9BdXRoQ2hhbmdlID0gKCkgPT5cbiAgZmlyZWJhc2VBdXRoLm9uQXV0aFN0YXRlQ2hhbmdlZCh1c2VyID0+IHtcbiAgICBpZiAodXNlcikge1xuICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSB3aW5kb3cubG9jYWxTdG9yYWdlW1wiQVBQX2ZpcmViYXNlQWNjZXNzVG9rZW5cIl07XG4gICAgICBtZXNzYWdlci5wb3N0KHtcbiAgICAgICAgdHlwZTogXCJNQUlOX0FVVEhfTE9HR0VEXCIsXG4gICAgICAgIHBheWxvYWQ6IGFjY2Vzc1Rva2VuXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiQVBQX2ZpcmViYXNlQWNjZXNzVG9rZW5cIik7XG4gICAgICBtZXNzYWdlci5wb3N0KHsgdHlwZTogXCJNQUlOX0FVVEhfQU5PTllNT1VTXCIgfSk7XG4gICAgfVxuICB9KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYXN0ZXIvZmlyZWJhc2UuanMiLCJpbXBvcnQgeyBzZW5kVG9Xb3JrZXIsIHNlbmRUb01haW4gfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgY29uc3QgbWFpbk1lc3NhZ2VyID0gKHsgd29ya2VyLCBvbkFjdGlvbiwgYmVmb3JlUGluZywgYWZ0ZXJQaW5nIH0pID0+IHtcbiAgLy8gU1RBVEVcbiAgY29uc3QgcyA9IHtcbiAgICBwaW5naW5nOiBmYWxzZSxcbiAgICBpbk9wZXJhdGlvbnM6IHt9LFxuICAgIG91dE9wZXJhdGlvbnM6IFtdLFxuICAgIHBpbmdDb3VudDogMFxuICB9O1xuXG4gIC8vIElOSVRcbiAgd29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UobUUpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShtRS5kYXRhKTtcbiAgICBpZiAoIW1lc3NhZ2UudHlwZSB8fCBtZXNzYWdlLnR5cGUgIT09IFwiUE1SQUZfVE9fTUFJTlwiKSByZXR1cm47XG4gICAgbWVzc2FnZS5wYXlsb2FkLmZvckVhY2gob25PcGVyYXRpb24pO1xuICAgIGlmIChtZXNzYWdlLm1ldGEgJiYgbWVzc2FnZS5tZXRhLnBpbmdDb21tYW5kID09PSBcInN0YXJ0XCIpIHN0YXJ0UGluZygpO1xuICAgIGlmIChtZXNzYWdlLm1ldGEgJiYgbWVzc2FnZS5tZXRhLnBpbmdDb21tYW5kID09PSBcInN0b3BcIikgc3RvcFBpbmcoKTtcbiAgfSk7XG5cbiAgLy8gUFJJVkFURVxuICBjb25zdCBvbk9wZXJhdGlvbiA9IG9wZXJhdGlvbiA9PiB7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHJldHVybiBvbkFjdGlvbihvcGVyYXRpb24ucGF5bG9hZCk7XG4gICAgaWYgKCFvcGVyYXRpb24ubWV0YSB8fCAhb3BlcmF0aW9uLm1ldGEuZGVsYXkpIHtcbiAgICAgIHMuaW5PcGVyYXRpb25zW3MucGluZ0NvdW50XSA9IHMuaW5PcGVyYXRpb25zW3MucGluZ0NvdW50XSB8fCBbXTtcbiAgICAgIHJldHVybiBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0ucHVzaChvcGVyYXRpb24pO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICBvcGVyYXRpb24ubWV0YS5kZWxheS5waW5nQ291bnQgJiZcbiAgICAgIG9wZXJhdGlvbi5tZXRhLmRlbGF5LnBpbmdDb3VudCA+PSBzLnBpbmdDb3VudFxuICAgICkge1xuICAgICAgcy5pbk9wZXJhdGlvbnNbb3BlcmF0aW9uLm1ldGEuZGVsYXkucGluZ0NvdW50XSA9IHMuaW5PcGVyYXRpb25zW1xuICAgICAgICBvcGVyYXRpb24ubWV0YS5kZWxheS5waW5nQ291bnRcbiAgICAgIF0gfHwgW107XG4gICAgICByZXR1cm4gcy5pbk9wZXJhdGlvbnNbb3BlcmF0aW9uLm1ldGEuZGVsYXkucGluZ0NvdW50XS5wdXNoKG9wZXJhdGlvbik7XG4gICAgfVxuICAgIGlmIChvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleCAmJiBvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleCA+PSAwKSB7XG4gICAgICBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudCArIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmluZGV4XSA9IHMuaW5PcGVyYXRpb25zW1xuICAgICAgICBzLnBpbmdDb3VudCArIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmluZGV4XG4gICAgICBdIHx8IFtdO1xuICAgICAgcmV0dXJuIHMuaW5PcGVyYXRpb25zW3MucGluZ0NvdW50ICsgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXhdLnB1c2goXG4gICAgICAgIG9wZXJhdGlvblxuICAgICAgKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHByb2Nlc3NJbk9wZXJhdGlvbnMgPSAoKSA9PiB7XG4gICAgaWYgKCFzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0pIHJldHVybjtcbiAgICBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0uZm9yRWFjaChvID0+IG9uQWN0aW9uKG8ucGF5bG9hZCkpO1xuICAgIHMuaW5PcGVyYXRpb25zW3MucGluZ0NvdW50XS5sZW5ndGggPSAwO1xuICB9O1xuICBjb25zdCBzZW5kQWxsID0gbWV0YSA9PiB7XG4gICAgc2VuZFRvV29ya2VyKHdvcmtlciwge1xuICAgICAgdHlwZTogXCJQTVJBRl9UT19XT1JLRVJcIixcbiAgICAgIG1ldGEsXG4gICAgICBwYXlsb2FkOiBzLm91dE9wZXJhdGlvbnNcbiAgICB9KTtcbiAgICBzLm91dE9wZXJhdGlvbnMubGVuZ3RoID0gMDtcbiAgfTtcbiAgY29uc3QgcGluZyA9ICgpID0+IHtcbiAgICBpZiAoIXMucGluZ2luZykgcmV0dXJuO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShwaW5nKTtcbiAgICBpZiAoYmVmb3JlUGluZykgYmVmb3JlUGluZyhzLnBpbmdDb3VudCk7XG4gICAgc2VuZEFsbCh7IHBpbmdDb3VudDogcy5waW5nQ291bnQgfSk7XG4gICAgaWYgKGFmdGVyUGluZykgYWZ0ZXJQaW5nKHMucGluZ0NvdW50ICsgMSk7XG4gICAgcHJvY2Vzc0luT3BlcmF0aW9ucyhzLnBpbmdDb3VudCk7XG4gICAgcy5waW5nQ291bnQrKztcbiAgfTtcblxuICAvLyBQVUJMSUNcbiAgY29uc3QgcG9zdCA9IGFjdGlvbiA9PiB7XG4gICAgcy5vdXRPcGVyYXRpb25zLnB1c2goeyBwYXlsb2FkOiBhY3Rpb24gfSk7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHNlbmRBbGwoKTtcbiAgfTtcbiAgY29uc3Qgc3RhcnRQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IHRydWU7XG4gICAgcy5waW5nQ291bnQgPSAwO1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShwaW5nKTtcbiAgfTtcbiAgY29uc3Qgc3RvcFBpbmcgPSAoKSA9PiB7XG4gICAgcy5waW5naW5nID0gZmFsc2U7XG4gICAgc2VuZEFsbCgpO1xuICAgIHByb2Nlc3NJbk9wZXJhdGlvbnMoKTtcbiAgfTtcbiAgcmV0dXJuIHsgcG9zdCB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHdvcmtlck1lc3NhZ2VyID0gKHsgb25BY3Rpb24sIGJlZm9yZVBvbmcsIGFmdGVyUG9uZyB9KSA9PiB7XG4gIC8vIFNUQVRFXG4gIGNvbnN0IHMgPSB7XG4gICAgcGluZ2luZzogZmFsc2UsXG4gICAgb3V0T3BlcmF0aW9uczogW11cbiAgfTtcblxuICAvLyBJTklUXG4gIHNlbGYuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShtRSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKG1FLmRhdGEpO1xuICAgIGlmICghbWVzc2FnZS50eXBlIHx8IG1lc3NhZ2UudHlwZSAhPT0gXCJQTVJBRl9UT19XT1JLRVJcIikgcmV0dXJuO1xuICAgIGlmIChtZXNzYWdlLm1ldGEgJiYgdHlwZW9mIG1lc3NhZ2UubWV0YS5waW5nQ291bnQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICBwb25nKG1lc3NhZ2UubWV0YS5waW5nQ291bnQpO1xuICAgIG1lc3NhZ2UucGF5bG9hZC5mb3JFYWNoKG8gPT4gb25BY3Rpb24oby5wYXlsb2FkKSk7XG4gIH0pO1xuXG4gIC8vIFBSSVZBVEVcbiAgY29uc3Qgc2VuZEFsbCA9IG1ldGEgPT4ge1xuICAgIHNlbmRUb01haW4oe1xuICAgICAgdHlwZTogXCJQTVJBRl9UT19NQUlOXCIsXG4gICAgICBtZXRhLFxuICAgICAgcGF5bG9hZDogcy5vdXRPcGVyYXRpb25zXG4gICAgfSk7XG4gICAgcy5vdXRPcGVyYXRpb25zLmxlbmd0aCA9IDA7XG4gIH07XG4gIGNvbnN0IHBvbmcgPSBwaW5nQ291bnQgPT4ge1xuICAgIGlmICghcy5waW5naW5nKSByZXR1cm47XG4gICAgaWYgKGJlZm9yZVBvbmcpIGJlZm9yZVBvbmcocGluZ0NvdW50KTtcbiAgICBzZW5kQWxsKHsgcGluZ0NvdW50IH0pO1xuICAgIGlmIChhZnRlclBvbmcpIGFmdGVyUG9uZyhwaW5nQ291bnQgKyAxKTtcbiAgfTtcblxuICAvLyBQVUJMSUNcbiAgY29uc3QgcG9zdCA9IChhY3Rpb24sIG1ldGEpID0+IHtcbiAgICBzLm91dE9wZXJhdGlvbnMucHVzaCh7IHBheWxvYWQ6IGFjdGlvbiwgbWV0YSB9KTtcbiAgICBpZiAoIXMucGluZ2luZykgc2VuZEFsbCgpO1xuICB9O1xuICBjb25zdCBzdGFydFBpbmcgPSAoKSA9PiB7XG4gICAgcy5waW5naW5nID0gdHJ1ZTtcbiAgICBzZW5kQWxsKHsgcGluZ0NvbW1hbmQ6IFwic3RhcnRcIiB9KTtcbiAgfTtcbiAgY29uc3Qgc3RvcFBpbmcgPSAoKSA9PiB7XG4gICAgcy5waW5naW5nID0gZmFsc2U7XG4gICAgc2VuZEFsbCh7IHBpbmdDb21tYW5kOiBcInN0b3BcIiB9KTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBwb3N0LFxuICAgIHN0YXJ0UGluZyxcbiAgICBzdG9wUGluZ1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9AdmthbW1lcmVyL3Bvc3RtZXNzYWdlLXJhZi9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0IGNvbnN0IHNlbmRUb1dvcmtlciA9ICh3b3JrZXIsIG1lc3NhZ2UpID0+IHtcbiAgY29uc3Qgc3RyaW5nZWQgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgd29ya2VyLnBvc3RNZXNzYWdlKHN0cmluZ2VkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW5kVG9NYWluID0gbWVzc2FnZSA9PiB7XG4gIGNvbnN0IHN0cmluZ2VkID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gIHNlbGYucG9zdE1lc3NhZ2Uoc3RyaW5nZWQpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9AdmthbW1lcmVyL3Bvc3RtZXNzYWdlLXJhZi9zcmMvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0IGNvbnN0IGZpcmViYXNlQ29uZmlnID0ge1xuICBhcGlLZXk6IFwiQUl6YVN5Q0JJTWxCNVdsT1R1ZnFWbzN0TXdjSm9BYk5WNzZCVndjXCIsXG4gIGF1dGhEb21haW46IFwidGVzdC1wcm9qZWN0LTQ0MzQxLmZpcmViYXNlYXBwLmNvbVwiLFxuICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Rlc3QtcHJvamVjdC00NDM0MS5maXJlYmFzZWlvLmNvbVwiLFxuICBzdG9yYWdlQnVja2V0OiBcInRlc3QtcHJvamVjdC00NDM0MS5hcHBzcG90LmNvbVwiXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbW1vbi9maXJlYmFzZUNvbmZpZy5qcyIsImltcG9ydCB7IGxvZ2luQnV0dG9uLCBsb2dvdXRCdXR0b24gfSBmcm9tIFwiLi91aVwiO1xuaW1wb3J0IHsgdXBkYXRlTW91c2VQb3NpdGlvblN0b3JlIH0gZnJvbSBcIi4vbW91c2VcIjtcbmltcG9ydCB7IGxvZ2luLCBsb2dvdXQsIGxpc3RlblRvQXV0aENoYW5nZSB9IGZyb20gXCIuL2ZpcmViYXNlXCI7XG5cbmxvZ2luQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsb2dpbik7XG5sb2dvdXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGxvZ291dCk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB1cGRhdGVNb3VzZVBvc2l0aW9uU3RvcmUpO1xuXG5saXN0ZW5Ub0F1dGhDaGFuZ2UoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYXN0ZXIvbWFzdGVyLmpzIiwiY29uc3QgU2xhdmVXb3JrZXIgPSByZXF1aXJlKFwid29ya2VyLWxvYWRlciEuLi9zbGF2ZS9zbGF2ZS5qc1wiKTtcbmV4cG9ydCBjb25zdCBzbGF2ZVdvcmtlciA9IG5ldyBTbGF2ZVdvcmtlcigpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci9zbGF2ZVdvcmtlci5qcyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiBuZXcgV29ya2VyKF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJmNTRhODhmYjM3MTViZTFlZTU5NC53b3JrZXIuanNcIik7XG59O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi93b3JrZXItbG9hZGVyIS4vc3JjL3NsYXZlL3NsYXZlLmpzXG4vLyBtb2R1bGUgaWQgPSA5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=