import { mainMessager } from "@vkammerer/postmessage-raf";
import { slaveWorker } from "./slaveWorker";
import { postMousePositionIfChanged } from "./mouse";
import { applyLoggedUi, applyAnonymousUi, applyFollowerUi } from "./ui";

const onAction = action => {
  switch (action.type) {
    case "WORKER_AUTH_LOGGED":
      return applyLoggedUi();
    case "WORKER_AUTH_ANONYMOUS":
      return applyAnonymousUi();
    case "FOLLOWER":
      return applyFollowerUi(action.payload);
    default: {
      return;
    }
  }
};

export const messager = mainMessager({
  worker: slaveWorker,
  onAction,
  beforePing: () => postMousePositionIfChanged()
});
