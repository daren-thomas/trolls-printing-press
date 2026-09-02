declare module "*.typ" {
  const content: string;
  export default content;
}

declare module "*.lua" {
  const content: string;
  export default content;
}

declare module "*.wasm" {
  const content: Uint8Array;
  export default content;
}

declare module "*.otf" {
  const content: Uint8Array;
  export default content;
}

declare module "*.ttf" {
  const content: Uint8Array;
  export default content;
}

declare module "*?raw" {
  const content: string;
  export default content;
}
