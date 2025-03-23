import React from 'react';
import { Typography, Card, Row, Col, Button, Space, Divider } from 'antd';
import { 
  PlayCircleOutlined, 
  FileTextOutlined, 
  RocketOutlined,
  ThunderboltOutlined,
  HighlightOutlined,
  VideoCameraOutlined,
  PlaySquareOutlined,
  RobotOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/logo';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();

  // 功能卡片数据
  const featureCards = [
    {
      title: '视频分析',
      icon: <PlaySquareOutlined style={{ fontSize: 24 }} />,
      description: '上传视频后自动分析场景、情感和关键点',
      path: '/video-analysis'
    },
    {
      title: 'AI解说生成',
      icon: <RobotOutlined style={{ fontSize: 24 }} />,
      description: '使用AI大模型生成高燃解说文案，支持多种风格调整',
      path: '/script-editor'
    },
    {
      title: '脚本编辑',
      icon: <FileTextOutlined style={{ fontSize: 24 }} />,
      description: '编辑和优化解说脚本，支持多格式导出',
      path: '/script-editor'
    },
    {
      title: '项目管理',
      icon: <ProjectOutlined style={{ fontSize: 24 }} />,
      description: '管理您的视频项目和解说文稿',
      path: '/project-management'
    }
  ];

  const benefits = [
    {
      title: '高效创作',
      icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#3366FF' }} />,
      description: '将视频剪辑时间缩短80%，从小时级到分钟级'
    },
    {
      title: '智能解说',
      icon: <HighlightOutlined style={{ fontSize: 24, color: '#3366FF' }} />,
      description: '自动生成专业解说文案，支持多种风格和语调'
    },
    {
      title: '视频分析',
      icon: <VideoCameraOutlined style={{ fontSize: 24, color: '#3366FF' }} />,
      description: '精准识别视频内容，捕捉每个关键瞬间'
    }
  ];

  return (
    <div className="home-container" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      {/* 欢迎区域 */}
      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 60 }}>
        <Col xs={24} lg={12}>
          <div style={{ paddingRight: 20 }}>
            <Title level={1} style={{ fontSize: 48, marginBottom: 16, color: '#1890ff' }}>
              BlazeCut
            </Title>
            <Title level={3} style={{ marginTop: 0, marginBottom: 24, fontWeight: 'normal' }}>
              AI智能视频解说生成器
            </Title>
            <Paragraph style={{ fontSize: 16, marginBottom: 32, lineHeight: 1.8 }}>
              通过AI智能分析视频内容，自动生成专业解说文案，提供剪映导出功能，
              帮助创作者快速完成高质量短视频制作，释放创作力。
            </Paragraph>
            <Space size="large">
              <Button 
                type="primary" 
                size="large" 
                icon={<RocketOutlined />}
                onClick={() => navigate('/video-analysis')}
                style={{ height: 48, borderRadius: 8, fontSize: 16 }}
              >
                立即开始
              </Button>
              <Button 
                size="large" 
                onClick={() => navigate('/project-management')}
                style={{ height: 48, borderRadius: 8, fontSize: 16 }}
              >
                查看项目
              </Button>
            </Space>
          </div>
        </Col>
        <Col xs={24} lg={12} style={{ display: 'flex', justifyContent: 'center' }}>
          <Logo width={320} height={320} />
        </Col>
      </Row>

      {/* 功能卡片区域 */}
      <Title level={3} style={{ textAlign: 'center', marginBottom: 40 }}>
        主要功能
      </Title>
      <Row gutter={[32, 32]}>
        {featureCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              hoverable 
              className="feature-card"
              onClick={() => navigate(card.path)}
              style={{ 
                height: 240, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                borderRadius: 12,
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ 
                fontSize: 40, 
                marginBottom: 20,
                color: '#1890ff',
                background: 'rgba(24, 144, 255, 0.1)',
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                {card.icon}
              </div>
              <Title level={4}>{card.title}</Title>
              <Paragraph>{card.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 优势介绍 */}
      <Divider style={{ margin: '80px 0 60px' }}>
        <Title level={3} style={{ margin: 0 }}>为什么选择BlazeCut</Title>
      </Divider>
      
      <Row gutter={[48, 48]} style={{ marginBottom: 80 }}>
        {benefits.map((benefit, index) => (
          <Col xs={24} md={8} key={index}>
            <Card 
              bordered={false} 
              style={{ 
                textAlign: 'center', 
                height: 220,
                background: 'rgba(24, 144, 255, 0.02)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 24
              }}
            >
              <div style={{ 
                marginBottom: 20,
                fontSize: 36,
                color: '#1890ff'  
              }}>
                {benefit.icon}
              </div>
              <Title level={4}>{benefit.title}</Title>
              <Paragraph>{benefit.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 版权信息 */}
      <div style={{ textAlign: 'center', marginTop: 60, color: '#999' }}>
        <p>© {new Date().getFullYear()} BlazeCut. 所有权利保留。</p>
      </div>
    </div>
  );
};

export default Home; 