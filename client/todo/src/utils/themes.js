export const setTheme = (mode) => {
  document.body.classList.remove("light-mode", "dark-mode");
  document.body.classList.add(mode);
  localStorage.setItem("theme", mode);
};

export const getTheme = () => localStorage.getItem("theme") || "dark";