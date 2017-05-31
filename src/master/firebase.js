import { firebaseConfig } from "../common/firebaseConfig";
import { messager } from "./messager";

window.firebase.initializeApp(firebaseConfig);

const firebaseAuth = firebase.auth();

export const login = () => {
  const firebaseFacebookProvider = new firebase.auth.FacebookAuthProvider();
  firebaseAuth
    .signInWithPopup(firebaseFacebookProvider)
    .then(function(result) {
      const accessToken = result.credential.accessToken;
      window.localStorage.setItem("APP_firebaseAccessToken", accessToken);
      messager.post({
        type: "MAIN_AUTH_LOGIN_SUCCESS",
        payload: accessToken
      });
    })
    .catch(function(error) {
      window.localStorage.removeItem("APP_firebaseAccessToken");
      messager.post({
        type: "MAIN_AUTH_LOGIN_ERROR",
        error
      });
    });
};

export const logout = () => firebaseAuth.signOut();

export const listenToAuthChange = () =>
  firebaseAuth.onAuthStateChanged(user => {
    if (user) {
      const accessToken = window.localStorage["APP_firebaseAccessToken"];
      messager.post({
        type: "MAIN_AUTH_LOGGED",
        payload: accessToken
      });
    } else {
      window.localStorage.removeItem("APP_firebaseAccessToken");
      messager.post({ type: "MAIN_AUTH_ANONYMOUS" });
    }
  });
