// zustand类型定义
declare module 'zustand' {
  import { StateCreator } from 'zustand/vanilla';
  
  export declare function create<T>(stateCreator: StateCreator<T>): () => T;
  export declare function create<T>(): (stateCreator: StateCreator<T>) => () => T;
}

declare module 'zustand/middleware' {
  import { StateCreator } from 'zustand/vanilla';
  
  export interface PersistOptions<T> {
    name: string;
    storage?: Storage;
    partialize?: (state: T) => Partial<T>;
    version?: number;
    migrate?: (persistedState: any, version: number) => T | Promise<T>;
    merge?: (persistedState: any, currentState: T) => T;
    onRehydrateStorage?: (state: T) => ((state?: T, error?: Error) => void) | void;
  }
  
  export declare function persist<T>(
    stateCreator: StateCreator<T>,
    options: PersistOptions<T>
  ): StateCreator<T>;
  
  export declare function createJSONStorage(): () => {
    getItem: (name: string) => string | null | Promise<string | null>;
    setItem: (name: string, value: string) => void | Promise<void>;
    removeItem: (name: string) => void | Promise<void>;
  };
} 