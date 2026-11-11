export const BASE_PATH = "/craggy";
export const SITE_BASE_PATH =
  process.env.NODE_ENV === "development" ? "" : BASE_PATH;

export function withBasePath(path: string) {
  return `${SITE_BASE_PATH}${path}`;
}
