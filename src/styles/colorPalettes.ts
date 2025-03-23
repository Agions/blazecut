interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface ColorPalettes {
  [key: string]: ColorPalette;
}

const colorPalettes: ColorPalettes = {
  default: {
    primary: '#1890ff',
    primaryLight: '#40a9ff',
    primaryDark: '#096dd9',
    secondary: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2'
  },
  green: {
    primary: '#52c41a',
    primaryLight: '#73d13d',
    primaryDark: '#389e0d',
    secondary: '#13c2c2',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#1890ff'
  },
  purple: {
    primary: '#722ed1',
    primaryLight: '#9254de',
    primaryDark: '#531dab',
    secondary: '#eb2f96',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2'
  },
  orange: {
    primary: '#fa8c16',
    primaryLight: '#ffa940',
    primaryDark: '#d46b08',
    secondary: '#fa541c',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2'
  },
  red: {
    primary: '#f5222d',
    primaryLight: '#ff4d4f',
    primaryDark: '#cf1322',
    secondary: '#eb2f96',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#1890ff'
  }
};

export default colorPalettes; 