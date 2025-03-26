import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space, Badge, Tooltip } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  FolderOutlined,
  SettingOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import { brandColors } from '../styles/theme';
import '../styles/MainLayout.less';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setTheme, isDarkMode } = useTheme();
  const [notifications] = useState<number>(2); // 模拟通知数量

  // 切换主题模式
  const handleToggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  // 监听窗口大小变化，在小屏幕上自动折叠侧边栏
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1200 && collapsed) {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [collapsed]);

  // 菜单项配置
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/video-analysis',
      icon: <PlayCircleOutlined />,
      label: '视频分析',
    },
    {
      key: '/script-editor',
      icon: <FileTextOutlined />,
      label: '解说编辑',
    },
    {
      key: '/projects',
      icon: <FolderOutlined />,
      label: '项目管理',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      children: [
        {
          key: '/settings',
          label: '常规设置',
        },
        {
          key: '/ai-settings',
          label: 'AI设置',
        },
        {
          key: '/ai-model-evaluation',
          label: '模型评估',
        },
      ],
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const userMenu = {
    items: [
      {
        key: '1',
        label: '个人中心',
        icon: <UserOutlined />
      },
      {
        key: '2',
        label: '退出登录',
        danger: true
      },
    ]
  };

  return (
    <Layout className="main-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme={isDarkMode ? 'dark' : 'light'}
        className={`sidebar ${isDarkMode ? 'sidebar-dark' : 'sidebar-light'}`}
        style={{
          boxShadow: isDarkMode ? '2px 0 8px rgba(0,0,0,0.3)' : '2px 0 8px rgba(0,0,0,0.1)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
          transition: 'all 0.3s'
        }}
      >
        <div className={`logo ${isDarkMode ? 'logo-dark' : 'logo-light'}`} style={{ 
          height: '64px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          borderBottom: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h1 style={{ 
            color: brandColors.primary, 
            margin: 0, 
            fontSize: collapsed ? '24px' : '20px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            letterSpacing: '0.5px',
            textShadow: isDarkMode ? '0 0 10px rgba(51, 102, 255, 0.5)' : 'none',
            transition: 'all 0.3s'
          }}>
            {!collapsed ? 'BlazeCut 燃剪' : 'BC'}
          </h1>
        </div>
        <Menu 
          theme={isDarkMode ? 'dark' : 'light'}
          mode="inline" 
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['settings']}
          defaultSelectedKeys={[location.pathname]}
          style={{ 
            borderRight: 0,
            padding: '8px 0'
          }}
          items={menuItems}
          onClick={handleMenuClick}
          className={`main-menu ${isDarkMode ? 'menu-dark' : 'menu-light'}`}
        />
      </Sider>
      <Layout className="site-layout" style={{ 
        marginLeft: collapsed ? 80 : 200, 
        transition: 'all 0.3s',
        background: isDarkMode ? '#121212' : '#f5f7fa' 
      }}>
        <Header className={`site-header ${isDarkMode ? 'header-dark' : 'header-light'}`} style={{ 
          padding: '0 16px', 
          background: isDarkMode ? '#1f1f1f' : '#fff', 
          boxShadow: isDarkMode ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 999,
          transition: 'all 0.3s'
        }}>
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 48,
                height: 48,
                color: isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)'
              }}
            />
            <span className="page-title">
              {location.pathname === '/' && '首页'}
              {location.pathname === '/video-analysis' && '视频分析'}
              {location.pathname === '/script-editor' && '解说编辑'}
              {location.pathname === '/projects' && '项目管理'}
              {location.pathname === '/settings' && '设置'}
              {location.pathname === '/ai-settings' && 'AI设置'}
              {location.pathname === '/ai-model-evaluation' && '模型评估'}
            </span>
          </div>
          
          <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
            <Space size={16}>
              <Tooltip title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}>
                <Button 
                  type="text" 
                  icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />} 
                  onClick={handleToggleTheme}
                  className="icon-button"
                />
              </Tooltip>
              
              <Tooltip title="通知中心">
                <Badge count={notifications} size="small" offset={[-2, 2]}>
                  <Button 
                    type="text" 
                    icon={<BellOutlined />} 
                    className="icon-button"
                  />
                </Badge>
              </Tooltip>

              <Dropdown menu={{ items: userMenu.items }} placement="bottomRight" arrow>
                <div className="user-dropdown">
                  <Avatar 
                    size={32} 
                    icon={<UserOutlined />} 
                    style={{ 
                      backgroundColor: brandColors.primary,
                      cursor: 'pointer'
                    }} 
                  />
                  <span className="username" style={{ marginLeft: 8, display: 'inline-block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>用户名</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className={`site-content ${isDarkMode ? 'content-dark' : 'content-light'}`} style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderRadius: '8px',
          boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
          minHeight: 280,
          overflow: 'auto',
          transition: 'all 0.3s'
        }}>
          <Outlet />
        </Content>
        
        <div className="site-footer" style={{ 
          textAlign: 'center', 
          color: isDarkMode ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
          padding: '16px',
          transition: 'all 0.3s'
        }}>
          BlazeCut 燃剪 ©{new Date().getFullYear()} 短视频AI解说脚本生成工具
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 