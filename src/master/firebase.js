import { sendToSlave } from "./slaveWorker";
import { firebaseConfig } from "../common/firebaseConfig";

window.firebase.initializeApp(firebaseConfig);

const firebaseAuth = firebase.auth();

export const login = () => {
  const firebaseFacebookProvider = new firebase.auth.FacebookAuthProvider();
  firebaseAuth
    .signInWithPopup(firebaseFacebookProvider)
    .then(function(result) {
      const accessToken = result.credential.accessToken;
      window.localStorage.setItem("app_firebaseAccessToken", accessToken);
      sendToSlave({
        type: "MAIN_AUTH_SIGNIN_SUCCESS",
        payload: accessToken
      });
    })
    .catch(function(error) {
      window.localStorage.removeItem("app_firebaseAccessToken");
      sendToSlave({
        type: "MAIN_AUTH_SIGNIN_ERROR",
        error
      });
    });
};

export const logout = () => firebaseAuth.signOut();

export const listenToAuthChange = () =>
  firebaseAuth.onAuthStateChanged(user => {
    if (user) {
      const accessToken = window.localStorage["app_firebaseAccessToken"];
      sendToSlave({
        type: "MAIN_AUTH_LOGGED",
        payload: accessToken
      });
    } else {
      window.localStorage.removeItem("app_firebaseAccessToken");
      sendToSlave({
        type: "MAIN_AUTH_ANONYMOUS"
      });
    }
  });
