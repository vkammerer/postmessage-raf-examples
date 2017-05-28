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
exports.sendToSlave = exports.slaveWorker = undefined;

var _utils = __webpack_require__(4);

var SlaveWorker = __webpack_require__(6);

var slaveWorker = exports.slaveWorker = new SlaveWorker();
var sendToSlave = exports.sendToSlave = (0, _utils.sendToWorker)(slaveWorker);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.listenToAuthChange = exports.logout = exports.login = undefined;

var _slaveWorker = __webpack_require__(0);

var _firebaseConfig = __webpack_require__(3);

window.firebase.initializeApp(_firebaseConfig.firebaseConfig);

var firebaseAuth = firebase.auth();

var login = exports.login = function login() {
  var firebaseFacebookProvider = new firebase.auth.FacebookAuthProvider();
  firebaseAuth.signInWithPopup(firebaseFacebookProvider).then(function (result) {
    var accessToken = result.credential.accessToken;
    window.localStorage.setItem("app_firebaseAccessToken", accessToken);
    (0, _slaveWorker.sendToSlave)({
      type: "MAIN_AUTH_SIGNIN_SUCCESS",
      payload: accessToken
    });
  }).catch(function (error) {
    window.localStorage.removeItem("app_firebaseAccessToken");
    (0, _slaveWorker.sendToSlave)({
      type: "MAIN_AUTH_SIGNIN_ERROR",
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
      (0, _slaveWorker.sendToSlave)({
        type: "MAIN_AUTH_LOGGED",
        payload: accessToken
      });
    } else {
      window.localStorage.removeItem("app_firebaseAccessToken");
      (0, _slaveWorker.sendToSlave)({
        type: "MAIN_AUTH_ANONYMOUS"
      });
    }
  });
};

/***/ }),
/* 2 */
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
/* 3 */
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var sendToWorker = exports.sendToWorker = function sendToWorker(worker) {
  return function (message) {
    var stringed = JSON.stringify(message);
    worker.postMessage(stringed);
  };
};

var sendToMain = exports.sendToMain = function sendToMain(message) {
  var stringed = JSON.stringify(message);
  self.postMessage(stringed);
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slaveWorker = __webpack_require__(0);

var _firebase = __webpack_require__(1);

var _ui = __webpack_require__(2);

var onMessage = function onMessage(mE) {
  var data = JSON.parse(mE.data);
  console.log("from worker: ", data);
  if (data && data.type) dispatch(data);
};

var dispatch = function dispatch(action) {
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

_ui.loginButton.addEventListener("click", _firebase.login);
_ui.logoutButton.addEventListener("click", function () {
  (0, _firebase.logout)();
  (0, _slaveWorker.sendToSlave)({ type: "MAIN_AUTH_LOGOUT" });
});

_slaveWorker.slaveWorker.addEventListener("message", onMessage);
(0, _firebase.listenToAuthChange)();

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = function() {
	return new Worker(__webpack_require__.p + "d32ae2ded385adc682e9.worker.js");
};

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgODE4MTI5OWEwMjhlNTY5NTk3ODYiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hc3Rlci9zbGF2ZVdvcmtlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbWFzdGVyL2ZpcmViYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9tYXN0ZXIvdWkuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbW1vbi9maXJlYmFzZUNvbmZpZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY29tbW9uL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9tYXN0ZXIvbWFzdGVyLmpzIiwid2VicGFjazovLy8uL3NyYy9zbGF2ZS9zbGF2ZS5qcyJdLCJuYW1lcyI6WyJTbGF2ZVdvcmtlciIsInJlcXVpcmUiLCJzbGF2ZVdvcmtlciIsInNlbmRUb1NsYXZlIiwid2luZG93IiwiZmlyZWJhc2UiLCJpbml0aWFsaXplQXBwIiwiZmlyZWJhc2VBdXRoIiwiYXV0aCIsImxvZ2luIiwiZmlyZWJhc2VGYWNlYm9va1Byb3ZpZGVyIiwiRmFjZWJvb2tBdXRoUHJvdmlkZXIiLCJzaWduSW5XaXRoUG9wdXAiLCJ0aGVuIiwicmVzdWx0IiwiYWNjZXNzVG9rZW4iLCJjcmVkZW50aWFsIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsInR5cGUiLCJwYXlsb2FkIiwiY2F0Y2giLCJlcnJvciIsInJlbW92ZUl0ZW0iLCJsb2dvdXQiLCJzaWduT3V0IiwibGlzdGVuVG9BdXRoQ2hhbmdlIiwib25BdXRoU3RhdGVDaGFuZ2VkIiwidXNlciIsImxvZ2luQnV0dG9uIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwibG9nb3V0QnV0dG9uIiwiYXBwbHlMb2dnZWRVaSIsImF1dGhDb250YWluZXIiLCJjbGFzc0xpc3QiLCJhZGQiLCJhcHBseUFub255bW91c1VpIiwicmVtb3ZlIiwiZmlyZWJhc2VDb25maWciLCJhcGlLZXkiLCJhdXRoRG9tYWluIiwiZGF0YWJhc2VVUkwiLCJzdG9yYWdlQnVja2V0Iiwic2VuZFRvV29ya2VyIiwic3RyaW5nZWQiLCJKU09OIiwic3RyaW5naWZ5IiwibWVzc2FnZSIsIndvcmtlciIsInBvc3RNZXNzYWdlIiwic2VuZFRvTWFpbiIsInNlbGYiLCJvbk1lc3NhZ2UiLCJkYXRhIiwicGFyc2UiLCJtRSIsImNvbnNvbGUiLCJsb2ciLCJkaXNwYXRjaCIsImFjdGlvbiIsImFkZEV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDaEVBOztBQUNBLElBQU1BLGNBQWMsbUJBQUFDLENBQVEsQ0FBUixDQUFwQjs7QUFFTyxJQUFNQyxvQ0FBYyxJQUFJRixXQUFKLEVBQXBCO0FBQ0EsSUFBTUcsb0NBQWMseUJBQWFELFdBQWIsQ0FBcEIsQzs7Ozs7Ozs7Ozs7Ozs7QUNKUDs7QUFDQTs7QUFFQUUsT0FBT0MsUUFBUCxDQUFnQkMsYUFBaEI7O0FBRUEsSUFBTUMsZUFBZUYsU0FBU0csSUFBVCxFQUFyQjs7QUFFTyxJQUFNQyx3QkFBUSxTQUFSQSxLQUFRLEdBQU07QUFDekIsTUFBTUMsMkJBQTJCLElBQUlMLFNBQVNHLElBQVQsQ0FBY0csb0JBQWxCLEVBQWpDO0FBQ0FKLGVBQ0dLLGVBREgsQ0FDbUJGLHdCQURuQixFQUVHRyxJ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Z0JBQVosQ0FBNkIsT0FBN0I7QUFDQSxpQkFBYUEsZ0JBQWIsQ0FBOEIsT0FBOUIsRUFBdUMsWUFBTTtBQUMzQztBQUNBLGdDQUFZLEVBQUUxQyxNQUFNLGtCQUFSLEVBQVo7QUFDRCxDQUhEOztBQUtBLHlCQUFZMEMsZ0JBQVosQ0FBNkIsU0FBN0IsRUFBd0NSLFNBQXhDO0FBQ0Esb0M7Ozs7OztBQ3BDQTtBQUNBO0FBQ0EsRSIsImZpbGUiOiJtYXN0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDUpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDgxODEyOTlhMDI4ZTU2OTU5Nzg2IiwiaW1wb3J0IHsgc2VuZFRvV29ya2VyIH0gZnJvbSBcIi4uL2NvbW1vbi91dGlsc1wiO1xuY29uc3QgU2xhdmVXb3JrZXIgPSByZXF1aXJlKFwid29ya2VyLWxvYWRlciEuLi9zbGF2ZS9zbGF2ZS5qc1wiKTtcblxuZXhwb3J0IGNvbnN0IHNsYXZlV29ya2VyID0gbmV3IFNsYXZlV29ya2VyKCk7XG5leHBvcnQgY29uc3Qgc2VuZFRvU2xhdmUgPSBzZW5kVG9Xb3JrZXIoc2xhdmVXb3JrZXIpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci9zbGF2ZVdvcmtlci5qcyIsImltcG9ydCB7IHNlbmRUb1NsYXZlIH0gZnJvbSBcIi4vc2xhdmVXb3JrZXJcIjtcbmltcG9ydCB7IGZpcmViYXNlQ29uZmlnIH0gZnJvbSBcIi4uL2NvbW1vbi9maXJlYmFzZUNvbmZpZ1wiO1xuXG53aW5kb3cuZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZyk7XG5cbmNvbnN0IGZpcmViYXNlQXV0aCA9IGZpcmViYXNlLmF1dGgoKTtcblxuZXhwb3J0IGNvbnN0IGxvZ2luID0gKCkgPT4ge1xuICBjb25zdCBmaXJlYmFzZUZhY2Vib29rUHJvdmlkZXIgPSBuZXcgZmlyZWJhc2UuYXV0aC5GYWNlYm9va0F1dGhQcm92aWRlcigpO1xuICBmaXJlYmFzZUF1dGhcbiAgICAuc2lnbkluV2l0aFBvcHVwKGZpcmViYXNlRmFjZWJvb2tQcm92aWRlcilcbiAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gcmVzdWx0LmNyZWRlbnRpYWwuYWNjZXNzVG9rZW47XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJhcHBfZmlyZWJhc2VBY2Nlc3NUb2tlblwiLCBhY2Nlc3NUb2tlbik7XG4gICAgICBzZW5kVG9TbGF2ZSh7XG4gICAgICAgIHR5cGU6IFwiTUFJTl9BVVRIX1NJR05JTl9TVUNDRVNTXCIsXG4gICAgICAgIHBheWxvYWQ6IGFjY2Vzc1Rva2VuXG4gICAgICB9KTtcbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiYXBwX2ZpcmViYXNlQWNjZXNzVG9rZW5cIik7XG4gICAgICBzZW5kVG9TbGF2ZSh7XG4gICAgICAgIHR5cGU6IFwiTUFJTl9BVVRIX1NJR05JTl9FUlJPUlwiLFxuICAgICAgICBlcnJvclxuICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgbG9nb3V0ID0gKCkgPT4gZmlyZWJhc2VBdXRoLnNpZ25PdXQoKTtcblxuZXhwb3J0IGNvbnN0IGxpc3RlblRvQXV0aENoYW5nZSA9ICgpID0+XG4gIGZpcmViYXNlQXV0aC5vbkF1dGhTdGF0ZUNoYW5nZWQodXNlciA9PiB7XG4gICAgaWYgKHVzZXIpIHtcbiAgICAgIGNvbnN0IGFjY2Vzc1Rva2VuID0gd2luZG93LmxvY2FsU3RvcmFnZVtcImFwcF9maXJlYmFzZUFjY2Vzc1Rva2VuXCJdO1xuICAgICAgc2VuZFRvU2xhdmUoe1xuICAgICAgICB0eXBlOiBcIk1BSU5fQVVUSF9MT0dHRURcIixcbiAgICAgICAgcGF5bG9hZDogYWNjZXNzVG9rZW5cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJhcHBfZmlyZWJhc2VBY2Nlc3NUb2tlblwiKTtcbiAgICAgIHNlbmRUb1NsYXZlKHtcbiAgICAgICAgdHlwZTogXCJNQUlOX0FVVEhfQU5PTllNT1VTXCJcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbWFzdGVyL2ZpcmViYXNlLmpzIiwiZXhwb3J0IGNvbnN0IGxvZ2luQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNsb2dpbkJ1dHRvblwiKTtcbmV4cG9ydCBjb25zdCBsb2dvdXRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2xvZ291dEJ1dHRvblwiKTtcblxuZXhwb3J0IGNvbnN0IGFwcGx5TG9nZ2VkVWkgPSAoKSA9PiBhdXRoQ29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJsb2dnZWRcIik7XG5leHBvcnQgY29uc3QgYXBwbHlBbm9ueW1vdXNVaSA9ICgpID0+IGF1dGhDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShcImxvZ2dlZFwiKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYXN0ZXIvdWkuanMiLCJleHBvcnQgY29uc3QgZmlyZWJhc2VDb25maWcgPSB7XG4gIGFwaUtleTogXCJBSXphU3lDQklNbEI1V2xPVHVmcVZvM3RNd2NKb0FiTlY3NkJWd2NcIixcbiAgYXV0aERvbWFpbjogXCJ0ZXN0LXByb2plY3QtNDQzNDEuZmlyZWJhc2VhcHAuY29tXCIsXG4gIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGVzdC1wcm9qZWN0LTQ0MzQxLmZpcmViYXNlaW8uY29tXCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwidGVzdC1wcm9qZWN0LTQ0MzQxLmFwcHNwb3QuY29tXCJcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tbW9uL2ZpcmViYXNlQ29uZmlnLmpzIiwiZXhwb3J0IGNvbnN0IHNlbmRUb1dvcmtlciA9IHdvcmtlciA9PiBtZXNzYWdlID0+IHtcbiAgY29uc3Qgc3RyaW5nZWQgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgd29ya2VyLnBvc3RNZXNzYWdlKHN0cmluZ2VkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW5kVG9NYWluID0gbWVzc2FnZSA9PiB7XG4gIGNvbnN0IHN0cmluZ2VkID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gIHNlbGYucG9zdE1lc3NhZ2Uoc3RyaW5nZWQpO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vdXRpbHMuanMiLCJpbXBvcnQgeyBzbGF2ZVdvcmtlciwgc2VuZFRvU2xhdmUgfSBmcm9tIFwiLi9zbGF2ZVdvcmtlclwiO1xuaW1wb3J0IHsgbG9naW4sIGxvZ291dCwgbGlzdGVuVG9BdXRoQ2hhbmdlIH0gZnJvbSBcIi4vZmlyZWJhc2VcIjtcbmltcG9ydCB7XG4gIGxvZ2luQnV0dG9uLFxuICBsb2dvdXRCdXR0b24sXG4gIGFwcGx5TG9nZ2VkVWksXG4gIGFwcGx5QW5vbnltb3VzVWlcbn0gZnJvbSBcIi4vdWlcIjtcblxuY29uc3Qgb25NZXNzYWdlID0gbUUgPT4ge1xuICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShtRS5kYXRhKTtcbiAgY29uc29sZS5sb2coXCJmcm9tIHdvcmtlcjogXCIsIGRhdGEpO1xuICBpZiAoZGF0YSAmJiBkYXRhLnR5cGUpIGRpc3BhdGNoKGRhdGEpO1xufTtcblxuY29uc3QgZGlzcGF0Y2ggPSBhY3Rpb24gPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBcIldPUktFUl9BVVRIX0xPR0dFRFwiOiB7XG4gICAgICByZXR1cm4gYXBwbHlMb2dnZWRVaSgpO1xuICAgIH1cbiAgICBjYXNlIFwiV09SS0VSX0FVVEhfQU5PTllNT1VTXCI6IHtcbiAgICAgIHJldHVybiBhcHBseUFub255bW91c1VpKCk7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbn07XG5cbmxvZ2luQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBsb2dpbik7XG5sb2dvdXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgbG9nb3V0KCk7XG4gIHNlbmRUb1NsYXZlKHsgdHlwZTogXCJNQUlOX0FVVEhfTE9HT1VUXCIgfSk7XG59KTtcblxuc2xhdmVXb3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgb25NZXNzYWdlKTtcbmxpc3RlblRvQXV0aENoYW5nZSgpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21hc3Rlci9tYXN0ZXIuanMiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gbmV3IFdvcmtlcihfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZDMyYWUyZGVkMzg1YWRjNjgyZTkud29ya2VyLmpzXCIpO1xufTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vd29ya2VyLWxvYWRlciEuL3NyYy9zbGF2ZS9zbGF2ZS5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9