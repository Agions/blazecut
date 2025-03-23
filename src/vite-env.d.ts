/// <reference types="vite/client" />

declare module '@tauri-apps/plugin-dialog' {
  /**
   * Open a file/directory selection dialog.
   * 
   * @param options Configuration for the dialog.
   * @returns A promise resolving to the selected path(s) or `null` if the user cancelled the dialog.
   */
  export function open(options?: {
    multiple?: boolean;
    directory?: boolean;
    defaultPath?: string;
    title?: string;
    filters?: Array<{
      name: string;
      extensions: string[];
    }>;
  }): Promise<string | string[] | null>;

  /**
   * Open a file/directory save dialog.
   * 
   * @param options Configuration for the dialog.
   * @returns A promise resolving to the selected path or `null` if the user cancelled the dialog.
   */
  export function save(options?: {
    defaultPath?: string;
    title?: string;
    filters?: Array<{
      name: string;
      extensions: string[];
    }>;
  }): Promise<string | null>;

  /**
   * Shows a message dialog with an optional title and buttons.
   */
  export function message(message: string, options?: {
    title?: string;
    kind?: 'info' | 'warning' | 'error';
  }): Promise<void>;

  /**
   * Shows a question dialog with a confirm and a cancel button.
   */
  export function confirm(message: string, options?: {
    title?: string;
    kind?: 'info' | 'warning' | 'error';
    okLabel?: string;
    cancelLabel?: string;
  }): Promise<boolean>;

  /**
   * Shows a dialog with a prompt for text input.
   */
  export function ask(message: string, options?: {
    title?: string;
    kind?: 'info' | 'warning' | 'error';
    defaultValue?: string;
  }): Promise<boolean>;
}

declare module '@tauri-apps/api/fs' {
  export function readTextFile(filePath: string): Promise<string>;
  export function writeTextFile(filePath: string, contents: string): Promise<void>;
  export function readBinaryFile(filePath: string): Promise<Uint8Array>;
  export function writeBinaryFile(filePath: string, contents: Uint8Array | ArrayBuffer): Promise<void>;
  export function createDir(dir: string, recursive?: boolean): Promise<void>;
  export function removeDir(dir: string, recursive?: boolean): Promise<void>;
  export function removeFile(filePath: string): Promise<void>;
  export function exists(path: string): Promise<boolean>;
}

declare module '@tauri-apps/api/shell' {
  export function open(path: string, openWith?: string): Promise<void>;
}

declare module '@tauri-apps/api/window' {
  export interface WindowManager {
    setTitle(title: string): Promise<void>;
    maximize(): Promise<void>;
    unmaximize(): Promise<void>;
    minimize(): Promise<void>;
    unminimize(): Promise<void>;
    close(): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
    isVisible(): Promise<boolean>;
    isMaximized(): Promise<boolean>;
    isMinimized(): Promise<boolean>;
    isFocused(): Promise<boolean>;
    center(): Promise<void>;
    requestUserAttention(): Promise<void>;
  }

  export function getCurrent(): WindowManager;
}

declare module '@tauri-apps/api/*';
