import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  HomeOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  FolderOutlined,
  SettingOutlined
} from '@ant-design/icons';
import './style.less';

interface PageNavProps {
  collapsed?: boolean;
}

const PageNav: React.FC<PageNavProps> = ({ collapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 确定当前选中的菜单项
  const selectedKey = location.pathname.split('/')[1] || 'home';
  
  // 菜单项点击处理
  const handleMenuClick = (e: { key: string }) => {
    navigate(`/${e.key === 'home' ? '' : e.key}`);
  };
  
  return (
    <div className="page-nav">
      <div className="logo">
        {!collapsed && <h1>短剧燃剪</h1>}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
        className="menu"
        theme="dark"
      >
        <Menu.Item key="home" icon={<HomeOutlined />}>
          首页
        </Menu.Item>
        <Menu.Item key="video-analysis" icon={<VideoCameraOutlined />}>
          视频分析
        </Menu.Item>
        <Menu.Item key="script-editor" icon={<SoundOutlined />}>
          解说编辑
        </Menu.Item>
        <Menu.Item key="projects" icon={<FolderOutlined />}>
          项目管理
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          设置
        </Menu.Item>
      </Menu>
      
      <div className="footer">
        {!collapsed && <span>v1.0.0</span>}
      </div>
    </div>
  );
};

export default PageNav; 