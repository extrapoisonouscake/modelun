export const performForceLogOut = () => {
  document.cookie =
    "session=; path=/; domain=.mun.gbrv.dev; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure";
};
