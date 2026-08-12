// src/types/global.d.ts

// allow importing JSON and media
declare module "*.json" {
  const value: any;
  export default value;
}
declare module "*.svg" { const url: string; export default url; }
declare module "*.css";

// RAW loaders
declare module "*.css?raw" { const css: string; export default css; }
declare module "*?raw" { const content: string; export default content; }

// @loadable/component ships no bundled types and no @types package exists
declare module "@loadable/component";

interface Window {
  __ASSET_ORIGIN__?: string;
  __DYNAMIC_STYLE_IDS__?: Set<string>;
  __SSR_DATA__?: unknown;
}
