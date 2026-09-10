declare module "*.typ" {
  const content: string;
  export default content;
}

declare module "*.lua" {
  const content: string;
  export default content;
}

declare module "*?raw" {
  const content: string;
  export default content;
}

/** Brotli-compressed binary asset; decode with `inflate` before use. */
declare module "*?brotli" {
  const content: Uint8Array;
  export default content;
}
