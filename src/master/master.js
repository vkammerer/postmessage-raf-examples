import { loginButton, logoutButton } from "./ui";
import { updateMousePositionStore } from "./mouse";
import { login, logout, listenToAuthChange } from "./firebase";

loginButton.addEventListener("click", login);
logoutButton.addEventListener("click", logout);
window.addEventListener("mousemove", updateMousePositionStore);

listenToAuthChange();
