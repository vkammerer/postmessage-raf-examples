import { messager } from "./messager";

const mousePosition = {};

export const updateMousePositionStore = e => {
  mousePosition.x = e.clientX;
  mousePosition.y = e.clientY;
};

const savedMousePosition = {};

export const postMousePositionIfChanged = () => {
  if (
    mousePosition.x === savedMousePosition.x &&
    mousePosition.y === savedMousePosition.y
  )
    return;
  messager.post({
    type: "MOUSE_POSITION",
    payload: mousePosition
  });
  savedMousePosition.x = mousePosition.x;
  savedMousePosition.y = mousePosition.y;
};
