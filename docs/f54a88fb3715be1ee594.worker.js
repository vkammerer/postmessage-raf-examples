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
  switch (action.type) {
    case "MAIN_AUTH_LOGGED":
      return (0, _firebase.login)(action.payload);
    case "MAIN_AUTH_ANONYMOUS":
      return (0, _firebase.logout)();
    case "MOUSE_POSITION":
      return messager.post({
        type: "FOLLOWER",
        payload: {
          x: action.payload.x + 10,
          y: action.payload.y + 10
        }
      }, {
        delay: {
          index: 10
        }
      });
    default:
      return;
  }
};

var messager = exports.messager = (0, _postmessageRaf.workerMessager)({ onAction: onAction });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjU0YTg4ZmIzNzE1YmUxZWU1OTQiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NsYXZlL2ZpcmViYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9zbGF2ZS9tZXNzYWdlci5qcyIsIndlYnBhY2s6Ly8vLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2ZpcmViYXNlQ29uZmlnLmpzIiwid2VicGFjazovLy8uL3NyYy9zbGF2ZS9zbGF2ZS5qcyJdLCJuYW1lcyI6WyJzZWxmIiwiaW1wb3J0U2NyaXB0cyIsImZpcmViYXNlIiwiaW5pdGlhbGl6ZUFwcCIsImZpcmViYXNlQXV0aCIsImF1dGgiLCJsb2dpbiIsImNyZWRlbnRpYWwiLCJGYWNlYm9va0F1dGhQcm92aWRlciIsImFjY2Vzc1Rva2VuIiwic2lnbkluV2l0aENyZWRlbnRpYWwiLCJ0aGVuIiwicG9zdCIsInR5cGUiLCJwYXlsb2FkIiwicmVzdWx0IiwiY2F0Y2giLCJlcnJvciIsImxvZ291dCIsInNpZ25PdXQiLCJsaXN0ZW5Ub0F1dGhDaGFuZ2UiLCJvbkF1dGhTdGF0ZUNoYW5nZWQiLCJ1c2VyIiwib25BY3Rpb24iLCJhY3Rpb24iLCJtZXNzYWdlciIsIngiLCJ5IiwiZGVsYXkiLCJpbmRleCIsInN0YXJ0UGluZyIsImZpcmViYXNlQ29uZmlnIiwiYXBpS2V5IiwiYXV0aERvbWFpbiIsImRhdGFiYXNlVVJMIiwic3RvcmFnZUJ1Y2tldCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNB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QWEseUJBQXlCO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQkFBMEIsa0JBQWtCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUFBO0FBQUE7O0FBRUEseUJBQWdDLGtDQUFrQztBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsWUFBWTtBQUN6QjtBQUNBOztBQUVBO0FBQ0E7QUFDQSwwQkFBMEIsd0JBQXdCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSx1QkFBdUI7QUFDcEM7QUFDQTtBQUNBO0FBQ0EsYUFBYSxzQkFBc0I7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOzs7Ozs7OztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0FDUk8sSUFBTUMsMENBQWlCO0FBQzVCQyxVQUFRLHlDQURvQjtBQUU1QkMsY0FBWSxvQ0FGZ0I7QUFHNUJDLGVBQWEsMkNBSGU7QUFJNUJDLGlCQUFlO0FBSmEsQ0FBdkIsQzs7Ozs7Ozs7O0FDQVA7O0FBQ0E7O0FBRUEsb0MiLCJmaWxlIjoiZjU0YTg4ZmIzNzE1YmUxZWU1OTQud29ya2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gaWRlbnRpdHkgZnVuY3Rpb24gZm9yIGNhbGxpbmcgaGFybW9ueSBpbXBvcnRzIHdpdGggdGhlIGNvcnJlY3QgY29udGV4dFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5pID0gZnVuY3Rpb24odmFsdWUpIHsgcmV0dXJuIHZhbHVlOyB9O1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSA1KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBmNTRhODhmYjM3MTViZTFlZTU5NCIsImltcG9ydCB7IG1lc3NhZ2VyIH0gZnJvbSBcIi4vbWVzc2FnZXJcIjtcbmltcG9ydCB7IGZpcmViYXNlQ29uZmlnIH0gZnJvbSBcIi4uL2NvbW1vbi9maXJlYmFzZUNvbmZpZ1wiO1xuXG5zZWxmLmltcG9ydFNjcmlwdHMoXCJodHRwczovL3d3dy5nc3RhdGljLmNvbS9maXJlYmFzZWpzLzQuMC4wL2ZpcmViYXNlLmpzXCIpO1xuXG5zZWxmLmZpcmViYXNlLmluaXRpYWxpemVBcHAoZmlyZWJhc2VDb25maWcpO1xuY29uc3QgZmlyZWJhc2VBdXRoID0gZmlyZWJhc2UuYXV0aCgpO1xuXG5leHBvcnQgY29uc3QgbG9naW4gPSBhY2Nlc3NUb2tlbiA9PiB7XG4gIGNvbnN0IGNyZWRlbnRpYWwgPSBmaXJlYmFzZS5hdXRoLkZhY2Vib29rQXV0aFByb3ZpZGVyLmNyZWRlbnRpYWwoYWNjZXNzVG9rZW4pO1xuICBmaXJlYmFzZUF1dGhcbiAgICAuc2lnbkluV2l0aENyZWRlbnRpYWwoY3JlZGVudGlhbClcbiAgICAudGhlbihyZXN1bHQgPT5cbiAgICAgIG1lc3NhZ2VyLnBvc3QoeyB0eXBlOiBcIldPUktFUl9BVVRIX0xPR0lOX1NVQ0NFU1NcIiwgcGF5bG9hZDogcmVzdWx0IH0pXG4gICAgKVxuICAgIC5jYXRjaChlcnJvciA9PlxuICAgICAgbWVzc2FnZXIucG9zdCh7IHR5cGU6IFwiV09SS0VSX0FVVEhfTE9HSU5fRVJST1JcIiwgcGF5bG9hZDogZXJyb3IgfSlcbiAgICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGxvZ291dCA9ICgpID0+IGZpcmViYXNlQXV0aC5zaWduT3V0KCk7XG5cbmV4cG9ydCBjb25zdCBsaXN0ZW5Ub0F1dGhDaGFuZ2UgPSAoKSA9PlxuICBmaXJlYmFzZUF1dGgub25BdXRoU3RhdGVDaGFuZ2VkKHVzZXIgPT4ge1xuICAgIGlmICh1c2VyKSBtZXNzYWdlci5wb3N0KHsgdHlwZTogXCJXT1JLRVJfQVVUSF9MT0dHRURcIiwgcGF5bG9hZDogdXNlciB9KTtcbiAgICBlbHNlIG1lc3NhZ2VyLnBvc3QoeyB0eXBlOiBcIldPUktFUl9BVVRIX0FOT05ZTU9VU1wiIH0pO1xuICB9KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zbGF2ZS9maXJlYmFzZS5qcyIsImltcG9ydCB7IHdvcmtlck1lc3NhZ2VyIH0gZnJvbSBcIkB2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmXCI7XG5pbXBvcnQgeyBsb2dpbiwgbG9nb3V0IH0gZnJvbSBcIi4vZmlyZWJhc2VcIjtcblxuY29uc3Qgb25BY3Rpb24gPSBhY3Rpb24gPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBcIk1BSU5fQVVUSF9MT0dHRURcIjpcbiAgICAgIHJldHVybiBsb2dpbihhY3Rpb24ucGF5bG9hZCk7XG4gICAgY2FzZSBcIk1BSU5fQVVUSF9BTk9OWU1PVVNcIjpcbiAgICAgIHJldHVybiBsb2dvdXQoKTtcbiAgICBjYXNlIFwiTU9VU0VfUE9TSVRJT05cIjpcbiAgICAgIHJldHVybiBtZXNzYWdlci5wb3N0KFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogXCJGT0xMT1dFUlwiLFxuICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgIHg6IGFjdGlvbi5wYXlsb2FkLnggKyAxMCxcbiAgICAgICAgICAgIHk6IGFjdGlvbi5wYXlsb2FkLnkgKyAxMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGRlbGF5OiB7XG4gICAgICAgICAgICBpbmRleDogMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybjtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IG1lc3NhZ2VyID0gd29ya2VyTWVzc2FnZXIoeyBvbkFjdGlvbiB9KTtcbm1lc3NhZ2VyLnN0YXJ0UGluZygpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3NsYXZlL21lc3NhZ2VyLmpzIiwiaW1wb3J0IHsgc2VuZFRvV29ya2VyLCBzZW5kVG9NYWluIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGNvbnN0IG1haW5NZXNzYWdlciA9ICh7IHdvcmtlciwgb25BY3Rpb24sIGJlZm9yZVBpbmcsIGFmdGVyUGluZyB9KSA9PiB7XG4gIC8vIFNUQVRFXG4gIGNvbnN0IHMgPSB7XG4gICAgcGluZ2luZzogZmFsc2UsXG4gICAgaW5PcGVyYXRpb25zOiB7fSxcbiAgICBvdXRPcGVyYXRpb25zOiBbXSxcbiAgICBwaW5nQ291bnQ6IDBcbiAgfTtcblxuICAvLyBJTklUXG4gIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKG1FKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UobUUuZGF0YSk7XG4gICAgaWYgKCFtZXNzYWdlLnR5cGUgfHwgbWVzc2FnZS50eXBlICE9PSBcIlBNUkFGX1RPX01BSU5cIikgcmV0dXJuO1xuICAgIG1lc3NhZ2UucGF5bG9hZC5mb3JFYWNoKG9uT3BlcmF0aW9uKTtcbiAgICBpZiAobWVzc2FnZS5tZXRhICYmIG1lc3NhZ2UubWV0YS5waW5nQ29tbWFuZCA9PT0gXCJzdGFydFwiKSBzdGFydFBpbmcoKTtcbiAgICBpZiAobWVzc2FnZS5tZXRhICYmIG1lc3NhZ2UubWV0YS5waW5nQ29tbWFuZCA9PT0gXCJzdG9wXCIpIHN0b3BQaW5nKCk7XG4gIH0pO1xuXG4gIC8vIFBSSVZBVEVcbiAgY29uc3Qgb25PcGVyYXRpb24gPSBvcGVyYXRpb24gPT4ge1xuICAgIGlmICghcy5waW5naW5nKSByZXR1cm4gb25BY3Rpb24ob3BlcmF0aW9uLnBheWxvYWQpO1xuICAgIGlmICghb3BlcmF0aW9uLm1ldGEgfHwgIW9wZXJhdGlvbi5tZXRhLmRlbGF5KSB7XG4gICAgICBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0gPSBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0gfHwgW107XG4gICAgICByZXR1cm4gcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdLnB1c2gob3BlcmF0aW9uKTtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgb3BlcmF0aW9uLm1ldGEuZGVsYXkucGluZ0NvdW50ICYmXG4gICAgICBvcGVyYXRpb24ubWV0YS5kZWxheS5waW5nQ291bnQgPj0gcy5waW5nQ291bnRcbiAgICApIHtcbiAgICAgIHMuaW5PcGVyYXRpb25zW29wZXJhdGlvbi5tZXRhLmRlbGF5LnBpbmdDb3VudF0gPSBzLmluT3BlcmF0aW9uc1tcbiAgICAgICAgb3BlcmF0aW9uLm1ldGEuZGVsYXkucGluZ0NvdW50XG4gICAgICBdIHx8IFtdO1xuICAgICAgcmV0dXJuIHMuaW5PcGVyYXRpb25zW29wZXJhdGlvbi5tZXRhLmRlbGF5LnBpbmdDb3VudF0ucHVzaChvcGVyYXRpb24pO1xuICAgIH1cbiAgICBpZiAob3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXggJiYgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXggPj0gMCkge1xuICAgICAgcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnQgKyBvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleF0gPSBzLmluT3BlcmF0aW9uc1tcbiAgICAgICAgcy5waW5nQ291bnQgKyBvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleFxuICAgICAgXSB8fCBbXTtcbiAgICAgIHJldHVybiBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudCArIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmluZGV4XS5wdXNoKFxuICAgICAgICBvcGVyYXRpb25cbiAgICAgICk7XG4gICAgfVxuICB9O1xuICBjb25zdCBwcm9jZXNzSW5PcGVyYXRpb25zID0gKCkgPT4ge1xuICAgIGlmICghcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdKSByZXR1cm47XG4gICAgcy5pbk9wZXJhdGlvbnNbcy5waW5nQ291bnRdLmZvckVhY2gobyA9PiBvbkFjdGlvbihvLnBheWxvYWQpKTtcbiAgICBzLmluT3BlcmF0aW9uc1tzLnBpbmdDb3VudF0ubGVuZ3RoID0gMDtcbiAgfTtcbiAgY29uc3Qgc2VuZEFsbCA9IG1ldGEgPT4ge1xuICAgIHNlbmRUb1dvcmtlcih3b3JrZXIsIHtcbiAgICAgIHR5cGU6IFwiUE1SQUZfVE9fV09SS0VSXCIsXG4gICAgICBtZXRhLFxuICAgICAgcGF5bG9hZDogcy5vdXRPcGVyYXRpb25zXG4gICAgfSk7XG4gICAgcy5vdXRPcGVyYXRpb25zLmxlbmd0aCA9IDA7XG4gIH07XG4gIGNvbnN0IHBpbmcgPSAoKSA9PiB7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHJldHVybjtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGluZyk7XG4gICAgaWYgKGJlZm9yZVBpbmcpIGJlZm9yZVBpbmcocy5waW5nQ291bnQpO1xuICAgIHNlbmRBbGwoeyBwaW5nQ291bnQ6IHMucGluZ0NvdW50IH0pO1xuICAgIGlmIChhZnRlclBpbmcpIGFmdGVyUGluZyhzLnBpbmdDb3VudCArIDEpO1xuICAgIHByb2Nlc3NJbk9wZXJhdGlvbnMocy5waW5nQ291bnQpO1xuICAgIHMucGluZ0NvdW50Kys7XG4gIH07XG5cbiAgLy8gUFVCTElDXG4gIGNvbnN0IHBvc3QgPSBhY3Rpb24gPT4ge1xuICAgIHMub3V0T3BlcmF0aW9ucy5wdXNoKHsgcGF5bG9hZDogYWN0aW9uIH0pO1xuICAgIGlmICghcy5waW5naW5nKSBzZW5kQWxsKCk7XG4gIH07XG4gIGNvbnN0IHN0YXJ0UGluZyA9ICgpID0+IHtcbiAgICBzLnBpbmdpbmcgPSB0cnVlO1xuICAgIHMucGluZ0NvdW50ID0gMDtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGluZyk7XG4gIH07XG4gIGNvbnN0IHN0b3BQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IGZhbHNlO1xuICAgIHNlbmRBbGwoKTtcbiAgICBwcm9jZXNzSW5PcGVyYXRpb25zKCk7XG4gIH07XG4gIHJldHVybiB7IHBvc3QgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB3b3JrZXJNZXNzYWdlciA9ICh7IG9uQWN0aW9uLCBiZWZvcmVQb25nLCBhZnRlclBvbmcgfSkgPT4ge1xuICAvLyBTVEFURVxuICBjb25zdCBzID0ge1xuICAgIHBpbmdpbmc6IGZhbHNlLFxuICAgIG91dE9wZXJhdGlvbnM6IFtdXG4gIH07XG5cbiAgLy8gSU5JVFxuICBzZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UobUUpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5wYXJzZShtRS5kYXRhKTtcbiAgICBpZiAoIW1lc3NhZ2UudHlwZSB8fCBtZXNzYWdlLnR5cGUgIT09IFwiUE1SQUZfVE9fV09SS0VSXCIpIHJldHVybjtcbiAgICBpZiAobWVzc2FnZS5tZXRhICYmIHR5cGVvZiBtZXNzYWdlLm1ldGEucGluZ0NvdW50ICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcG9uZyhtZXNzYWdlLm1ldGEucGluZ0NvdW50KTtcbiAgICBtZXNzYWdlLnBheWxvYWQuZm9yRWFjaChvID0+IG9uQWN0aW9uKG8ucGF5bG9hZCkpO1xuICB9KTtcblxuICAvLyBQUklWQVRFXG4gIGNvbnN0IHNlbmRBbGwgPSBtZXRhID0+IHtcbiAgICBzZW5kVG9NYWluKHtcbiAgICAgIHR5cGU6IFwiUE1SQUZfVE9fTUFJTlwiLFxuICAgICAgbWV0YSxcbiAgICAgIHBheWxvYWQ6IHMub3V0T3BlcmF0aW9uc1xuICAgIH0pO1xuICAgIHMub3V0T3BlcmF0aW9ucy5sZW5ndGggPSAwO1xuICB9O1xuICBjb25zdCBwb25nID0gcGluZ0NvdW50ID0+IHtcbiAgICBpZiAoIXMucGluZ2luZykgcmV0dXJuO1xuICAgIGlmIChiZWZvcmVQb25nKSBiZWZvcmVQb25nKHBpbmdDb3VudCk7XG4gICAgc2VuZEFsbCh7IHBpbmdDb3VudCB9KTtcbiAgICBpZiAoYWZ0ZXJQb25nKSBhZnRlclBvbmcocGluZ0NvdW50ICsgMSk7XG4gIH07XG5cbiAgLy8gUFVCTElDXG4gIGNvbnN0IHBvc3QgPSAoYWN0aW9uLCBtZXRhKSA9PiB7XG4gICAgcy5vdXRPcGVyYXRpb25zLnB1c2goeyBwYXlsb2FkOiBhY3Rpb24sIG1ldGEgfSk7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHNlbmRBbGwoKTtcbiAgfTtcbiAgY29uc3Qgc3RhcnRQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IHRydWU7XG4gICAgc2VuZEFsbCh7IHBpbmdDb21tYW5kOiBcInN0YXJ0XCIgfSk7XG4gIH07XG4gIGNvbnN0IHN0b3BQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IGZhbHNlO1xuICAgIHNlbmRBbGwoeyBwaW5nQ29tbWFuZDogXCJzdG9wXCIgfSk7XG4gIH07XG4gIHJldHVybiB7XG4gICAgcG9zdCxcbiAgICBzdGFydFBpbmcsXG4gICAgc3RvcFBpbmdcbiAgfTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL2luZGV4LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydCBjb25zdCBzZW5kVG9Xb3JrZXIgPSAod29ya2VyLCBtZXNzYWdlKSA9PiB7XG4gIGNvbnN0IHN0cmluZ2VkID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gIHdvcmtlci5wb3N0TWVzc2FnZShzdHJpbmdlZCk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2VuZFRvTWFpbiA9IG1lc3NhZ2UgPT4ge1xuICBjb25zdCBzdHJpbmdlZCA9IEpTT04uc3RyaW5naWZ5KG1lc3NhZ2UpO1xuICBzZWxmLnBvc3RNZXNzYWdlKHN0cmluZ2VkKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL3V0aWxzLmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImV4cG9ydCBjb25zdCBmaXJlYmFzZUNvbmZpZyA9IHtcbiAgYXBpS2V5OiBcIkFJemFTeUNCSU1sQjVXbE9UdWZxVm8zdE13Y0pvQWJOVjc2QlZ3Y1wiLFxuICBhdXRoRG9tYWluOiBcInRlc3QtcHJvamVjdC00NDM0MS5maXJlYmFzZWFwcC5jb21cIixcbiAgZGF0YWJhc2VVUkw6IFwiaHR0cHM6Ly90ZXN0LXByb2plY3QtNDQzNDEuZmlyZWJhc2Vpby5jb21cIixcbiAgc3RvcmFnZUJ1Y2tldDogXCJ0ZXN0LXByb2plY3QtNDQzNDEuYXBwc3BvdC5jb21cIlxufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vZmlyZWJhc2VDb25maWcuanMiLCJpbXBvcnQgeyBtZXNzYWdlciB9IGZyb20gXCIuL21lc3NhZ2VyXCI7XG5pbXBvcnQgeyBsaXN0ZW5Ub0F1dGhDaGFuZ2UgfSBmcm9tIFwiLi9maXJlYmFzZVwiO1xuXG5saXN0ZW5Ub0F1dGhDaGFuZ2UoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zbGF2ZS9zbGF2ZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=