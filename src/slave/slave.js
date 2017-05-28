import { login, logout, listenToAuthChange } from "./firebase";

const onMessage = mE => {
  const data = JSON.parse(mE.data);
  console.log("from main: ", data);
  if (data && data.type) dispatch(data);
};

const dispatch = action => {
  switch (action.type) {
    case "MAIN_AUTH_LOGGED": {
      return login(action.payload);
    }
    case "MAIN_AUTH_LOGOUT": {
      return logout();
    }
    default: {
      return;
    }
  }
};

self.addEventListener("message", onMessage);
listenToAuthChange();
