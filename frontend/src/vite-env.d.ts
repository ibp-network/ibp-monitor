/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare the global param, injected in vite.config.ts
declare let PACKAGE_VERSION: string;
