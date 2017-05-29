import { mainMessager } from "@vkammerer/postmessage-raf";
import { slaveWorker } from "./slaveWorker";
import { applyLoggedUi, applyAnonymousUi, applyFollowerUi } from "./ui";

const onAction = action => {
  // console.log("master: action", action);
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

const mousePosition = {};

window.addEventListener("mousemove", e => {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
});

let sentMousePositionX;
let sentMousePositionY;

export const messager = mainMessager({
  worker: slaveWorker,
  onAction,
  beforePing: () => {
    if (
      mousePosition.x === sentMousePositionX ||
      mousePosition.y === sentMousePositionY
    )
      return;
    messager.post({
      type: "MOUSE_POSITION",
      payload: mousePosition
    });
    sentMousePositionX = mousePosition.x;
    sentMousePositionY = mousePosition.y;
  }
});
