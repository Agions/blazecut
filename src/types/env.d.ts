/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_MODE: 'development' | 'production' | 'test';
  readonly VITE_APP_DEBUG: string;
  readonly VITE_OPENAI_API_BASE: string;
  readonly VITE_ANTHROPIC_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 