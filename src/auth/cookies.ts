import Cookies from "js-cookie";

export function setCookie(name: string, value: string, days: number, options?: Partial<Cookies.CookieAttributes>) {
  const expires = days; // js-cookie accepts number of days
  Cookies.set(name, value, {
    expires,
    secure: true,
    sameSite: "Strict",
    path: "/",
    ...options,
  });
}

export function getCookie(name: string): string | undefined {
  return Cookies.get(name);
}

export function deleteCookie(name: string) {
  Cookies.remove(name, { path: "/" });
}
