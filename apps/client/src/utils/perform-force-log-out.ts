import Cookies from "js-cookie";
export const performForceLogOut = () => {
  Cookies.remove("session");
  window.location.href = "/";
};
