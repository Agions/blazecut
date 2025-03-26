import { useState, useEffect } from 'react';

/**
 * 使用媒体查询的Hook
 * @param query 媒体查询字符串
 * @returns 是否匹配查询
 */
function useMediaQuery(query: string): boolean {
  // 检查是否在浏览器环境中
  const getMatches = (): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  // 初始化状态
  const [matches, setMatches] = useState<boolean>(getMatches());

  // 处理媒体查询变化
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // 创建媒体查询对象
    const mediaQuery = window.matchMedia(query);
    
    // 更新状态
    const updateMatches = (): void => {
      setMatches(mediaQuery.matches);
    };

    // 监听变化
    mediaQuery.addEventListener('change', updateMatches);
    
    // 初始化
    updateMatches();
    
    // 清理
    return () => {
      mediaQuery.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

// 预定义的媒体查询，基于src/styles/variables.less中的断点
export const useIsXs = () => useMediaQuery('(max-width: 480px)');
export const useIsSm = () => useMediaQuery('(min-width: 481px) and (max-width: 576px)');
export const useIsMd = () => useMediaQuery('(min-width: 577px) and (max-width: 768px)');
export const useIsLg = () => useMediaQuery('(min-width: 769px) and (max-width: 992px)');
export const useIsXl = () => useMediaQuery('(min-width: 993px) and (max-width: 1200px)');
export const useIsXxl = () => useMediaQuery('(min-width: 1201px)');

// 移动设备
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
// 平板设备
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 992px)');
// 桌面设备
export const useIsDesktop = () => useMediaQuery('(min-width: 993px)');

export default useMediaQuery; 