import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Button, Tooltip, Avatar, Typography, Dropdown, Badge, Space, theme } from 'antd';
import { 
  HomeOutlined, 
  VideoCameraOutlined, 
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined,
  FireOutlined,
  ScissorOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Layout.module.less';
import { useTheme } from '@/context/ThemeContext';

const { Sider, Content, Header } = AntLayout;
const { Title, Text } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * 应用整体布局组件
 * 提供响应式布局、侧边导航、顶部栏等功能
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<number>(3);
  const [browserWidth, setBrowserWidth] = useState(window.innerWidth);
  
  // 响应式折叠控制
  useEffect(() => {
    const handleResize = () => {
      setBrowserWidth(window.innerWidth);
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1200 && collapsed) {
        setCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);
  
  // 判断当前路径是否匹配
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // 导航菜单项
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/')
    },
    {
      key: '/project',
      icon: <VideoCameraOutlined />,
      label: '项目管理',
      onClick: () => navigate('/')
    },
    {
      key: '/editor',
      icon: <ScissorOutlined />,
      label: '视频剪辑',
      onClick: () => navigate('/editor')
    },
    {
      key: '/templates',
      icon: <AppstoreOutlined />,
      label: '模板中心',
      onClick: () => navigate('/templates')
    },
    {
      key: '/scripts',
      icon: <BookOutlined />,
      label: '脚本库',
      onClick: () => navigate('/scripts')
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    }
  ];

  // 处理折叠侧边栏
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // 用户下拉菜单
  const userMenu = {
    items: [
      {
        key: 'profile',
        label: '个人信息',
        icon: <UserOutlined />
      },
      {
        key: 'preferences',
        label: '偏好设置',
        icon: <SettingOutlined />
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: '退出登录',
        danger: true
      }
    ],
    onClick: (e: any) => {
      if (e.key === 'preferences') {
        navigate('/settings');
      } else if (e.key === 'logout') {
        // 实现登出逻辑
        console.log('用户登出');
      }
    }
  };
  
  // 通知菜单
  const notificationMenu = {
    items: [
      {
        key: '1',
        label: <div>
          <Text strong>视频处理完成</Text>
          <div><Text type="secondary">《夏日海滩》视频已处理完成</Text></div>
        </div>
      },
      {
        key: '2',
        label: <div>
          <Text strong>脚本生成完成</Text>
          <div><Text type="secondary">AI助手已完成脚本生成</Text></div>
        </div>
      },
      {
        key: '3',
        label: <div>
          <Text strong>系统通知</Text>
          <div><Text type="secondary">有新版本可用：v2.1.0</Text></div>
        </div>
      },
      {
        type: 'divider',
      },
      {
        key: 'all',
        label: <Text type="secondary">查看全部通知</Text>
      }
    ],
    onClick: (e: any) => {
      if (e.key === 'all') {
        navigate('/notifications');
      } else {
        // 标记通知为已读
        setNotifications(prev => prev - 1);
      }
    }
  };

  return (
    <AntLayout className={`${styles.layout} ${collapsed ? styles.siderCollapsed : ''}`}>
      <Sider 
        className={styles.sider} 
        theme="light"
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        breakpoint="lg"
      >
        <div className={styles.logo}>
          {!collapsed ? (
            <Space>
              <FireOutlined style={{ fontSize: '24px', color: '#FF5252' }} />
              <Title level={4} style={{ margin: 0 }}>BlazeCut</Title>
            </Space>
          ) : (
            <FireOutlined style={{ fontSize: '24px', color: '#FF5252' }} />
          )}
        </div>
        
        <Menu
          mode="inline"
          className={styles.menu}
          selectedKeys={[
            isActive('/') && !isActive('/project') && !isActive('/editor') ? '/' : 
            isActive('/project') ? '/project' :
            isActive('/templates') ? '/templates' :
            isActive('/editor') ? '/editor' :
            isActive('/scripts') ? '/scripts' :
            isActive('/settings') ? '/settings' : ''
          ]}
          items={menuItems}
        />
        
        <div className={styles.collapseButton}>
          <Tooltip title={collapsed ? '展开菜单' : '收起菜单'} placement="right">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
            />
          </Tooltip>
        </div>
      </Sider>
      
      <AntLayout>
        <Header className={styles.header}>
          <div className={styles.headerTitle}>
            {location.pathname === '/' && '欢迎使用 BlazeCut'}
            {location.pathname.startsWith('/project') && '项目管理'}
            {location.pathname.startsWith('/templates') && '模板中心'}
            {location.pathname.startsWith('/editor') && '视频剪辑工作台'}
            {location.pathname.startsWith('/scripts') && '脚本库'}
            {location.pathname.startsWith('/settings') && '系统设置'}
          </div>
          <div className={styles.headerControls}>
            <Tooltip title="帮助中心">
              <Button type="text" shape="circle" icon={<QuestionCircleOutlined />} />
            </Tooltip>
            
            <Dropdown menu={notificationMenu} trigger={['click']} placement="bottomRight" arrow>
              <Badge count={notifications} overflowCount={99} size="small">
                <Button type="text" shape="circle" icon={<BellOutlined />} />
              </Badge>
            </Dropdown>
            
            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']} arrow>
              <Button type="text" className={styles.userButton}>
                <Space>
                  <Avatar size="small" style={{ backgroundColor: '#1E88E5' }}>U</Avatar>
                  {browserWidth > 576 && <span>用户</span>}
                </Space>
              </Button>
            </Dropdown>
          </div>
        </Header>
        
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 