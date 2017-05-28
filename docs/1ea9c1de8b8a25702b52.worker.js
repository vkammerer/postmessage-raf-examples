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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.messager = undefined;

var _postmessageRaf = __webpack_require__(1);

var _firebase = __webpack_require__(2);

var onAction = function onAction(action) {
  console.log("slave: action", action);
  switch (action.type) {
    case "MAIN_AUTH_LOGGED":
      {
        return (0, _firebase.login)(action.payload);
      }
    case "MAIN_AUTH_ANONYMOUS":
      {
        return (0, _firebase.logout)();
      }
    default:
      {
        return;
      }
  }
};

var messager = exports.messager = (0, _postmessageRaf.workerMessager)({ onAction: onAction });

(0, _firebase.listenToAuthChange)();

/***/ }),
/* 1 */
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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenToAuthChange = exports.logout = exports.login = undefined;

var _slave = __webpack_require__(0);

var _firebaseConfig = __webpack_require__(4);

self.importScripts("https://www.gstatic.com/firebasejs/4.0.0/firebase.js");

self.firebase.initializeApp(_firebaseConfig.firebaseConfig);
var firebaseAuth = firebase.auth();

var login = exports.login = function login(accessToken) {
  var credential = firebase.auth.FacebookAuthProvider.credential(accessToken);
  firebaseAuth.signInWithCredential(credential).then(function (result) {
    return _slave.messager.post({ type: "WORKER_AUTH_LOGIN_SUCCESS", payload: result });
  }).catch(function (error) {
    return _slave.messager.post({ type: "WORKER_AUTH_LOGIN_ERROR", payload: error });
  });
};

var logout = exports.logout = function logout() {
  return firebaseAuth.signOut();
};

var listenToAuthChange = exports.listenToAuthChange = function listenToAuthChange() {
  return firebaseAuth.onAuthStateChanged(function (user) {
    if (user) _slave.messager.post({ type: "WORKER_AUTH_LOGGED", payload: user });else _slave.messager.post({ type: "WORKER_AUTH_ANONYMOUS" });
  });
};

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

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMWVhOWMxZGU4YjhhMjU3MDJiNTIiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NsYXZlL3NsYXZlLmpzIiwid2VicGFjazovLy8uL34vQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWYvc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9zbGF2ZS9maXJlYmFzZS5qcyIsIndlYnBhY2s6Ly8vLi9+L0B2a2FtbWVyZXIvcG9zdG1lc3NhZ2UtcmFmL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL2ZpcmViYXNlQ29uZmlnLmpzIl0sIm5hbWVzIjpbIm9uQWN0aW9uIiwiY29uc29sZSIsImxvZyIsImFjdGlvbiIsInR5cGUiLCJwYXlsb2FkIiwibWVzc2FnZXIiLCJzZWxmIiwiaW1wb3J0U2NyaXB0cyIsImZpcmViYXNlIiwiaW5pdGlhbGl6ZUFwcCIsImZpcmViYXNlQXV0aCIsImF1dGgiLCJsb2dpbiIsImNyZWRlbnRpYWwiLCJGYWNlYm9va0F1dGhQcm92aWRlciIsImFjY2Vzc1Rva2VuIiwic2lnbkluV2l0aENyZWRlbnRpYWwiLCJ0aGVuIiwicG9zdCIsInJlc3VsdCIsImNhdGNoIiwiZXJyb3IiLCJsb2dvdXQiLCJzaWduT3V0IiwibGlzdGVuVG9BdXRoQ2hhbmdlIiwib25BdXRoU3RhdGVDaGFuZ2VkIiwidXNlciIsImZpcmViYXNlQ29uZmlnIiwiYXBpS2V5IiwiYXV0aERvbWFpbiIsImRhdGFiYXNlVVJMIiwic3RvcmFnZUJ1Y2tldCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7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QTVDLEVBQWQsQ0FESztBQUFBLEdBTFQ7QUFRRCxDQVZNOztBQVlBLElBQU1DLDBCQUFTLFNBQVRBLE1BQVM7QUFBQSxTQUFNWixhQUFhYSxPQUFiLEVBQU47QUFBQSxDQUFmOztBQUVBLElBQU1DLGtEQUFxQixTQUFyQkEsa0JBQXFCO0FBQUEsU0FDaENkLGFBQWFlLGtCQUFiLENBQWdDLGdCQUFRO0FBQ3RDLFFBQUlDLElBQUosRUFBVSxnQkFBU1IsSUFBVCxDQUFjLEVBQUVmLE1BQU0sb0JBQVIsRUFBOEJDLFNBQVNzQixJQUF2QyxFQUFkLEVBQVYsS0FDSyxnQkFBU1IsSUFBVCxDQUFjLEVBQUVmLE1BQU0sdUJBQVIsRUFBZDtBQUNOLEdBSEQsQ0FEZ0M7QUFBQSxDQUEzQixDOzs7Ozs7O0FDdEJQO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7QUNSTyxJQUFNd0IsMENBQWlCO0FBQzVCQyxVQUFRLHlDQURvQjtBQUU1QkMsY0FBWSxvQ0FGZ0I7QUFHNUJDLGVBQWEsMkNBSGU7QUFJNUJDLGlCQUFlO0FBSmEsQ0FBdkIsQyIsImZpbGUiOiIxZWE5YzFkZThiOGEyNTcwMmI1Mi53b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDFlYTljMWRlOGI4YTI1NzAyYjUyIiwiaW1wb3J0IHsgd29ya2VyTWVzc2FnZXIgfSBmcm9tIFwiQHZrYW1tZXJlci9wb3N0bWVzc2FnZS1yYWZcIjtcbmltcG9ydCB7IGxvZ2luLCBsb2dvdXQsIGxpc3RlblRvQXV0aENoYW5nZSB9IGZyb20gXCIuL2ZpcmViYXNlXCI7XG5cbmNvbnN0IG9uQWN0aW9uID0gYWN0aW9uID0+IHtcbiAgY29uc29sZS5sb2coXCJzbGF2ZTogYWN0aW9uXCIsIGFjdGlvbik7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlIFwiTUFJTl9BVVRIX0xPR0dFRFwiOiB7XG4gICAgICByZXR1cm4gbG9naW4oYWN0aW9uLnBheWxvYWQpO1xuICAgIH1cbiAgICBjYXNlIFwiTUFJTl9BVVRIX0FOT05ZTU9VU1wiOiB7XG4gICAgICByZXR1cm4gbG9nb3V0KCk7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBtZXNzYWdlciA9IHdvcmtlck1lc3NhZ2VyKHsgb25BY3Rpb24gfSk7XG5cbmxpc3RlblRvQXV0aENoYW5nZSgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3NsYXZlL3NsYXZlLmpzIiwiaW1wb3J0IHsgc2VuZFRvV29ya2VyLCBzZW5kVG9NYWluIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuZXhwb3J0IGNvbnN0IG1haW5NZXNzYWdlciA9ICh7IHdvcmtlciwgb25BY3Rpb24gfSkgPT4ge1xuICAvLyBTVEFURVxuICBjb25zdCBzID0ge1xuICAgIHBpbmdpbmc6IGZhbHNlLFxuICAgIGluT3BlcmF0aW9uczoge30sXG4gICAgb3V0T3BlcmF0aW9uczogW10sXG4gICAgY291bnQ6IDBcbiAgfTtcbiAgd2luZG93Lm9wZXJhdGlvbnMgPSBzLm9wZXJhdGlvbnM7XG5cbiAgLy8gSU5JVFxuICB3b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gaGFuZGxlTWVzc2FnZShtRSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKG1FLmRhdGEpO1xuICAgIGlmICghbWVzc2FnZS50eXBlIHx8IG1lc3NhZ2UudHlwZSAhPT0gXCJQTVJBRl9UT19NQUlOXCIpIHJldHVybjtcbiAgICBtZXNzYWdlLnBheWxvYWQuZm9yRWFjaChvbk9wZXJhdGlvbik7XG4gICAgaWYgKG1lc3NhZ2UubWV0YS5waW5nUmVxdWVzdCA9PT0gXCJzdGFydFwiKSBzdGFydFBpbmcoKTtcbiAgICBpZiAobWVzc2FnZS5tZXRhLnBpbmdSZXF1ZXN0ID09PSBcInN0b3BcIikgc3RvcFBpbmcoKTtcbiAgfSk7XG5cbiAgLy8gUFJJVkFURVxuICBjb25zdCBvbk9wZXJhdGlvbiA9IG9wZXJhdGlvbiA9PiB7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHJldHVybiBvbkFjdGlvbihvcGVyYXRpb24ucGF5bG9hZCk7XG4gICAgaWYgKCFvcGVyYXRpb24ubWV0YSB8fCAhb3BlcmF0aW9uLm1ldGEuZGVsYXkpIHtcbiAgICAgIHMuaW5PcGVyYXRpb25zW3MuY291bnRdID0gcy5pbk9wZXJhdGlvbnNbcy5jb3VudF0gfHwgW107XG4gICAgICByZXR1cm4gcy5pbk9wZXJhdGlvbnNbcy5jb3VudF0ucHVzaChvcGVyYXRpb24pO1xuICAgIH1cbiAgICBpZiAob3BlcmF0aW9uLm1ldGEuZGVsYXkuY291bnQgJiYgb3BlcmF0aW9uLm1ldGEuZGVsYXkuY291bnQgPj0gcy5jb3VudCkge1xuICAgICAgcy5pbk9wZXJhdGlvbnNbb3BlcmF0aW9uLm1ldGEuZGVsYXkuY291bnRdID0gcy5pbk9wZXJhdGlvbnNbXG4gICAgICAgIG9wZXJhdGlvbi5tZXRhLmRlbGF5LmNvdW50XG4gICAgICBdIHx8IFtdO1xuICAgICAgcmV0dXJuIHMuaW5PcGVyYXRpb25zW29wZXJhdGlvbi5tZXRhLmRlbGF5LmNvdW50XS5wdXNoKG9wZXJhdGlvbik7XG4gICAgfVxuICAgIGlmIChvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleCAmJiBvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleCA+PSAwKSB7XG4gICAgICBzLmluT3BlcmF0aW9uc1tzLmNvdW50ICsgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXhdID0gcy5pbk9wZXJhdGlvbnNbXG4gICAgICAgIHMuY291bnQgKyBvcGVyYXRpb24ubWV0YS5kZWxheS5pbmRleFxuICAgICAgXSB8fCBbXTtcbiAgICAgIHJldHVybiBzLmluT3BlcmF0aW9uc1tzLmNvdW50ICsgb3BlcmF0aW9uLm1ldGEuZGVsYXkuaW5kZXhdLnB1c2goXG4gICAgICAgIG9wZXJhdGlvblxuICAgICAgKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHByb2Nlc3NJbk9wZXJhdGlvbnMgPSAoKSA9PiB7XG4gICAgaWYgKCFzLmluT3BlcmF0aW9uc1tzLmNvdW50XSkgcmV0dXJuO1xuICAgIHMuaW5PcGVyYXRpb25zW3MuY291bnRdLmZvckVhY2gob3BlcmF0aW9uID0+IG9uQWN0aW9uKG9wZXJhdGlvbi5wYXlsb2FkKSk7XG4gICAgcy5pbk9wZXJhdGlvbnNbcy5jb3VudF0ubGVuZ3RoID0gMDtcbiAgfTtcbiAgY29uc3Qgc2VuZEFsbCA9ICh7IHBpbmdEYXRhIH0pID0+IHtcbiAgICBzZW5kVG9Xb3JrZXIod29ya2VyLCB7XG4gICAgICB0eXBlOiBcIlBNUkFGX1RPX1dPUktFUlwiLFxuICAgICAgbWV0YTogeyBwaW5nRGF0YSB9LFxuICAgICAgcGF5bG9hZDogcy5vdXRPcGVyYXRpb25zXG4gICAgfSk7XG4gICAgcy5vdXRPcGVyYXRpb25zLmxlbmd0aCA9IDA7XG4gIH07XG4gIGNvbnN0IHBpbmcgPSAoKSA9PiB7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHJldHVybjtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGluZyk7XG4gICAgc2VuZEFsbCh7IHBpbmdEYXRhOiB7IGNvdW50OiBzLmNvdW50IH0gfSk7XG4gICAgcHJvY2Vzc0luT3BlcmF0aW9ucygpO1xuICAgIHMuY291bnQrKztcbiAgfTtcblxuICAvLyBQVUJMSUNcbiAgY29uc3QgcG9zdCA9IGFjdGlvbiA9PiB7XG4gICAgcy5vdXRPcGVyYXRpb25zLnB1c2goeyBwYXlsb2FkOiBhY3Rpb24gfSk7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHNlbmRBbGwoe30pO1xuICB9O1xuICBjb25zdCBzdGFydFBpbmcgPSAoKSA9PiB7XG4gICAgcy5waW5naW5nID0gdHJ1ZTtcbiAgICBzLmNvdW50ID0gMDtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocGluZyk7XG4gIH07XG4gIGNvbnN0IHN0b3BQaW5nID0gKCkgPT4ge1xuICAgIHMucGluZ2luZyA9IGZhbHNlO1xuICAgIHNlbmRBbGwoe30pO1xuICAgIHByb2Nlc3NJbk9wZXJhdGlvbnMoKTtcbiAgfTtcbiAgcmV0dXJuIHsgcG9zdCB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHdvcmtlck1lc3NhZ2VyID0gKHsgb25BY3Rpb24sIG9uUG9uZyB9KSA9PiB7XG4gIC8vIFNUQVRFXG4gIGNvbnN0IHMgPSB7XG4gICAgcGluZ2luZzogZmFsc2UsXG4gICAgb3V0T3BlcmF0aW9uczogW11cbiAgfTtcbiAgc2VsZi5vcGVyYXRpb25zID0gcy5vcGVyYXRpb25zO1xuXG4gIC8vIElOSVRcbiAgc2VsZi5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbiBoYW5kbGVNZXNzYWdlKG1FKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UobUUuZGF0YSk7XG4gICAgaWYgKCFtZXNzYWdlLnR5cGUgfHwgbWVzc2FnZS50eXBlICE9PSBcIlBNUkFGX1RPX1dPUktFUlwiKSByZXR1cm47XG4gICAgaWYgKG1lc3NhZ2UubWV0YS5waW5nRGF0YSkgcG9uZyhtZXNzYWdlLm1ldGEucGluZ0RhdGEpO1xuICAgIG1lc3NhZ2UucGF5bG9hZC5mb3JFYWNoKG9uT3BlcmF0aW9uKTtcbiAgfSk7XG5cbiAgLy8gUFJJVkFURVxuICBjb25zdCBvbk9wZXJhdGlvbiA9IG9wZXJhdGlvbiA9PiBvbkFjdGlvbihvcGVyYXRpb24ucGF5bG9hZCk7XG4gIGNvbnN0IHNlbmRBbGwgPSAoeyBwaW5nUmVxdWVzdCwgcG9uZ0RhdGEgfSkgPT4ge1xuICAgIHNlbmRUb01haW4oe1xuICAgICAgdHlwZTogXCJQTVJBRl9UT19NQUlOXCIsXG4gICAgICBtZXRhOiB7IHBpbmdSZXF1ZXN0LCBwb25nRGF0YSB9LFxuICAgICAgcGF5bG9hZDogcy5vdXRPcGVyYXRpb25zXG4gICAgfSk7XG4gICAgcy5vdXRPcGVyYXRpb25zLmxlbmd0aCA9IDA7XG4gIH07XG4gIGNvbnN0IHBvbmcgPSBwaW5nRGF0YSA9PiB7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHJldHVybjtcbiAgICBzZW5kQWxsKHsgcG9uZ0RhdGE6IHBpbmdEYXRhIH0pO1xuICAgIGlmIChvblBvbmcpIG9uUG9uZyhwaW5nRGF0YSk7XG4gIH07XG5cbiAgLy8gUFVCTElDXG4gIGNvbnN0IHBvc3QgPSAoYWN0aW9uLCBtZXRhKSA9PiB7XG4gICAgcy5vdXRPcGVyYXRpb25zLnB1c2goeyBwYXlsb2FkOiBhY3Rpb24sIG1ldGEgfSk7XG4gICAgaWYgKCFzLnBpbmdpbmcpIHNlbmRBbGwoe30pO1xuICB9O1xuICBjb25zdCBzdGFydFBpbmcgPSAoKSA9PiB7XG4gICAgcy5waW5naW5nID0gdHJ1ZTtcbiAgICBzZW5kQWxsKHsgcGluZ1JlcXVlc3Q6IFwic3RhcnRcIiB9KTtcbiAgfTtcbiAgY29uc3Qgc3RvcFBpbmcgPSAoKSA9PiB7XG4gICAgcy5waW5naW5nID0gZmFsc2U7XG4gICAgc2VuZEFsbCh7IHBpbmdSZXF1ZXN0OiBcInN0b3BcIiB9KTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBwb3N0LFxuICAgIHN0YXJ0UGluZyxcbiAgICBzdG9wUGluZ1xuICB9O1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9AdmthbW1lcmVyL3Bvc3RtZXNzYWdlLXJhZi9zcmMvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHsgbWVzc2FnZXIgfSBmcm9tIFwiLi9zbGF2ZVwiO1xuaW1wb3J0IHsgZmlyZWJhc2VDb25maWcgfSBmcm9tIFwiLi4vY29tbW9uL2ZpcmViYXNlQ29uZmlnXCI7XG5cbnNlbGYuaW1wb3J0U2NyaXB0cyhcImh0dHBzOi8vd3d3LmdzdGF0aWMuY29tL2ZpcmViYXNlanMvNC4wLjAvZmlyZWJhc2UuanNcIik7XG5cbnNlbGYuZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZyk7XG5jb25zdCBmaXJlYmFzZUF1dGggPSBmaXJlYmFzZS5hdXRoKCk7XG5cbmV4cG9ydCBjb25zdCBsb2dpbiA9IGFjY2Vzc1Rva2VuID0+IHtcbiAgY29uc3QgY3JlZGVudGlhbCA9IGZpcmViYXNlLmF1dGguRmFjZWJvb2tBdXRoUHJvdmlkZXIuY3JlZGVudGlhbChhY2Nlc3NUb2tlbik7XG4gIGZpcmViYXNlQXV0aFxuICAgIC5zaWduSW5XaXRoQ3JlZGVudGlhbChjcmVkZW50aWFsKVxuICAgIC50aGVuKHJlc3VsdCA9PlxuICAgICAgbWVzc2FnZXIucG9zdCh7IHR5cGU6IFwiV09SS0VSX0FVVEhfTE9HSU5fU1VDQ0VTU1wiLCBwYXlsb2FkOiByZXN1bHQgfSlcbiAgICApXG4gICAgLmNhdGNoKGVycm9yID0+XG4gICAgICBtZXNzYWdlci5wb3N0KHsgdHlwZTogXCJXT1JLRVJfQVVUSF9MT0dJTl9FUlJPUlwiLCBwYXlsb2FkOiBlcnJvciB9KVxuICAgICk7XG59O1xuXG5leHBvcnQgY29uc3QgbG9nb3V0ID0gKCkgPT4gZmlyZWJhc2VBdXRoLnNpZ25PdXQoKTtcblxuZXhwb3J0IGNvbnN0IGxpc3RlblRvQXV0aENoYW5nZSA9ICgpID0+XG4gIGZpcmViYXNlQXV0aC5vbkF1dGhTdGF0ZUNoYW5nZWQodXNlciA9PiB7XG4gICAgaWYgKHVzZXIpIG1lc3NhZ2VyLnBvc3QoeyB0eXBlOiBcIldPUktFUl9BVVRIX0xPR0dFRFwiLCBwYXlsb2FkOiB1c2VyIH0pO1xuICAgIGVsc2UgbWVzc2FnZXIucG9zdCh7IHR5cGU6IFwiV09SS0VSX0FVVEhfQU5PTllNT1VTXCIgfSk7XG4gIH0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3NsYXZlL2ZpcmViYXNlLmpzIiwiZXhwb3J0IGNvbnN0IHNlbmRUb1dvcmtlciA9ICh3b3JrZXIsIG1lc3NhZ2UpID0+IHtcbiAgY29uc3Qgc3RyaW5nZWQgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgd29ya2VyLnBvc3RNZXNzYWdlKHN0cmluZ2VkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW5kVG9NYWluID0gbWVzc2FnZSA9PiB7XG4gIGNvbnN0IHN0cmluZ2VkID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gIHNlbGYucG9zdE1lc3NhZ2Uoc3RyaW5nZWQpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9AdmthbW1lcmVyL3Bvc3RtZXNzYWdlLXJhZi9zcmMvdXRpbHMuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZXhwb3J0IGNvbnN0IGZpcmViYXNlQ29uZmlnID0ge1xuICBhcGlLZXk6IFwiQUl6YVN5Q0JJTWxCNVdsT1R1ZnFWbzN0TXdjSm9BYk5WNzZCVndjXCIsXG4gIGF1dGhEb21haW46IFwidGVzdC1wcm9qZWN0LTQ0MzQxLmZpcmViYXNlYXBwLmNvbVwiLFxuICBkYXRhYmFzZVVSTDogXCJodHRwczovL3Rlc3QtcHJvamVjdC00NDM0MS5maXJlYmFzZWlvLmNvbVwiLFxuICBzdG9yYWdlQnVja2V0OiBcInRlc3QtcHJvamVjdC00NDM0MS5hcHBzcG90LmNvbVwiXG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbW1vbi9maXJlYmFzZUNvbmZpZy5qcyJdLCJzb3VyY2VSb290IjoiIn0=