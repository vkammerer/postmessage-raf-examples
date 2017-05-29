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
  // console.log("master: action", action);
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

var mousePosition = {};

window.addEventListener("mousemove", function (e) {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
});

var sentMousePositionX = void 0;
var sentMousePositionY = void 0;

var messager = exports.messager = (0, _postmessageRaf.mainMessager)({
  worker: _slaveWorker.slaveWorker,
  onAction: onAction,
  beforePing: function beforePing() {
    if (mousePosition.x === sentMousePositionX || mousePosition.y === sentMousePositionY) return;
    messager.post({
      type: "MOUSE_POSITION",
      payload: mousePosition
    });
    sentMousePositionX = mousePosition.x;
    sentMousePositionY = mousePosition.y;
  }
});

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
	return new Worker(__webpack_require__.p + "d8b81e620c3c786a993a.worker.js");
};

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMGE3MTZkNmUxMWE5NzZmZjczMjUiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci91aS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWFzdGVyL2ZpcmViYXNlLmpzIiwid2VicGFjazovLy8uL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21tb24vZmlyZWJhc2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci9tYXN0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci9tZXNzYWdlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWFzdGVyL3NsYXZlV29ya2VyLmpzIiwid2VicGFjazovLy8uL3NyYy9zbGF2ZS9zbGF2ZS5qcyJdLCJuYW1lcyI6WyJsb2dpbkJ1dHRvbiIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImxvZ291dEJ1dHRvbiIsImZvbGxvd2VyIiwiYXBwbHlMb2dnZWRVaSIsImF1dGhDb250YWluZXIiLCJjbGFzc0xpc3QiLCJhZGQiLCJhcHBseUFub255bW91c1VpIiwicmVtb3ZlIiwiYXBwbHlGb2xsb3dlclVpIiwic3R5bGUiLCJ0cmFuc2Zvcm0iLCJmb2xsb3dlclBvc2l0aW9uIiwieCIsInkiLCJ3aW5kb3ciLCJmaXJlYmFzZSIsImluaXRpYWxpemVBcHAiLCJmaXJlYmFzZUF1dGgiLCJhdXRoIiwibG9naW4iLCJmaXJlYmFzZUZhY2Vib29rUHJvdmlkZXIiLCJGYWNlYm9va0F1dGhQcm92aWRlciIsInNpZ25JbldpdGhQb3B1cCIsInRoZW4iLCJyZXN1bHQiLCJhY2Nlc3NUb2tlbiIsImNyZWRlbnRpYWwiLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwicG9zdCIsInR5cGUiLCJwYXlsb2FkIiwiY2F0Y2giLCJlcnJvciIsInJlbW92ZUl0ZW0iLCJsb2dvdXQiLCJzaWduT3V0IiwibGlzdGVuVG9BdXRoQ2hhbmdlIiwib25BdXRoU3RhdGVDaGFuZ2VkIiwidXNlciIsImZpcmViYXNlQ29uZmlnIiwiYXBpS2V5IiwiYXV0aERvbWFpbiIsImRhdGFiYXNlVVJMIiwic3RvcmFnZUJ1Y2tldCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbkFjdGlvbiIsImFjdGlvbiIsIm1vdXNlUG9zaXRpb24iLCJlIiwiY2xpZW50WCIsImNsaWVudFkiLCJzZW50TW91c2VQb3NpdGlvblgiLCJzZW50TW91c2VQb3NpdGlvblkiLCJtZXNzYWdlciIsIndvcmtlciIsImJlZm9yZVBpbmciLCJTbGF2ZVdvcmtlciIsInJlcXVpcmUiLCJzbGF2ZVdvcmtlciJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDaEVPLElBQU1BLG9DQUFjQyxTQUFTQyxhQUFULENBQXVCLGNBQXZCLENBQXBCO0FBQ0EsSUFBTUMsc0NBQWVGLFNBQVNDLGFBQVQsQ0FBdUIsZUFBdkIsQ0FBckI7QUFDQSxJQUFNRSw4QkFBV0gsU0FBU0MsYUFBVCxDQUF1QixXQUF2QixDQUFqQjs7QUFFQSxJQUFNRyx3Q0FBZ0IsU0FBaEJBLGFBQWdCO0FBQUEsU0FB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QUNBRixnQkFBY25DLENBQWQsR0FBa0JvQyxFQUFFRSxPQUFwQjtBQUNELENBSEQ7O0FBS0EsSUFBSUMsMkJBQUo7QUFDQSxJQUFJQywyQkFBSjs7QUFFTyxJQUFNQyw4QkFBVyxrQ0FBYTtBQUNuQ0Msa0NBRG1DO0FBRW5DVCxvQkFGbUM7QUFHbkNVLGNBQVksc0JBQU07QUFDaEIsUUFDRVIsY0FBY3BDLENBQWQsS0FBb0J3QyxrQkFBcEIsSUFDQUosY0FBY25DLENBQWQsS0FBb0J3QyxrQkFGdEIsRUFJRTtBQUNGQyxhQUFTekIsSUFBVCxDQUFjO0FBQ1pDLFlBQU0sZ0JBRE07QUFFWkMsZUFBU2lCO0FBRkcsS0FBZDtBQUlBSSx5QkFBcUJKLGNBQWNwQyxDQUFuQztBQUNBeUMseUJBQXFCTCxjQUFjbkMsQ0FBbkM7QUFDRDtBQWZrQyxDQUFiLENBQWpCLEM7Ozs7Ozs7Ozs7OztBQzdCUCxJQUFNNEMsY0FBYyxtQkFBQUMsQ0FBUSxDQUFSLENBQXBCO0FBQ08sSUFBTUMsb0NBQWMsSUFBSUYsV0FBSixFQUFwQixDOzs7Ozs7QUNEUDtBQUNBO0FBQ0EsRSIsImZpbGUiOiJtYXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDBhNzE2ZDZlMTFhOTc2ZmY3MzI1IiwiZXhwb3J0IGNvbnN0IGxvZ2luQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNsb2dpbkJ1dHRvblwiKTtcbmV4cG9ydCBjb25zdCBsb2dvdXRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2xvZ291dEJ1dHRvblwiKTtcbmV4cG9ydCBjb25zdCBmb2xsb3dlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9sbG93ZXJcIik7XG5cbmV4cG9ydCBjb25zdCBhcHBseUxvZ2dlZFVpID0gKCkgPT4gYXV0aENvbnRhaW5lci5jbGFzc0xpc3QuYWRkKFwibG9nZ2VkXCIpO1xuZXhwb3J0IGNvbnN0IGFwcGx5QW5vbnltb3VzVWkgPSAoKSA9PiBhdXRoQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2dnZWRcIik7XG5cbmV4cG9ydCBjb25zdCBhcHBseUZvbGxvd2VyVWkgPSBmb2xsb3dlclBvc2l0aW9uID0+IHtcbiAgZm9sbG93ZXIuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVgoJHtmb2xsb3dlclBvc2l0aW9uLnh9cHgpIHRyYW5zbGF0ZVkoJHtmb2xsb3dlclBvc2l0aW9uLnl9cHgpYDtcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbWFzdGVyL3VpLmpzIiwiaW1wb3J0IHsgZmlyZWJhc2VDb25maWcgfSBmcm9tIFwiLi4vY29tbW9uL2ZpcmViYXNlQ29uZmlnXCI7XG5pbXBvcnQgeyBtZXNzYWdlciB9IGZyb20gXCIuL21lc3NhZ2VyXCI7XG5cbndpbmRvdy5maXJlYmFzZS5pbml0aWFsaXplQXBwKGZpcmViYXNlQ29uZmlnKTtcblxuY29uc3QgZmlyZWJhc2VBdXRoID0gZmlyZWJhc2UuYXV0aCgpO1xuXG5leHBvcnQgY29uc3QgbG9naW4gPSAoKSA9PiB7XG4gIGNvbnN0IGZpcmViYXNlRmFjZWJvb2tQcm92aWRlciA9IG5ldyBmaXJlYmFzZS5hdXRoLkZhY2Vib29rQXV0aFByb3ZpZGVyKCk7XG4gIGZpcmViYXNlQXV0aFxuICAgIC5zaWduSW5XaXRoUG9wdXAoZmlyZWJhc2VGYWNlYm9va1Byb3ZpZGVyKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgY29uc3QgYWNjZXNzVG9rZW4gPSByZXN1bHQuY3JlZGVudGlhbC5hY2Nlc3NUb2tlbjtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImFwcF9maXJlYmFzZUFjY2Vzc1Rva2VuXCIsIGFjY2Vzc1Rva2VuKTtcbiAgICAgIG1lc3NhZ2VyLnBvc3Qoe1xuICAgICAgICB0eXBlOiBcIk1BSU5fQVVUSF9MT0dJTl9TVUNDRVNTXCIsXG4gICAgICAgIHBheWxvYWQ6IGFjY2Vzc1Rva2VuXG4gICAgICB9KTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiYXBwX2ZpcmViYXNlQWNjZXNzVG9rZW5cIik7XG4gICAgICBtZXNzYWdlci5wb3N0KHtcbiAgICAgICAgdHlwZTogXCJNQUlOX0FVVEhfTE9HSU5fRVJST1JcIixcbiAgICAgICAgZXJyb3JcbiAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGxvZ291dCA9ICgpID0+IGZpcmViYXNlQXV0aC5zaWduT3V0KCk7XG5cbmV4cG9ydCBjb25zdCBsaXN0ZW5Ub0F1dGhDaGFuZ2UgPSAoKSA9PlxuICBmaXJlYmFzZUF1dGgub25BdXRoU3RhdGVDaGFuZ2VkKHVzZXIgPT4ge1xuICAgIGlmICh1c2VyKSB7XG4gICAgICBjb25zdCBhY2Nlc3NUb2tlbiA9IHdpbmRvdy5sb2NhbFN0b3JhZ2VbXCJhcHBfZmlyZWJhc2VBY2Nlc3NUb2tlblwiXTtcbiAgICAgIG1lc3NhZ2VyLnBvc3Qoe1xuICAgICAgICB0eXBlOiBcIk1BSU5fQVVUSF9MT0dHRURcIixcbiAgICAgICAgcGF5bG9hZDogYWNjZXNzVG9rZW5cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJhcHBfZmlyZWJhc2VBY2Nlc3NUb2tlblwiKTtcbiAgICAgIG1lc3NhZ2VyLnBvc3QoeyB0eXBlOiBcIk1BSU5fQVVUSF9BTk9OWU1PVVNcIiB9KTtcbiAgICB9XG4gIH0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci9maXJlYmFzZS5qcyIsImltcG9ydCB7IHNlbmRUb1dvcmtlciwgc2VuZFRvTWFpbiB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBjb25zdCBtYWluTWVzc2FnZXIgPSAoeyB3b3JrZXIsIG9uQWN0aW9uLCBiZWZvcmVQaW5nLCBhZnRlclBpbmcgfSkgPT4ge1xuICAvLyBTVEFURVxuICBjb25zdCBzID0ge1xuICAgIHBpbmdpbmc6IGZhbHNlLFxuICAgIGluT3BlcmF0aW9uczoge30sXG4gICAgb3V0T3BlcmF0aW9uczogW10sXG4gICAgcGluZ0NvdW50OiAwXG4gIH07XG5cbiAgLy8gSU5JVFxuICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShtRSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKG1FLmRhdGEpO1xuICAgIGlmICghbWVzc2FnZS50eXBlIHx8IG1lc3NhZ2UudHlwZSAhPT0gXCJQTVJBRl9UT19NQUlOXCIpIHJldHVybjtcbiAgICBtZXNzYWdlLnBheWxvYWQuZm9yRWFjaChvbk9wZXJhdGlvbik7XG4gICAgaWYgKG1lc3NhZ2UubWV0YSAmJiBtZXNzYWdlLm1ldGEucGluZ0NvbW1hbmQgPT09IFwic3RhcnRcIikgc3RhcnRQaW5nKCk7XG4gICAgaWYgKG1lc3NhZ2UubWV0YSAmJiBtZXNzYWdlLm1ldGEucGluZ0NvbW1hbmQgPT09IFwic3RvcFwiKSBzdG9wUGluZygpO1xuICB9KTtcblxuICAvLyBQUklWQVRFXG4gIGNvbnN0IG9uT3BlcmF0aW9uID0gb3BlcmF0aW9uID0+IHtcbiAgICBpZiAoIXMucGluZ2luZykgcmV0dXJuIG9uQWN0aW9uKG9wZXJhdGlvbi5wYXlsb2FkKTtcbiAgICBpZiAoIW9wZXJhdGlvbi5tZXRhIHx8ICFvcGVyYXRpb24ubWV0YS5kZWxheSkge1xuICAgICAgcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdID0gcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdIHx8IFtdO1xuICAgICAgcmV0dXJuIHMuaW5PcGVyYXRpb25zW3MucGluZ0NvdW50XS5wdXNoKG9wZXJhdGlvbik7XG4gICAgfVxuICAgIGlmIChcbiAgICAgIG9wZXJhdGlvbi5tZXRhLmRlbGF5LnBpbmdDb3VudCAmJlxuICAgICAgb3BlcmF0aW9uLm1ldGEuZGVsYXkucGluZ0NvdW50ID49IHMucGluZ0NvdW50XG4gICAgKSB7XG4gICAgICBzLmluT3BlcmF0aW9uc1tvcGVyYXRpb24ubWV0YS5kZWxheS5waW5nQ291bnRdID0gcy5pbk9wZXJhdGlvbnNbXG4gICAgICAgIG9wZXJhdGlvbi5tZXRhLmRlbGF5LnBpbmdDb3VudFxuICAgICAgXSB8fCBbXTtcbiAgICAgIHJldHVybiBzLmluT3BlcmF0aW9uc1tvcGVyYXRpb24ubWV0YS5kZWxheS5waW5nQ291bnRdLnB1c2gob3BlcmF0aW9uKTtcbiAgICB9XG4gICAgaWYgKG9wZXJhdGlvbi5tZXRhLmRlbGF5LmluZGV4ICYmIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmluZGV4ID49IDApIHtcbiAgICAgIHMuaW5PcGVyYXRpb25zW3MucGluZ0NvdW50ICsgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXhdID0gcy5pbk9wZXJhdGlvbnNbXG4gICAgICAgIHMucGluZ0NvdW50ICsgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXhcbiAgICAgIF0gfHwgW107XG4gICAgICByZXR1cm4gcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnQgKyBvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleF0ucHVzaChcbiAgICAgICAgb3BlcmF0aW9uXG4gICAgICApO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgcHJvY2Vzc0luT3BlcmF0aW9ucyA9ICgpID0+IHtcbiAgICBpZiAoIXMuaW5PcGVyYXRpb25zW3MucGluZ0NvdW50XSkgcmV0dXJuO1xuICAgIHMuaW5PcGVyYXRpb25zW3MucGluZ0NvdW50XS5mb3JFYWNoKG8gPT4gb25BY3Rpb24oby5wYXlsb2FkKSk7XG4gICAgcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdLmxlbmd0aCA9IDA7XG4gIH07XG4gIGNvbnN0IHNlbmRBbGwgPSBtZXRhID0+IHtcbiAgICBzZW5kVG9Xb3JrZXIod29ya2VyLCB7XG4gICAgICB0eXBlOiBcIlBNUkFGX1RPX1dPUktFUlwiLFxuICAgICAgbWV0YSxcbiAgICAgIHBheWxvYWQ6IHMub3V0T3BlcmF0aW9uc1xuICAgIH0pO1xuICAgIHMub3V0T3BlcmF0aW9ucy5sZW5ndGggPSAwO1xuICB9O1xuICBjb25zdCBwaW5nID0gKCkgPT4ge1xuICAgIGlmICghcy5waW5naW5nKSByZXR1cm47XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBpbmcpO1xuICAgIGlmIChiZWZvcmVQaW5nKSBiZWZvcmVQaW5nKHMucGluZ0NvdW50KTtcbiAgICBzZW5kQWxsKHsgcGluZ0NvdW50OiBzLnBpbmdDb3VudCB9KTtcbiAgICBpZiAoYWZ0ZXJQaW5nKSBhZnRlclBpbmcocy5waW5nQ291bnQgKyAxKTtcbiAgICBwcm9jZXNzSW5PcGVyYXRpb25zKHMucGluZ0NvdW50KTtcbiAgICBzLnBpbmdDb3VudCsrO1xuICB9O1xuXG4gIC8vIFBVQkxJQ1xuICBjb25zdCBwb3N0ID0gYWN0aW9uID0+IHtcbiAgICBzLm91dE9wZXJhdGlvbnMucHVzaCh7IHBheWxvYWQ6IGFjdGlvbiB9KTtcbiAgICBpZiAoIXMucGluZ2luZykgc2VuZEFsbCgpO1xuICB9O1xuICBjb25zdCBzdGFydFBpbmcgPSAoKSA9PiB7XG4gICAgcy5waW5naW5nID0gdHJ1ZTtcbiAgICBzLnBpbmdDb3VudCA9IDA7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHBpbmcpO1xuICB9O1xuICBjb25zdCBzdG9wUGluZyA9ICgpID0+IHtcbiAgICBzLnBpbmdpbmcgPSBmYWxzZTtcbiAgICBzZW5kQWxsKCk7XG4gICAgcHJvY2Vzc0luT3BlcmF0aW9ucygpO1xuICB9O1xuICByZXR1cm4geyBwb3N0IH07XG59O1xuXG5leHBvcnQgY29uc3Qgd29ya2VyTWVzc2FnZXIgPSAoeyBvbkFjdGlvbiwgYmVmb3JlUG9uZywgYWZ0ZXJQb25nIH0pID0+IHtcbiAgLy8gU1RBVEVcbiAgY29uc3QgcyA9IHtcbiAgICBwaW5naW5nOiBmYWxzZSxcbiAgICBvdXRPcGVyYXRpb25zOiBbXVxuICB9O1xuXG4gIC8vIElOSVRcbiAgc2VsZi5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKG1FKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UobUUuZGF0YSk7XG4gICAgaWYgKCFtZXNzYWdlLnR5cGUgfHwgbWVzc2FnZS50eXBlICE9PSBcIlBNUkFGX1RPX1dPUktFUlwiKSByZXR1cm47XG4gICAgaWYgKG1lc3NhZ2UubWV0YSAmJiB0eXBlb2YgbWVzc2FnZS5tZXRhLnBpbmdDb3VudCAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgIHBvbmcobWVzc2FnZS5tZXRhLnBpbmdDb3VudCk7XG4gICAgbWVzc2FnZS5wYXlsb2FkLmZvckVhY2gobyA9PiBvbkFjdGlvbihvLnBheWxvYWQpKTtcbiAgfSk7XG5cbiAgLy8gUFJJVkFURVxuICBjb25zdCBzZW5kQWxsID0gbWV0YSA9PiB7XG4gICAgc2VuZFRvTWFpbih7XG4gICAgICB0eXBlOiBcIlBNUkFGX1RPX01BSU5cIixcbiAgICAgIG1ldGEsXG4gICAgICBwYXlsb2FkOiBzLm91dE9wZXJhdGlvbnNcbiAgICB9KTtcbiAgICBzLm91dE9wZXJhdGlvbnMubGVuZ3RoID0gMDtcbiAgfTtcbiAgY29uc3QgcG9uZyA9IHBpbmdDb3VudCA9PiB7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHJldHVybjtcbiAgICBpZiAoYmVmb3JlUG9uZykgYmVmb3JlUG9uZyhwaW5nQ291bnQpO1xuICAgIHNlbmRBbGwoeyBwaW5nQ291bnQgfSk7XG4gICAgaWYgKGFmdGVyUG9uZykgYWZ0ZXJQb25nKHBpbmdDb3VudCArIDEpO1xuICB9O1xuXG4gIC8vIFBVQkxJQ1xuICBjb25zdCBwb3N0ID0gKGFjdGlvbiwgbWV0YSkgPT4ge1xuICAgIHMub3V0T3BlcmF0aW9ucy5wdXNoKHsgcGF5bG9hZDogYWN0aW9uLCBtZXRhIH0pO1xuICAgIGlmICghcy5waW5naW5nKSBzZW5kQWxsKCk7XG4gIH07XG4gIGNvbnN0IHN0YXJ0UGluZyA9ICgpID0+IHtcbiAgICBzLnBpbmdpbmcgPSB0cnVlO1xuICAgIHNlbmRBbGwoeyBwaW5nQ29tbWFuZDogXCJzdGFydFwiIH0pO1xuICB9O1xuICBjb25zdCBzdG9wUGluZyA9ICgpID0+IHtcbiAgICBzLnBpbmdpbmcgPSBmYWxzZTtcbiAgICBzZW5kQWxsKHsgcGluZ0NvbW1hbmQ6IFwic3RvcFwiIH0pO1xuICB9O1xuICByZXR1cm4ge1xuICAgIHBvc3QsXG4gICAgc3RhcnRQaW5nLFxuICAgIHN0b3BQaW5nXG4gIH07XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnQgY29uc3Qgc2VuZFRvV29ya2VyID0gKHdvcmtlciwgbWVzc2FnZSkgPT4ge1xuICBjb25zdCBzdHJpbmdlZCA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICB3b3JrZXIucG9zdE1lc3NhZ2Uoc3RyaW5nZWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNlbmRUb01haW4gPSBtZXNzYWdlID0+IHtcbiAgY29uc3Qgc3RyaW5nZWQgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgc2VsZi5wb3N0TWVzc2FnZShzdHJpbmdlZCk7XG59O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy91dGlscy5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJleHBvcnQgY29uc3QgZmlyZWJhc2VDb25maWcgPSB7XG4gIGFwaUtleTogXCJBSXphU3lDQklNbEI1V2xPVHVmcVZvM3RNd2NKb0FiTlY3NkJWd2NcIixcbiAgYXV0aERvbWFpbjogXCJ0ZXN0LXByb2plY3QtNDQzNDEuZmlyZWJhc2VhcHAuY29tXCIsXG4gIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGVzdC1wcm9qZWN0LTQ0MzQxLmZpcmViYXNlaW8uY29tXCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwidGVzdC1wcm9qZWN0LTQ0MzQxLmFwcHNwb3QuY29tXCJcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tbW9uL2ZpcmViYXNlQ29uZmlnLmpzIiwiaW1wb3J0IHsgbG9naW5CdXR0b24sIGxvZ291dEJ1dHRvbiB9IGZyb20gXCIuL3VpXCI7XG5pbXBvcnQgeyBsb2dpbiwgbG9nb3V0LCBsaXN0ZW5Ub0F1dGhDaGFuZ2UgfSBmcm9tIFwiLi9maXJlYmFzZVwiO1xuXG5sb2dpbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbG9naW4pO1xubG9nb3V0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsb2dvdXQpO1xuXG5saXN0ZW5Ub0F1dGhDaGFuZ2UoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYXN0ZXIvbWFzdGVyLmpzIiwiaW1wb3J0IHsgbWFpbk1lc3NhZ2VyIH0gZnJvbSBcIkB2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmXCI7XG5pbXBvcnQgeyBzbGF2ZVdvcmtlciB9IGZyb20gXCIuL3NsYXZlV29ya2VyXCI7XG5pbXBvcnQgeyBhcHBseUxvZ2dlZFVpLCBhcHBseUFub255bW91c1VpLCBhcHBseUZvbGxvd2VyVWkgfSBmcm9tIFwiLi91aVwiO1xuXG5jb25zdCBvbkFjdGlvbiA9IGFjdGlvbiA9PiB7XG4gIC8vIGNvbnNvbGUubG9nKFwibWFzdGVyOiBhY3Rpb25cIiwgYWN0aW9uKTtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJXT1JLRVJfQVVUSF9MT0dHRURcIjpcbiAgICAgIHJldHVybiBhcHBseUxvZ2dlZFVpKCk7XG4gICAgY2FzZSBcIldPUktFUl9BVVRIX0FOT05ZTU9VU1wiOlxuICAgICAgcmV0dXJuIGFwcGx5QW5vbnltb3VzVWkoKTtcbiAgICBjYXNlIFwiRk9MTE9XRVJcIjpcbiAgICAgIHJldHVybiBhcHBseUZvbGxvd2VyVWkoYWN0aW9uLnBheWxvYWQpO1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IG1vdXNlUG9zaXRpb24gPSB7fTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZSA9PiB7XG4gIG1vdXNlUG9zaXRpb24ueCA9IGUuY2xpZW50WDtcbiAgbW91c2VQb3NpdGlvbi55ID0gZS5jbGllbnRZO1xufSk7XG5cbmxldCBzZW50TW91c2VQb3NpdGlvblg7XG5sZXQgc2VudE1vdXNlUG9zaXRpb25ZO1xuXG5leHBvcnQgY29uc3QgbWVzc2FnZXIgPSBtYWluTWVzc2FnZXIoe1xuICB3b3JrZXI6IHNsYXZlV29ya2VyLFxuICBvbkFjdGlvbixcbiAgYmVmb3JlUGluZzogKCkgPT4ge1xuICAgIGlmIChcbiAgICAgIG1vdXNlUG9zaXRpb24ueCA9PT0gc2VudE1vdXNlUG9zaXRpb25YIHx8XG4gICAgICBtb3VzZVBvc2l0aW9uLnkgPT09IHNlbnRNb3VzZVBvc2l0aW9uWVxuICAgIClcbiAgICAgIHJldHVybjtcbiAgICBtZXNzYWdlci5wb3N0KHtcbiAgICAgIHR5cGU6IFwiTU9VU0VfUE9TSVRJT05cIixcbiAgICAgIHBheWxvYWQ6IG1vdXNlUG9zaXRpb25cbiAgICB9KTtcbiAgICBzZW50TW91c2VQb3NpdGlvblggPSBtb3VzZVBvc2l0aW9uLng7XG4gICAgc2VudE1vdXNlUG9zaXRpb25ZID0gbW91c2VQb3NpdGlvbi55O1xuICB9XG59KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYXN0ZXIvbWVzc2FnZXIuanMiLCJjb25zdCBTbGF2ZVdvcmtlciA9IHJlcXVpcmUoXCJ3b3JrZXItbG9hZGVyIS4uL3NsYXZlL3NsYXZlLmpzXCIpO1xuZXhwb3J0IGNvbnN0IHNsYXZlV29ya2VyID0gbmV3IFNsYXZlV29ya2VyKCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbWFzdGVyL3NsYXZlV29ya2VyLmpzIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIG5ldyBXb3JrZXIoX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImQ4YjgxZTYyMGMzYzc4NmE5OTNhLndvcmtlci5qc1wiKTtcbn07XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3dvcmtlci1sb2FkZXIhLi9zcmMvc2xhdmUvc2xhdmUuanNcbi8vIG1vZHVsZSBpZCA9IDhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==