import appConfig from "@/appConfig";

export async function proxyFetch(path: string, init?: RequestInit) {
  const base = (appConfig && appConfig.url) || `http://localhost:${process.env["PORT"] ?? 3000}`;
  const url = path.startsWith("http")
    ? path
    : `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  return fetch(url, init);
}

export default proxyFetch;
