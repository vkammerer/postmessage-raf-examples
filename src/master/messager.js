import { mainMessager } from "@vkammerer/postmessage-raf";
import { slaveWorker } from "./slaveWorker";
import { applyLoggedUi, applyAnonymousUi } from "./ui";

const onAction = action => {
  console.log("master: action", action);
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

export const messager = mainMessager({ worker: slaveWorker, onAction });
