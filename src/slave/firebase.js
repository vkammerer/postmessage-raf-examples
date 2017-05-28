import { messager } from "./slave";
import { firebaseConfig } from "../common/firebaseConfig";

self.importScripts("https://www.gstatic.com/firebasejs/4.0.0/firebase.js");

self.firebase.initializeApp(firebaseConfig);
const firebaseAuth = firebase.auth();

export const login = accessToken => {
  const credential = firebase.auth.FacebookAuthProvider.credential(accessToken);
  firebaseAuth
    .signInWithCredential(credential)
    .then(result =>
      messager.post({ type: "WORKER_AUTH_LOGIN_SUCCESS", payload: result })
    )
    .catch(error =>
      messager.post({ type: "WORKER_AUTH_LOGIN_ERROR", payload: error })
    );
};

export const logout = () => firebaseAuth.signOut();

export const listenToAuthChange = () =>
  firebaseAuth.onAuthStateChanged(user => {
    if (user) messager.post({ type: "WORKER_AUTH_LOGGED", payload: user });
    else messager.post({ type: "WORKER_AUTH_ANONYMOUS" });
  });
