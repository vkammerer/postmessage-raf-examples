import { sendToMain } from "../common/utils.js";
import { firebaseConfig } from "../common/firebaseConfig.js";

self.importScripts("https://www.gstatic.com/firebasejs/4.0.0/firebase.js");

self.firebase.initializeApp(firebaseConfig);

const firebaseAuth = firebase.auth();

export const login = accessToken => {
  const credential = firebase.auth.FacebookAuthProvider.credential(accessToken);
  firebaseAuth
    .signInWithCredential(credential)
    .then(result => {
      sendToMain({
        type: "WORKER_AUTH_SIGNIN_SUCCESS"
      });
    })
    .catch(error => {
      sendToMain({
        type: "WORKER_AUTH_SIGNIN_ERROR"
      });
    });
};

export const logout = () => firebaseAuth.signOut();

export const listenToAuthChange = () =>
  firebaseAuth.onAuthStateChanged(user => {
    if (user) {
      sendToMain({
        type: "WORKER_AUTH_LOGGED"
      });
    } else {
      sendToMain({
        type: "WORKER_AUTH_ANONYMOUS"
      });
    }
  });
