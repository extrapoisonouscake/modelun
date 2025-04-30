import Cookies from "js-cookie";
export const performForceLogOut = () => {
  Cookies.remove("session", {
    secure: true,
  });
  window.location.href = "/";
};
