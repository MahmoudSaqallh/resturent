/** Narrows untrusted JSON (localStorage, request bodies) to a plain object. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
