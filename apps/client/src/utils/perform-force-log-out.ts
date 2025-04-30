import { DOMAIN_NAME } from "@/constants";
import Cookies from "js-cookie";
export const performForceLogOut = () => {
  Cookies.remove("session", {
    secure: true,
    path: "/",
    domain: `.${DOMAIN_NAME}`,
  });
  window.location.href = "/";
};
