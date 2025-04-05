import { SessionTokenPayload } from "@repo/api";
import jwt from "jsonwebtoken";
import { useMemo } from "react";
import { useCookies } from "react-cookie";

/**
 * Represents a logged-in user with their session information
 */
type LoggedInUser = {
  isLoggedIn: true;
  session: string;
  isChair: boolean;
  countryCode: string;
};

/**
 * Represents a logged-out user
 */
type LoggedOutUser = {
  isLoggedIn: false;
  session: undefined;
  isChair: boolean;
  countryCode: undefined;
};

/**
 * Custom hook to manage user authentication state
 * @param forceLoggedIn - If true, forces the hook to return a LoggedInUser type
 * @returns User state object with authentication information
 */
export function useUser<T extends boolean = false>(
  forceLoggedIn: T = false as T
): T extends true ? LoggedInUser : LoggedInUser | LoggedOutUser {
  const [{ session }] = useCookies(["session"]);
  const userState = useMemo(() => {
    let isChair = false;
    let countryCode: string | undefined;

    if (session) {
      try {
        const decoded = jwt.decode(session) as SessionTokenPayload | null;
        if (decoded) {
          isChair = decoded.isChair;
          countryCode = decoded.countryCode;
        }
      } catch (error) {
        console.error("Error decoding session token:", error);
      }
    }

    if (forceLoggedIn || session) {
      return {
        isLoggedIn: true,
        session: session || "",
        isChair,
        countryCode: countryCode || "",
      } as const;
    }

    return {
      isLoggedIn: false,
      session: undefined,
      isChair,
      countryCode: undefined,
    } as const;
  }, [session, forceLoggedIn]);

  return userState as T extends true
    ? LoggedInUser
    : LoggedInUser | LoggedOutUser;
}
