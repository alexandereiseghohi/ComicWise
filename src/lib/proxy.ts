import { env } from "@/appConfig";

export async function proxyFetch(path: string, init?: RequestInit) {
  const base = env.AUTH_URL ?? env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${env.PORT ?? 3000}`;
  const url = path.startsWith("http")
    ? path
    : `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  return fetch(url, init);
}

export default proxyFetch;
