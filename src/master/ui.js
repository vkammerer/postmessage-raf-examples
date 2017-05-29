export const loginButton = document.querySelector("#loginButton");
export const logoutButton = document.querySelector("#logoutButton");
export const follower = document.querySelector("#follower");

export const applyLoggedUi = () => authContainer.classList.add("logged");
export const applyAnonymousUi = () => authContainer.classList.remove("logged");

export const applyFollowerUi = followerPosition => {
  follower.style.transform = `translateX(${followerPosition.x}px) translateY(${followerPosition.y}px)`;
};
