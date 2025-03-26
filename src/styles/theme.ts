// 全局主题配置
import { theme } from 'antd';

// 品牌颜色
export const brandColors = {
  primary: '#3366FF',
  secondary: '#6C8AFF',
  accent: '#FF6C71',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',
};

// 中性色
export const neutralColors = {
  title: 'rgba(0, 0, 0, 0.85)',
  primary: 'rgba(0, 0, 0, 0.75)',
  secondary: 'rgba(0, 0, 0, 0.45)',
  disabled: 'rgba(0, 0, 0, 0.25)',
  border: '#d9d9d9',
  divider: '#f0f0f0',
  background: '#f5f7fa',
  cardBackground: '#ffffff',
  tableHeader: '#fafafa',
};

// 暗色主题色
export const darkColors = {
  title: 'rgba(255, 255, 255, 0.85)',
  primary: 'rgba(255, 255, 255, 0.75)',
  secondary: 'rgba(255, 255, 255, 0.45)',
  disabled: 'rgba(255, 255, 255, 0.25)',
  border: '#424242',
  divider: '#303030',
  background: '#121212',
  cardBackground: '#1f1f1f',
  tableHeader: '#262626',
};

// 字体设置
export const typography = {
  fontFamily: "'PingFang SC', 'Helvetica Neue', Arial, sans-serif",
  fontSize: 14,
  fontSizeHeading1: 38,
  fontSizeHeading2: 30,
  fontSizeHeading3: 24,
  fontSizeHeading4: 20,
  fontSizeHeading5: 16,
};

// 圆角设置
export const borderRadius = {
  small: 2,
  medium: 4,
  large: 8,
  extraLarge: 16,
};

// 间距设置
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 阴影设置
export const shadows = {
  small: '0 2px 8px rgba(0, 0, 0, 0.08)',
  medium: '0 4px 12px rgba(0, 0, 0, 0.12)',
  large: '0 8px 16px rgba(0, 0, 0, 0.16)',
};

// 动画设置
export const animations = {
  short: '0.2s',
  medium: '0.3s',
  long: '0.5s',
};

// 创建Ant Design主题配置
export const getTheme = (isDarkMode: boolean) => {
  return {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: brandColors.primary,
      colorSuccess: brandColors.success,
      colorWarning: brandColors.warning,
      colorError: brandColors.error,
      colorInfo: brandColors.info,
      colorTextBase: isDarkMode ? darkColors.primary : neutralColors.primary,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      borderRadius: borderRadius.medium,
      colorBgBase: isDarkMode ? darkColors.background : neutralColors.background,
    },
    components: {
      Layout: {
        headerBg: isDarkMode ? darkColors.cardBackground : neutralColors.cardBackground,
        bodyBg: isDarkMode ? darkColors.background : neutralColors.background,
        siderBg: isDarkMode ? darkColors.cardBackground : neutralColors.cardBackground,
      },
      Card: {
        colorBgContainer: isDarkMode ? darkColors.cardBackground : neutralColors.cardBackground,
        boxShadow: shadows.small,
      },
      Button: {
        borderRadius: borderRadius.medium,
      },
      Input: {
        borderRadius: borderRadius.medium,
      },
      Select: {
        borderRadius: borderRadius.medium,
      },
      Table: {
        headerBg: isDarkMode ? darkColors.tableHeader : neutralColors.tableHeader,
        borderRadius: borderRadius.medium,
        boxShadow: shadows.small,
      },
      Menu: {
        itemSelectedBg: isDarkMode ? `${brandColors.primary}22` : `${brandColors.primary}10`,
      },
    },
  };
};
