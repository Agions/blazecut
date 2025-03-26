import { useContext } from 'react';
import ThemeContext from '../context/ThemeContext';

/**
 * 主题钩子，用于在组件中获取和控制应用主题
 * @returns 当前主题上下文，包含当前主题模式、设置主题方法和是否为暗色模式标志
 */
export const useTheme = () => useContext(ThemeContext);

export default useTheme;
