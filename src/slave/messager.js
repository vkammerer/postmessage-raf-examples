import { workerMessager } from "@vkammerer/postmessage-raf";
import { login, logout } from "./firebase";

const onAction = action => {
  switch (action.type) {
    case "MAIN_AUTH_LOGGED":
      return login(action.payload);
    case "MAIN_AUTH_ANONYMOUS":
      return logout();
    case "MOUSE_POSITION":
      return messager.post(
        {
          type: "FOLLOWER",
          payload: {
            x: action.payload.x + 10,
            y: action.payload.y + 10
          }
        },
        {
          delay: {
            index: 10
          }
        }
      );
    default:
      return;
  }
};

export const messager = workerMessager({ onAction });
messager.startPing();
