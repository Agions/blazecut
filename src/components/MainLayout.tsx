import React, { useState } from 'react';
import { Layout, Menu, Button, Switch, Space } from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined,
  SettingOutlined,
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  PlaySquareOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Logo from '../assets/logo';
import '../styles/MainLayout.less';

const { Header, Sider, Content } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { setTheme, isDarkMode } = useTheme();
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  // 切换主题
  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };
  
  // 帮助菜单功能待实现
  // const helpMenu = (
  //   <Menu>
  //     <Menu.Item key="docs">文档中心</Menu.Item>
  //     <Menu.Item key="tutorials">视频教程</Menu.Item>
  //     <Menu.Item key="faq">常见问题</Menu.Item>
  //     <Menu.Divider />
  //     <Menu.Item key="feedback">意见反馈</Menu.Item>
  //   </Menu>
  // );

  function getMenuItems(): MenuItem[] {
    return [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: '首页',
      },
      {
        key: '/video-analysis',
        icon: <PlaySquareOutlined />,
        label: '视频分析',
      },
      {
        key: '/script-editor',
        icon: <FileTextOutlined />,
        label: '脚本编辑器',
      },
      {
        key: '/project-management',
        icon: <ProjectOutlined />,
        label: '项目管理',
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '设置',
        children: [
          {
            key: '/settings',
            icon: <SettingOutlined />,
            label: '基本设置',
          },
          {
            key: '/ai-settings',
            icon: <RobotOutlined />,
            label: 'AI设置',
          }
        ]
      }
    ];
  }

  return (
    <Layout className={`main-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="app-sidebar"
        width={256}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div className="app-logo">
          <Logo 
            width={32} 
            height={32}
            color={isDarkMode ? '#ff4d4f' : '#ff4d4f'}
            secondaryColor={isDarkMode ? '#1890ff' : '#1890ff'}
          />
          {!collapsed && <h1>BlazeCut</h1>}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
        >
          {getMenuItems().map((item) => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout 
        className="main-content"
        style={{
          marginLeft: collapsed ? 80 : 256,
          transition: 'all 0.2s'
        }}
      >
        <Header className="app-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ color: '#fff', fontSize: '16px', marginRight: 24 }}
          />
          
          <div style={{ flex: 1 }}></div>
          
          <Space size={16}>
            <Switch 
              checkedChildren={<BulbOutlined />}
              unCheckedChildren={<BulbOutlined />}
              checked={isDarkMode}
              onChange={toggleTheme}
            />
            
            <Button type="text" icon={<QuestionCircleOutlined />} style={{ color: '#fff' }} />
          </Space>
        </Header>
        <Content className="main-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 