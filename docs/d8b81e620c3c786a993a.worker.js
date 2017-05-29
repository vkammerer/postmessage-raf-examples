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
exports.listenToAuthChange = exports.logout = exports.login = undefined;

var _messager = __webpack_require__(1);

var _firebaseConfig = __webpack_require__(4);

self.importScripts("https://www.gstatic.com/firebasejs/4.0.0/firebase.js");

self.firebase.initializeApp(_firebaseConfig.firebaseConfig);
var firebaseAuth = firebase.auth();

var login = exports.login = function login(accessToken) {
  var credential = firebase.auth.FacebookAuthProvider.credential(accessToken);
  firebaseAuth.signInWithCredential(credential).then(function (result) {
    return _messager.messager.post({ type: "WORKER_AUTH_LOGIN_SUCCESS", payload: result });
  }).catch(function (error) {
    return _messager.messager.post({ type: "WORKER_AUTH_LOGIN_ERROR", payload: error });
  });
};

var logout = exports.logout = function logout() {
  return firebaseAuth.signOut();
};

var listenToAuthChange = exports.listenToAuthChange = function listenToAuthChange() {
  return firebaseAuth.onAuthStateChanged(function (user) {
    if (user) _messager.messager.post({ type: "WORKER_AUTH_LOGGED", payload: user });else _messager.messager.post({ type: "WORKER_AUTH_ANONYMOUS" });
  });
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messager = undefined;

var _postmessageRaf = __webpack_require__(2);

var _firebase = __webpack_require__(0);

var onAction = function onAction(action) {
  // console.log("slave: action", action);
  switch (action.type) {
    case "MAIN_AUTH_LOGGED":
      {
        return (0, _firebase.login)(action.payload);
      }
    case "MAIN_AUTH_ANONYMOUS":
      {
        return (0, _firebase.logout)();
      }
    case "MOUSE_POSITION":
      {
        return messager.post({
          type: "FOLLOWER",
          payload: {
            x: action.payload.x + 10,
            y: action.payload.y + 10
          }
        });
      }
    default:
      {
        return;
      }
  }
};

var messager = exports.messager = (0, _postmessageRaf.workerMessager)({
  onAction: onAction
});
messager.startPing();

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


var _messager = __webpack_require__(1);

var _firebase = __webpack_require__(0);

(0, _firebase.listenToAuthChange)();

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDhiODFlNjIwYzNjNzg2YTk5M2EiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NsYXZlL2ZpcmViYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9zbGF2ZS9tZXNzYWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2ZpcmViYXNlQ29uZmlnLmpzIiwid2VicGFjazovLy8uL3NyYy9zbGF2ZS9zbGF2ZS5qcyJdLCJuYW1lcyI6WyJzZWxmIiwiaW1wb3J0U2NyaXB0cyIsImZpcmViYXNlIiwiaW5pdGlhbGl6ZUFwcCIsImZpcmViYXNlQXV0aCIsImF1dGgiLCJsb2dpbiIsImNyZWRlbnRpYWwiLCJGYWNlYm9va0F1dGhQcm92aWRlciIsImFjY2Vzc1Rva2VuIiwic2lnbkluV2l0aENyZWRlbnRpYWwiLCJ0aGVuIiwicG9zdCIsInR5cGUiLCJwYXlsb2FkIiwicmVzdWx0IiwiY2F0Y2giLCJlcnJvciIsImxvZ291dCIsInNpZ25PdXQiLCJsaXN0ZW5Ub0F1dGhDaGFuZ2UiLCJvbkF1dGhTdGF0ZUNoYW5nZWQiLCJ1c2VyIiwib25BY3Rpb24iLCJhY3Rpb24iLCJtZXNzYWdlciIsIngiLCJ5Iiwic3RhcnRQaW5nIiwiZmlyZWJhc2VDb25maWciLCJhcGlLZXkiLCJhdXRoRG9tYWluIiwiZGF0YWJhc2VVUkwiLCJzdG9yYWdlQnVja2V0Il0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFF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QkFBeUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQixrQkFBa0I7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQUE7QUFBQTs7QUFFQSx5QkFBZ0Msa0NBQWtDO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxZQUFZO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQix3QkFBd0I7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhLHVCQUF1QjtBQUNwQztBQUNBO0FBQ0E7QUFDQSxhQUFhLHNCQUFzQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7Ozs7Ozs7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7QUNSTyxJQUFNQywwQ0FBaUI7QUFDNUJDLFVBQVEseUNBRG9CO0FBRTVCQyxjQUFZLG9DQUZnQjtBQUc1QkMsZUFBYSwyQ0FIZTtBQUk1QkMsaUJBQWU7QUFKYSxDQUF2QixDOzs7Ozs7Ozs7QUNBUDs7QUFDQTs7QUFFQSxvQyIsImZpbGUiOiJkOGI4MWU2MjBjM2M3ODZhOTkzYS53b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGQ4YjgxZTYyMGMzYzc4NmE5OTNhIiwiaW1wb3J0IHsgbWVzc2FnZXIgfSBmcm9tIFwiLi9tZXNzYWdlclwiO1xuaW1wb3J0IHsgZmlyZWJhc2VDb25maWcgfSBmcm9tIFwiLi4vY29tbW9uL2ZpcmViYXNlQ29uZmlnXCI7XG5cbnNlbGYuaW1wb3J0U2NyaXB0cyhcImh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL2ZpcmViYXNlanMvNC4wLjAvZmlyZWJhc2UuanNcIik7XG5cbnNlbGYuZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZyk7XG5jb25zdCBmaXJlYmFzZUF1dGggPSBmaXJlYmFzZS5hdXRoKCk7XG5cbmV4cG9ydCBjb25zdCBsb2dpbiA9IGFjY2Vzc1Rva2VuID0+IHtcbiAgY29uc3QgY3JlZGVudGlhbCA9IGZpcmViYXNlLmF1dGguRmFjZWJvb2tBdXRoUHJvdmlkZXIuY3JlZGVudGlhbChhY2Nlc3NUb2tlbik7XG4gIGZpcmViYXNlQXV0aFxuICAgIC5zaWduSW5XaXRoQ3JlZGVudGlhbChjcmVkZW50aWFsKVxuICAgIC50aGVuKHJlc3VsdCA9PlxuICAgICAgbWVzc2FnZXIucG9zdCh7IHR5cGU6IFwiV09SS0VSX0FVVEhfTE9HSU5fU1VDQ0VTU1wiLCBwYXlsb2FkOiByZXN1bHQgfSlcbiAgICApXG4gICAgLmNhdGNoKGVycm9yID0+XG4gICAgICBtZXNzYWdlci5wb3N0KHsgdHlwZTogXCJXT1JLRVJfQVVUSF9MT0dJTl9FUlJPUlwiLCBwYXlsb2FkOiBlcnJvciB9KVxuICAgICk7XG59O1xuXG5leHBvcnQgY29uc3QgbG9nb3V0ID0gKCkgPT4gZmlyZWJhc2VBdXRoLnNpZ25PdXQoKTtcblxuZXhwb3J0IGNvbnN0IGxpc3RlblRvQXV0aENoYW5nZSA9ICgpID0+XG4gIGZpcmViYXNlQXV0aC5vbkF1dGhTdGF0ZUNoYW5nZWQodXNlciA9PiB7XG4gICAgaWYgKHVzZXIpIG1lc3NhZ2VyLnBvc3QoeyB0eXBlOiBcIldPUktFUl9BVVRIX0xPR0dFRFwiLCBwYXlsb2FkOiB1c2VyIH0pO1xuICAgIGVsc2UgbWVzc2FnZXIucG9zdCh7IHR5cGU6IFwiV09SS0VSX0FVVEhfQU5PTllNT1VTXCIgfSk7XG4gIH0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3NsYXZlL2ZpcmViYXNlLmpzIiwiaW1wb3J0IHsgd29ya2VyTWVzc2FnZXIgfSBmcm9tIFwiQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWZcIjtcbmltcG9ydCB7IGxvZ2luLCBsb2dvdXQgfSBmcm9tIFwiLi9maXJlYmFzZVwiO1xuXG5jb25zdCBvbkFjdGlvbiA9IGFjdGlvbiA9PiB7XG4gIC8vIGNvbnNvbGUubG9nKFwic2xhdmU6IGFjdGlvblwiLCBhY3Rpb24pO1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBcIk1BSU5fQVVUSF9MT0dHRURcIjoge1xuICAgICAgcmV0dXJuIGxvZ2luKGFjdGlvbi5wYXlsb2FkKTtcbiAgICB9XG4gICAgY2FzZSBcIk1BSU5fQVVUSF9BTk9OWU1PVVNcIjoge1xuICAgICAgcmV0dXJuIGxvZ291dCgpO1xuICAgIH1cbiAgICBjYXNlIFwiTU9VU0VfUE9TSVRJT05cIjoge1xuICAgICAgcmV0dXJuIG1lc3NhZ2VyLnBvc3Qoe1xuICAgICAgICB0eXBlOiBcIkZPTExPV0VSXCIsXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICB4OiBhY3Rpb24ucGF5bG9hZC54ICsgMTAsXG4gICAgICAgICAgeTogYWN0aW9uLnBheWxvYWQueSArIDEwXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbWVzc2FnZXIgPSB3b3JrZXJNZXNzYWdlcih7XG4gIG9uQWN0aW9uXG59KTtcbm1lc3NhZ2VyLnN0YXJ0UGluZygpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3NsYXZlL21lc3NhZ2VyLmpzIiwiaW1wb3J0IHsgc2VuZFRvV29ya2VyLCBzZW5kVG9NYWluIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGNvbnN0IG1haW5NZXNzYWdlciA9ICh7IHdvcmtlciwgb25BY3Rpb24sIGJlZm9yZVBpbmcsIGFmdGVyUGluZyB9KSA9PiB7XG4gIC8vIFNUQVRFXG4gIGNvbnN0IHMgPSB7XG4gICAgcGluZ2luZzogZmFsc2UsXG4gICAgaW5PcGVyYXRpb25zOiB7fSxcbiAgICBvdXRPcGVyYXRpb25zOiBbXSxcbiAgICBwaW5nQ291bnQ6IDBcbiAgfTtcblxuICAvLyBJTklUXG4gIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKG1FKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UobUUuZGF0YSk7XG4gICAgaWYgKCFtZXNzYWdlLnR5cGUgfHwgbWVzc2FnZS50eXBlICE9PSBcIlBNUkFGX1RPX01BSU5cIikgcmV0dXJuO1xuICAgIG1lc3NhZ2UucGF5bG9hZC5mb3JFYWNoKG9uT3BlcmF0aW9uKTtcbiAgICBpZiAobWVzc2FnZS5tZXRhICYmIG1lc3NhZ2UubWV0YS5waW5nQ29tbWFuZCA9PT0gXCJzdGFydFwiKSBzdGFydFBpbmcoKTtcbiAgICBpZiAobWVzc2FnZS5tZXRhICYmIG1lc3NhZ2UubWV0YS5waW5nQ29tbWFuZCA9PT0gXCJzdG9wXCIpIHN0b3BQaW5nKCk7XG4gIH0pO1xuXG4gIC8vIFBSSVZBVEVcbiAgY29uc3Qgb25PcGVyYXRpb24gPSBvcGVyYXRpb24gPT4ge1xuICAgIGlmICghcy5waW5naW5nKSByZXR1cm4gb25BY3Rpb24ob3BlcmF0aW9uLnBheWxvYWQpO1xuICAgIGlmICghb3BlcmF0aW9uLm1ldGEgfHwgIW9wZXJhdGlvbi5tZXRhLmRlbGF5KSB7XG4gICAgICBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0gPSBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0gfHwgW107XG4gICAgICByZXR1cm4gcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdLnB1c2gob3BlcmF0aW9uKTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgb3BlcmF0aW9uLm1ldGEuZGVsYXkucGluZ0NvdW50ICYmXG4gICAgICBvcGVyYXRpb24ubWV0YS5kZWxheS5waW5nQ291bnQgPj0gcy5waW5nQ291bnRcbiAgICApIHtcbiAgICAgIHMuaW5PcGVyYXRpb25zW29wZXJhdGlvbi5tZXRhLmRlbGF5LnBpbmdDb3VudF0gPSBzLmluT3BlcmF0aW9uc1tcbiAgICAgICAgb3BlcmF0aW9uLm1ldGEuZGVsYXkucGluZ0NvdW50XG4gICAgICBdIHx8IFtdO1xuICAgICAgcmV0dXJuIHMuaW5PcGVyYXRpb25zW29wZXJhdGlvbi5tZXRhLmRlbGF5LnBpbmdDb3VudF0ucHVzaChvcGVyYXRpb24pO1xuICAgIH1cbiAgICBpZiAob3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXggJiYgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXggPj0gMCkge1xuICAgICAgcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnQgKyBvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleF0gPSBzLmluT3BlcmF0aW9uc1tcbiAgICAgICAgcy5waW5nQ291bnQgKyBvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleFxuICAgICAgXSB8fCBbXTtcbiAgICAgIHJldHVybiBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudCArIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmluZGV4XS5wdXNoKFxuICAgICAgICBvcGVyYXRpb25cbiAgICAgICk7XG4gICAgfVxuICB9O1xuICBjb25zdCBwcm9jZXNzSW5PcGVyYXRpb25zID0gKCkgPT4ge1xuICAgIGlmICghcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdKSByZXR1cm47XG4gICAgcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdLmZvckVhY2gobyA9PiBvbkFjdGlvbihvLnBheWxvYWQpKTtcbiAgICBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0ubGVuZ3RoID0gMDtcbiAgfTtcbiAgY29uc3Qgc2VuZEFsbCA9IG1ldGEgPT4ge1xuICAgIHNlbmRUb1dvcmtlcih3b3JrZXIsIHtcbiAgICAgIHR5cGU6IFwiUE1SQUZfVE9fV09SS0VSXCIsXG4gICAgICBtZXRhLFxuICAgICAgcGF5bG9hZDogcy5vdXRPcGVyYXRpb25zXG4gICAgfSk7XG4gICAgcy5vdXRPcGVyYXRpb25zLmxlbmd0aCA9IDA7XG4gIH07XG4gIGNvbnN0IHBpbmcgPSAoKSA9PiB7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHJldHVybjtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGluZyk7XG4gICAgaWYgKGJlZm9yZVBpbmcpIGJlZm9yZVBpbmcocy5waW5nQ291bnQpO1xuICAgIHNlbmRBbGwoeyBwaW5nQ291bnQ6IHMucGluZ0NvdW50IH0pO1xuICAgIGlmIChhZnRlclBpbmcpIGFmdGVyUGluZyhzLnBpbmdDb3VudCArIDEpO1xuICAgIHByb2Nlc3NJbk9wZXJhdGlvbnMocy5waW5nQ291bnQpO1xuICAgIHMucGluZ0NvdW50Kys7XG4gIH07XG5cbiAgLy8gUFVCTElDXG4gIGNvbnN0IHBvc3QgPSBhY3Rpb24gPT4ge1xuICAgIHMub3V0T3BlcmF0aW9ucy5wdXNoKHsgcGF5bG9hZDogYWN0aW9uIH0pO1xuICAgIGlmICghcy5waW5naW5nKSBzZW5kQWxsKCk7XG4gIH07XG4gIGNvbnN0IHN0YXJ0UGluZyA9ICgpID0+IHtcbiAgICBzLnBpbmdpbmcgPSB0cnVlO1xuICAgIHMucGluZ0NvdW50ID0gMDtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGluZyk7XG4gIH07XG4gIGNvbnN0IHN0b3BQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IGZhbHNlO1xuICAgIHNlbmRBbGwoKTtcbiAgICBwcm9jZXNzSW5PcGVyYXRpb25zKCk7XG4gIH07XG4gIHJldHVybiB7IHBvc3QgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB3b3JrZXJNZXNzYWdlciA9ICh7IG9uQWN0aW9uLCBiZWZvcmVQb25nLCBhZnRlclBvbmcgfSkgPT4ge1xuICAvLyBTVEFURVxuICBjb25zdCBzID0ge1xuICAgIHBpbmdpbmc6IGZhbHNlLFxuICAgIG91dE9wZXJhdGlvbnM6IFtdXG4gIH07XG5cbiAgLy8gSU5JVFxuICBzZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UobUUpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShtRS5kYXRhKTtcbiAgICBpZiAoIW1lc3NhZ2UudHlwZSB8fCBtZXNzYWdlLnR5cGUgIT09IFwiUE1SQUZfVE9fV09SS0VSXCIpIHJldHVybjtcbiAgICBpZiAobWVzc2FnZS5tZXRhICYmIHR5cGVvZiBtZXNzYWdlLm1ldGEucGluZ0NvdW50ICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcG9uZyhtZXNzYWdlLm1ldGEucGluZ0NvdW50KTtcbiAgICBtZXNzYWdlLnBheWxvYWQuZm9yRWFjaChvID0+IG9uQWN0aW9uKG8ucGF5bG9hZCkpO1xuICB9KTtcblxuICAvLyBQUklWQVRFXG4gIGNvbnN0IHNlbmRBbGwgPSBtZXRhID0+IHtcbiAgICBzZW5kVG9NYWluKHtcbiAgICAgIHR5cGU6IFwiUE1SQUZfVE9fTUFJTlwiLFxuICAgICAgbWV0YSxcbiAgICAgIHBheWxvYWQ6IHMub3V0T3BlcmF0aW9uc1xuICAgIH0pO1xuICAgIHMub3V0T3BlcmF0aW9ucy5sZW5ndGggPSAwO1xuICB9O1xuICBjb25zdCBwb25nID0gcGluZ0NvdW50ID0+IHtcbiAgICBpZiAoIXMucGluZ2luZykgcmV0dXJuO1xuICAgIGlmIChiZWZvcmVQb25nKSBiZWZvcmVQb25nKHBpbmdDb3VudCk7XG4gICAgc2VuZEFsbCh7IHBpbmdDb3VudCB9KTtcbiAgICBpZiAoYWZ0ZXJQb25nKSBhZnRlclBvbmcocGluZ0NvdW50ICsgMSk7XG4gIH07XG5cbiAgLy8gUFVCTElDXG4gIGNvbnN0IHBvc3QgPSAoYWN0aW9uLCBtZXRhKSA9PiB7XG4gICAgcy5vdXRPcGVyYXRpb25zLnB1c2goeyBwYXlsb2FkOiBhY3Rpb24sIG1ldGEgfSk7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHNlbmRBbGwoKTtcbiAgfTtcbiAgY29uc3Qgc3RhcnRQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IHRydWU7XG4gICAgc2VuZEFsbCh7IHBpbmdDb21tYW5kOiBcInN0YXJ0XCIgfSk7XG4gIH07XG4gIGNvbnN0IHN0b3BQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IGZhbHNlO1xuICAgIHNlbmRBbGwoeyBwaW5nQ29tbWFuZDogXCJzdG9wXCIgfSk7XG4gIH07XG4gIHJldHVybiB7XG4gICAgcG9zdCxcbiAgICBzdGFydFBpbmcsXG4gICAgc3RvcFBpbmdcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydCBjb25zdCBzZW5kVG9Xb3JrZXIgPSAod29ya2VyLCBtZXNzYWdlKSA9PiB7XG4gIGNvbnN0IHN0cmluZ2VkID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gIHdvcmtlci5wb3N0TWVzc2FnZShzdHJpbmdlZCk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2VuZFRvTWFpbiA9IG1lc3NhZ2UgPT4ge1xuICBjb25zdCBzdHJpbmdlZCA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICBzZWxmLnBvc3RNZXNzYWdlKHN0cmluZ2VkKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL3V0aWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydCBjb25zdCBmaXJlYmFzZUNvbmZpZyA9IHtcbiAgYXBpS2V5OiBcIkFJemFTeUNCSU1sQjVXbE9UdWZxVm8zdE13Y0pvQWJOVjc2QlZ3Y1wiLFxuICBhdXRoRG9tYWluOiBcInRlc3QtcHJvamVjdC00NDM0MS5maXJlYmFzZWFwcC5jb21cIixcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90ZXN0LXByb2plY3QtNDQzNDEuZmlyZWJhc2Vpby5jb21cIixcbiAgc3RvcmFnZUJ1Y2tldDogXCJ0ZXN0LXByb2plY3QtNDQzNDEuYXBwc3BvdC5jb21cIlxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vZmlyZWJhc2VDb25maWcuanMiLCJpbXBvcnQgeyBtZXNzYWdlciB9IGZyb20gXCIuL21lc3NhZ2VyXCI7XG5pbXBvcnQgeyBsaXN0ZW5Ub0F1dGhDaGFuZ2UgfSBmcm9tIFwiLi9maXJlYmFzZVwiO1xuXG5saXN0ZW5Ub0F1dGhDaGFuZ2UoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zbGF2ZS9zbGF2ZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=