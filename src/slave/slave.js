import { workerMessager } from "@vkammerer/postmessage-raf";
import { login, logout, listenToAuthChange } from "./firebase";

const onAction = action => {
  console.log("slave: action", action);
  switch (action.type) {
    case "MAIN_AUTH_LOGGED": {
      return login(action.payload);
    }
    case "MAIN_AUTH_ANONYMOUS": {
      return logout();
    }
    default: {
      return;
    }
  }
};

export const messager = workerMessager({ onAction });

listenToAuthChange();
