import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Tooltip, Badge, Avatar, Dropdown, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuOutlined,
  BulbOutlined,
  BulbFilled,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/store/app';
import NotificationCenter from '@/components/NotificationCenter';
import styles from './MainLayout.module.less';

const { Header, Sider, Content } = Layout;

// 页脚组件
const Footer = () => (
  <div className={styles.footer}>
    <div className={styles.footerContent}>
      <div className={styles.footerLinks}>
        <a href="https://github.com/agions/blazecut" target="_blank" rel="noopener noreferrer">
          <GithubOutlined /> GitHub
        </a>
        <a href="/privacy" target="_blank">隐私政策</a>
        <a href="/terms" target="_blank">使用条款</a>
      </div>
      <div className={styles.copyright}>
        BlazeCut © {new Date().getFullYear()} Created by Agions
      </div>
    </div>
  </div>
);

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { notifications } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [tauriSupported, setTauriSupported] = useState(true);

  useEffect(() => {
    // 检查Tauri功能是否可用
    const checkTauriSupport = async () => {
      try {
        // 简单地检查是否可以导入Tauri API
        await import('@tauri-apps/api/app');
        setTauriSupported(true);
      } catch (error) {
        console.warn('Tauri功能不可用:', error);
        setTauriSupported(false);
      }
    };
    
    checkTauriSupport();
    
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && mobileDrawerOpen) {
        setMobileDrawerOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileDrawerOpen]);

  // 用户菜单选项
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        console.log('用户登出');
        // 登出逻辑
      },
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/projects',
      icon: <VideoCameraOutlined />,
      label: '项目',
    },
    {
      key: '/scripts',
      icon: <FileTextOutlined />,
      label: '脚本',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const renderMenu = () => (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname === '/' ? '/' : `/${location.pathname.split('/')[1]}`]}
      defaultSelectedKeys={['/']}
      items={menuItems}
      onClick={({ key }) => {
        navigate(key);
        if (isMobile) {
          setMobileDrawerOpen(false);
        }
      }}
      className={styles.mainMenu}
    />
  );

  return (
    <Layout className={`${styles.layout} ${isDarkMode ? 'dark' : ''}`}>
      <Header className={styles.header}>
        <div className={styles.headerLeft}>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileDrawerOpen(true)}
              className={styles.menuButton}
            />
          )}
          <div className={styles.logo} onClick={() => navigate('/')}>
            BlazeCut
          </div>
        </div>
        <div className={styles.headerRight}>
          <Tooltip title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}>
            <Button 
              type="text" 
              icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />} 
              onClick={toggleTheme}
              className={styles.iconButton}
            />
          </Tooltip>
          
          {tauriSupported && (
            <Tooltip title="通知">
              <Badge count={notifications} size="small" offset={[-2, 2]}>
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  onClick={() => setNotificationDrawerOpen(true)}
                  className={styles.iconButton}
                />
              </Badge>
            </Tooltip>
          )}

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <div className={styles.avatarContainer}>
              <Avatar
                size="default"
                icon={<UserOutlined />}
                className={styles.avatar}
              />
            </div>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        {!isMobile ? (
          <Sider 
            width={200} 
            className={styles.sider}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            theme={isDarkMode ? 'dark' : 'light'}
          >
            {renderMenu()}
          </Sider>
        ) : (
          <Drawer
            title={
              <div className={styles.drawerHeader}>
                <div className={styles.logo}>BlazeCut</div>
              </div>
            }
            placement="left"
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
            bodyStyle={{ padding: 0 }}
            width={240}
            className={styles.mobileDrawer}
            closeIcon={null}
          >
            {renderMenu()}
          </Drawer>
        )}
        <Layout>
          <Content 
            className={styles.content}
            style={{
              marginLeft: isMobile ? 0 : (collapsed ? 80 : 200)
            }}
          >
            <div className={styles.contentInner}>
              <Outlet />
            </div>
            <Footer />
          </Content>
        </Layout>
      </Layout>

      {tauriSupported && (
        <NotificationCenter
          open={notificationDrawerOpen}
          onClose={() => setNotificationDrawerOpen(false)}
        />
      )}
    </Layout>
  );
};

export default MainLayout; 