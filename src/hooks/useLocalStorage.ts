import { useState, useEffect } from 'react';

/**
 * 使用localStorage存储和获取数据的Hook
 * @param key 存储键名
 * @param initialValue 初始值
 * @returns [storedValue, setValue] 存储的值和设置值的函数
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 获取初始值
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // 状态初始化，只在首次渲染时调用readValue
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 更新localStorage和状态的函数
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许值是一个函数，类似useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // 保存到React状态
      setStoredValue(valueToStore);
      
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // 触发自定义事件，以便其他组件可以监听变化
        window.dispatchEvent(new Event('local-storage-update'));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 监听其他组件对同一localStorage键的更改
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // 监听自定义事件
    window.addEventListener('local-storage-update', handleStorageChange);
    // 监听原生localStorage事件（处理其他标签页的变化）
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('local-storage-update', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return [storedValue, setValue];
}

export default useLocalStorage; 