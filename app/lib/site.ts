export const BASE_PATH = "/craggy";

export function withBasePath(path: string) {
  return `${BASE_PATH}${path}`;
}
