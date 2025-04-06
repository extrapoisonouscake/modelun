import Cookies from "js-cookie";
import { useEffect, useState } from "react";

const listeners = new Set<() => void>();

export function notifyAllCookiesListeners() {
  listeners.forEach((fn) => fn());
}

export function setCookie(
  name: string,
  value: string,
  options?: Cookies.CookieAttributes
) {
  Cookies.set(name, value, options);
  notifyAllCookiesListeners();
}

export function removeCookie(name: string, options?: Cookies.CookieAttributes) {
  Cookies.remove(name, options);
  notifyAllCookiesListeners();
}

export function useCookie(name: string) {
  const [value, setValue] = useState(() => Cookies.get(name));

  useEffect(() => {
    const update = () => {
      const newValue = Cookies.get(name);
      if (newValue !== value) {
        setValue(newValue);
      }
    };
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, [name, value]);

  return value;
}
