import { loginButton, logoutButton } from "./ui";
import { login, logout, listenToAuthChange } from "./firebase";

loginButton.addEventListener("click", login);
logoutButton.addEventListener("click", logout);

listenToAuthChange();
