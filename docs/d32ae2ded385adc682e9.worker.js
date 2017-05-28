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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
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

var _utils = __webpack_require__(2);

var _firebaseConfig = __webpack_require__(1);

self.importScripts("https://www.gstatic.com/firebasejs/4.0.0/firebase.js");

self.firebase.initializeApp(_firebaseConfig.firebaseConfig);

var firebaseAuth = firebase.auth();

var login = exports.login = function login(accessToken) {
  var credential = firebase.auth.FacebookAuthProvider.credential(accessToken);
  firebaseAuth.signInWithCredential(credential).then(function (result) {
    (0, _utils.sendToMain)({
      type: "WORKER_AUTH_SIGNIN_SUCCESS"
    });
  }).catch(function (error) {
    (0, _utils.sendToMain)({
      type: "WORKER_AUTH_SIGNIN_ERROR"
    });
  });
};

var logout = exports.logout = function logout() {
  return firebaseAuth.signOut();
};

var listenToAuthChange = exports.listenToAuthChange = function listenToAuthChange() {
  return firebaseAuth.onAuthStateChanged(function (user) {
    if (user) {
      (0, _utils.sendToMain)({
        type: "WORKER_AUTH_LOGGED"
      });
    } else {
      (0, _utils.sendToMain)({
        type: "WORKER_AUTH_ANONYMOUS"
      });
    }
  });
};

/***/ }),
/* 1 */
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
/* 2 */
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _firebase = __webpack_require__(0);

var onMessage = function onMessage(mE) {
  var data = JSON.parse(mE.data);
  console.log("from main: ", data);
  if (data && data.type) dispatch(data);
};

var dispatch = function dispatch(action) {
  switch (action.type) {
    case "MAIN_AUTH_LOGGED":
      {
        return (0, _firebase.login)(action.payload);
      }
    case "MAIN_AUTH_LOGOUT":
      {
        return (0, _firebase.logout)();
      }
    default:
      {
        return;
      }
  }
};

self.addEventListener("message", onMessage);
(0, _firebase.listenToAuthChange)();

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDMyYWUyZGVkMzg1YWRjNjgyZTkiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NsYXZlL2ZpcmViYXNlLmpzIiwid2VicGFjazovLy8uL3NyYy9jb21tb24vZmlyZWJhc2VDb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbW1vbi91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc2xhdmUvc2xhdmUuanMiXSwibmFtZXMiOlsic2VsZiIsImltcG9ydFNjcmlwdHMiLCJmaXJlYmFzZSIsImluaXRpYWxpemVBcHAiLCJmaXJlYmFzZUF1dGgiLCJhdXRoIiwibG9naW4iLCJjcmVkZW50aWFsIiwiRmFjZWJvb2tBdXRoUHJvdmlkZXIiLCJhY2Nlc3NUb2tlbiIsInNpZ25JbldpdGhDcmVkZW50aWFsIiwidGhlbiIsInR5cGUiLCJjYXRjaCIsImxvZ291dCIsInNpZ25PdXQiLCJsaXN0ZW5Ub0F1dGhDaGFuZ2UiLCJvbkF1dGhTdGF0ZUNoYW5nZWQiLCJ1c2VyIiwiZmlyZWJhc2VDb25maWciLCJhcGlLZXkiLCJhdXRoRG9tYWluIiwiZGF0YWJhc2VVUkwiLCJzdG9yYWdlQnVja2V0Iiwic2VuZFRvV29ya2VyIiwic3RyaW5nZWQiLCJKU09OIiwic3RyaW5naWZ5IiwibWVzc2FnZSIsIndvcmtlciIsInBvc3RNZXNzYWdlIiwic2VuZFRvTWFpbiIsIm9uTWVzc2FnZSIsImRhdGEiLCJwYXJzZSIsIm1FIiwiY29uc29sZSIsImxvZyIsImRpc3BhdGNoIiwiYWN0aW9uIiwicGF5bG9hZCIsImFkZEV2ZW50TGlzdGVuZXIiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDaEVBOztBQUNBOztBQUVBQSxLQUFLQyxhQUFMLENBQW1CLHNEQUFuQjs7QUFFQUQsS0FBS0UsUUFBTCxDQUFjQyxhQUFkOztBQUVBLElBQU1DLGVBQWVGLFNBQVNHLElBQVQsRUFBckI7O0FBRU8sSUFBTUMsd0JBQVEsU0FBUkEsS0FBUSxjQUFlO0FBQ2xDLE1BQU1DLGFBQWFMLFNBQVNHLElBQVQsQ0FBY0csb0JBQWQsQ0FBbUNELFVBQW5DLENBQThDRSxXQUE5QyxDQUFuQjtBQUNBTCxlQUNHTSxvQkFESCxDQUN3QkgsVUFEeEIsRUFFR0ksSUFGSCxDQUVRLGtCQUFVO0FBQ2QsMkJBQVc7QUFDVEMsWUFBTTtBQURHLEtBQVg7QUFHRCxHQU5ILEVBT0dDLEtBUEgsQ0FPUyxpQkFBUztBQUNkLDJCQUFXO0FBQ1RELFlBQU07QUFERyxLQUFYO0FBR0QsR0FYSDtBQVlELENBZE07O0FBZ0JBLElBQU1FLDBCQUFTLFNBQVRBLE1BQVM7QUFBQSxTQUFNVixhQUFhVyxPQUFiLEVBQU47QUFBQSxDQUFmOztBQUVBLElBQU1DLGtEQUFxQixTQUFyQkEsa0JBQXFCO0FBQUEsU0FDaENaLGFBQWFhLGtCQUFiLENBQWdDLGdCQUFRO0FBQ3RDLFFBQUlDLElBQUosRUFBVTtBQUNSLDZCQUFXO0FBQ1ROLGNBQU07QUFERyxPQUFYO0FBR0QsS0FKRCxNQUlPO0FBQ0wsNkJBQVc7QUFDVEEsY0FBTTtBQURHLE9BQVg7QUFHRDtBQUNGLEdBVkQsQ0FEZ0M7QUFBQSxDQUEzQixDOzs7Ozs7Ozs7Ozs7QUMzQkEsSUFBTU8sMENBQWlCO0FBQzVCQyxVQUFRLHlDQURvQjtBQUU1QkMsY0FBWSxvQ0FGZ0I7QUFHNUJDLGVBQWEsMkNBSGU7QUFJNUJDLGlCQUFlO0FBSmEsQ0FBdkIsQzs7Ozs7Ozs7Ozs7O0FDQUEsSUFBTUMsc0NBQWUsU0FBZkEsWUFBZTtBQUFBLFNBQVUsbUJBQVc7QUFDL0MsUUFBTUMsV0FBV0MsS0FBS0MsU0FBTCxDQUFlQyxPQUFmLENBQWpCO0FBQ0FDLFdBQU9DLFdBQVAsQ0FBbUJMLFFBQW5CO0FBQ0QsR0FIMkI7QUFBQSxDQUFyQjs7QUFLQSxJQUFNTSxrQ0FBYSxTQUFiQSxVQUFhLFVBQVc7QUFDbkMsTUFBTU4sV0FBV0MsS0FBS0MsU0FBTCxDQUFlQyxPQUFmLENBQWpCO0FBQ0E1QixPQUFLOEIsV0FBTCxDQUFpQkwsUUFBakI7QUFDRCxDQUhNLEM7Ozs7Ozs7OztBQ0xQOztBQUVBLElBQU1PLFlBQVksU0FBWkEsU0FBWSxLQUFNO0FBQ3RCLE1BQU1DLE9BQU9QLEtBQUtRLEtBQUwsQ0FBV0MsR0FBR0YsSUFBZCxDQUFiO0FBQ0FHLFVBQVFDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCSixJQUEzQjtBQUNBLE1BQUlBLFFBQVFBLEtBQUtyQixJQUFqQixFQUF1QjBCLFNBQVNMLElBQVQ7QUFDeEIsQ0FKRDs7QUFNQSxJQUFNSyxXQUFXLFNBQVhBLFFBQVcsU0FBVTtBQUN6QixVQUFRQyxPQUFPM0IsSUFBZjtBQUNFLFNBQUssa0JBQUw7QUFBeUI7QUFDdkIsZUFBTyxxQkFBTTJCLE9BQU9DLE9BQWIsQ0FBUDtBQUNEO0FBQ0QsU0FBSyxrQkFBTDtBQUF5QjtBQUN2QixlQUFPLHVCQUFQO0FBQ0Q7QUFDRDtBQUFTO0FBQ1A7QUFDRDtBQVRIO0FBV0QsQ0FaRDs7QUFjQXhDLEtBQUt5QyxnQkFBTCxDQUFzQixTQUF0QixFQUFpQ1QsU0FBakM7QUFDQSxvQyIsImZpbGUiOiJkMzJhZTJkZWQzODVhZGM2ODJlOS53b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDMpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGQzMmFlMmRlZDM4NWFkYzY4MmU5IiwiaW1wb3J0IHsgc2VuZFRvTWFpbiB9IGZyb20gXCIuLi9jb21tb24vdXRpbHMuanNcIjtcbmltcG9ydCB7IGZpcmViYXNlQ29uZmlnIH0gZnJvbSBcIi4uL2NvbW1vbi9maXJlYmFzZUNvbmZpZy5qc1wiO1xuXG5zZWxmLmltcG9ydFNjcmlwdHMoXCJodHRwczovL3d3dy5nc3RhdGljLmNvbS9maXJlYmFzZWpzLzQuMC4wL2ZpcmViYXNlLmpzXCIpO1xuXG5zZWxmLmZpcmViYXNlLmluaXRpYWxpemVBcHAoZmlyZWJhc2VDb25maWcpO1xuXG5jb25zdCBmaXJlYmFzZUF1dGggPSBmaXJlYmFzZS5hdXRoKCk7XG5cbmV4cG9ydCBjb25zdCBsb2dpbiA9IGFjY2Vzc1Rva2VuID0+IHtcbiAgY29uc3QgY3JlZGVudGlhbCA9IGZpcmViYXNlLmF1dGguRmFjZWJvb2tBdXRoUHJvdmlkZXIuY3JlZGVudGlhbChhY2Nlc3NUb2tlbik7XG4gIGZpcmViYXNlQXV0aFxuICAgIC5zaWduSW5XaXRoQ3JlZGVudGlhbChjcmVkZW50aWFsKVxuICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICBzZW5kVG9NYWluKHtcbiAgICAgICAgdHlwZTogXCJXT1JLRVJfQVVUSF9TSUdOSU5fU1VDQ0VTU1wiXG4gICAgICB9KTtcbiAgICB9KVxuICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICBzZW5kVG9NYWluKHtcbiAgICAgICAgdHlwZTogXCJXT1JLRVJfQVVUSF9TSUdOSU5fRVJST1JcIlxuICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgbG9nb3V0ID0gKCkgPT4gZmlyZWJhc2VBdXRoLnNpZ25PdXQoKTtcblxuZXhwb3J0IGNvbnN0IGxpc3RlblRvQXV0aENoYW5nZSA9ICgpID0+XG4gIGZpcmViYXNlQXV0aC5vbkF1dGhTdGF0ZUNoYW5nZWQodXNlciA9PiB7XG4gICAgaWYgKHVzZXIpIHtcbiAgICAgIHNlbmRUb01haW4oe1xuICAgICAgICB0eXBlOiBcIldPUktFUl9BVVRIX0xPR0dFRFwiXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VuZFRvTWFpbih7XG4gICAgICAgIHR5cGU6IFwiV09SS0VSX0FVVEhfQU5PTllNT1VTXCJcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc2xhdmUvZmlyZWJhc2UuanMiLCJleHBvcnQgY29uc3QgZmlyZWJhc2VDb25maWcgPSB7XG4gIGFwaUtleTogXCJBSXphU3lDQklNbEI1V2xPVHVmcVZvM3RNd2NKb0FiTlY3NkJWd2NcIixcbiAgYXV0aERvbWFpbjogXCJ0ZXN0LXByb2plY3QtNDQzNDEuZmlyZWJhc2VhcHAuY29tXCIsXG4gIGRhdGFiYXNlVVJMOiBcImh0dHBzOi8vdGVzdC1wcm9qZWN0LTQ0MzQxLmZpcmViYXNlaW8uY29tXCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwidGVzdC1wcm9qZWN0LTQ0MzQxLmFwcHNwb3QuY29tXCJcbn07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvY29tbW9uL2ZpcmViYXNlQ29uZmlnLmpzIiwiZXhwb3J0IGNvbnN0IHNlbmRUb1dvcmtlciA9IHdvcmtlciA9PiBtZXNzYWdlID0+IHtcbiAgY29uc3Qgc3RyaW5nZWQgPSBKU09OLnN0cmluZ2lmeShtZXNzYWdlKTtcbiAgd29ya2VyLnBvc3RNZXNzYWdlKHN0cmluZ2VkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW5kVG9NYWluID0gbWVzc2FnZSA9PiB7XG4gIGNvbnN0IHN0cmluZ2VkID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XG4gIHNlbGYucG9zdE1lc3NhZ2Uoc3RyaW5nZWQpO1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9jb21tb24vdXRpbHMuanMiLCJpbXBvcnQgeyBsb2dpbiwgbG9nb3V0LCBsaXN0ZW5Ub0F1dGhDaGFuZ2UgfSBmcm9tIFwiLi9maXJlYmFzZVwiO1xuXG5jb25zdCBvbk1lc3NhZ2UgPSBtRSA9PiB7XG4gIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG1FLmRhdGEpO1xuICBjb25zb2xlLmxvZyhcImZyb20gbWFpbjogXCIsIGRhdGEpO1xuICBpZiAoZGF0YSAmJiBkYXRhLnR5cGUpIGRpc3BhdGNoKGRhdGEpO1xufTtcblxuY29uc3QgZGlzcGF0Y2ggPSBhY3Rpb24gPT4ge1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSBcIk1BSU5fQVVUSF9MT0dHRURcIjoge1xuICAgICAgcmV0dXJuIGxvZ2luKGFjdGlvbi5wYXlsb2FkKTtcbiAgICB9XG4gICAgY2FzZSBcIk1BSU5fQVVUSF9MT0dPVVRcIjoge1xuICAgICAgcmV0dXJuIGxvZ291dCgpO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG59O1xuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uTWVzc2FnZSk7XG5saXN0ZW5Ub0F1dGhDaGFuZ2UoKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zbGF2ZS9zbGF2ZS5qcyJdLCJzb3VyY2VSb290IjoiIn0=