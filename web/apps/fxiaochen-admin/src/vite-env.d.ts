/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** api base url eg: http://localhost:8080 */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
