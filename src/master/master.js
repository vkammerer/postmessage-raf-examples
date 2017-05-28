import { slaveWorker, sendToSlave } from "./slaveWorker";
import { login, logout, listenToAuthChange } from "./firebase";
import {
  loginButton,
  logoutButton,
  applyLoggedUi,
  applyAnonymousUi
} from "./ui";

const onMessage = mE => {
  const data = JSON.parse(mE.data);
  console.log("from worker: ", data);
  if (data && data.type) dispatch(data);
};

const dispatch = action => {
  switch (action.type) {
    case "WORKER_AUTH_LOGGED": {
      return applyLoggedUi();
    }
    case "WORKER_AUTH_ANONYMOUS": {
      return applyAnonymousUi();
    }
    default: {
      return;
    }
  }
};

loginButton.addEventListener("click", login);
logoutButton.addEventListener("click", () => {
  logout();
  sendToSlave({ type: "MAIN_AUTH_LOGOUT" });
});

slaveWorker.addEventListener("message", onMessage);
listenToAuthChange();
