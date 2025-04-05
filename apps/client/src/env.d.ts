/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly TRPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
