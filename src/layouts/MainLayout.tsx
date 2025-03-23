import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  HomeOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  FolderOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

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

  const userMenu = (
    <Menu items={[
      {
        key: '1',
        label: '个人中心',
      },
      {
        key: '2',
        label: '退出登录',
      },
    ]} />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        className="sidebar"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <h1 style={{ margin: 0, color: token.colorPrimary, fontSize: collapsed ? 16 : 20 }}>
            {collapsed ? '燃剪' : '短剧燃剪'}
          </h1>
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 48, height: 48 }}
          />
          
          {/* <div style={{ display: 'flex', alignItems: 'center' }}>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Button 
                type="text" 
                icon={<UserOutlined />} 
                size="large" 
                style={{ marginLeft: 16 }}
              >
                用户
              </Button>
            </Dropdown>
          </div> */}
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: '#fff',
          borderRadius: 8,
          minHeight: 'calc(100vh - 112px)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 