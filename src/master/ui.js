export const loginButton = document.querySelector("#loginButton");
export const logoutButton = document.querySelector("#logoutButton");

export const applyLoggedUi = () => authContainer.classList.add("logged");
export const applyAnonymousUi = () => authContainer.classList.remove("logged");
