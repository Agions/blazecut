import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Tooltip, Badge, Avatar } from 'antd';
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
} from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { useAppStore } from '@/store/app';
import NotificationCenter from '@/components/NotificationCenter';
import styles from './MainLayout.module.less';

const { Header, Sider, Content } = Layout;

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
      selectedKeys={[location.pathname]}
      defaultSelectedKeys={['/']}
      items={menuItems}
      onClick={({ key }) => {
        navigate(key);
        if (isMobile) {
          setMobileDrawerOpen(false);
        }
      }}
      style={{ 
        height: '100%', 
        borderRight: 0,
        backgroundColor: 'transparent'
      }}
    />
  );

  return (
    <Layout className={styles.layout}>
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
            />
          </Tooltip>
          
          {tauriSupported && (
            <Tooltip title="通知">
              <Badge count={notifications} size="small">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  onClick={() => setNotificationDrawerOpen(true)}
                />
              </Badge>
            </Tooltip>
          )}

          <Avatar
            style={{ cursor: 'pointer' }}
            icon={<UserOutlined />}
          />
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
            title="菜单"
            placement="left"
            onClose={() => setMobileDrawerOpen(false)}
            open={mobileDrawerOpen}
            bodyStyle={{ padding: 0 }}
            width={200}
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