import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Divider, Space, Select, Form,  message } from 'antd';
import { 
  VideoCameraOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined, 
  RocketOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  RobotOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { AIModelType } from '@/types';
import ModelCard from '@/components/Home/ModelCard';
import styles from './Home.module.less';

const { Title, Paragraph, } = Typography;



// 大模型类型列表
const MODEL_TYPES: AIModelType[] = ['wenxin', 'qianwen', 'spark', 'chatglm', 'doubao', 'deepseek'];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setSelectedAIModel } = useStore();

  const totalProjects = projects.length;
  const totalScripts = projects.reduce((acc, project) => acc + project.scripts.length, 0);
  const totalDuration = projects.reduce((acc, project) => {
    if (project.analysis) {
      return acc + project.analysis.duration;
    }
    return acc;
  }, 0);

  const handleModelChange = (value: string) => {
    setSelectedAIModel(value as AIModelType);
  };

  // 显示API配置页面
  const goToApiSettings = () => {
    navigate('/settings', { state: { showKeyConfig: true } });
  };

  const features = [
    {
      icon: <ThunderboltOutlined style={{ fontSize: 36, color: '#1890ff' }} />,
      title: 'AI驱动脚本生成',
      description: '利用国产大模型技术，快速生成高质量的视频解说脚本'
    },
    {
      icon: <PlayCircleOutlined style={{ fontSize: 36, color: '#13c2c2' }} />,
      title: '视频智能分析',
      description: '智能分析视频内容，自动识别场景、主题和关键点'
    },
    {
      icon: <RocketOutlined style={{ fontSize: 36, color: '#722ed1' }} />,
      title: '一键导出',
      description: '支持多种格式导出，轻松集成到您的创作工作流程中'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <Title level={1}>🚀 BlazeCut</Title>
        <Paragraph className={styles.slogan}>
          智能大模型视频脚本生成工具 - 快速高效的视频创作助手
        </Paragraph>
        
        <Space size="large">
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/projects/new')}
            className={styles.actionButton}
          >
            创建新项目
          </Button>
          
          <Button 
            size="large" 
            icon={<PlayCircleOutlined />}
            onClick={() => navigate('/projects')}
            className={styles.actionButton}
          >
            查看项目
          </Button>
        </Space>
      </div>

      <Divider orientation="center">
        <Title level={3} style={{ margin: 0 }}>项目概览</Title>
      </Divider>

      <Row gutter={[24, 24]} className={styles.stats}>
        <Col xs={24} sm={8}>
          <Card hoverable className={styles.statsCard}>
            <Statistic
              title="项目总数"
              value={totalProjects}
              prefix={<VideoCameraOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable className={styles.statsCard}>
            <Statistic
              title="脚本总数"
              value={totalScripts}
              prefix={<FileTextOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card hoverable className={styles.statsCard}>
            <Statistic
              title="总时长"
              value={Math.round(totalDuration / 60)}
              suffix="分钟"
              prefix={<ClockCircleOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <div className={styles.features}>
        <Divider orientation="left">
          <Space>
            <RobotOutlined />
            <span>全面支持国内外大模型</span>
          </Space>
        </Divider>
        
        <div className={styles.modelConfigArea}>
          <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
            <Col xs={24} md={16}>
              <Paragraph className={styles.modelIntro}>
                支持文心一言、通义千问、讯飞星火、智谱清言、字节豆包和DeepSeek等多种国内外大语言模型，为您的视频内容提供专业解说脚本。点击下方任意模型卡片进行配置。
              </Paragraph>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Button 
                type="primary" 
                icon={<SettingOutlined />} 
                onClick={goToApiSettings}
                size="large"
                className={styles.configButton}
              >
                一键配置API密钥
              </Button>
            </Col>
          </Row>
        </div>
        
        <Row gutter={[16, 16]} className={styles.modelCards}>
          {MODEL_TYPES.map(modelType => (
            <Col key={modelType} xs={24} sm={12} md={8} lg={6} xl={4} xxl={4}>
              <ModelCard 
                modelType={modelType}
                onSelect={handleModelChange}
              />
            </Col>
          ))}
        </Row>
      </div>

      <Divider orientation="center">
        <Title level={3} style={{ margin: 0 }}>核心功能</Title>
      </Divider>

      <Row gutter={[24, 24]} className={styles.features}>
        {features.map((feature, index) => (
          <Col xs={24} md={8} key={index}>
            <Card hoverable className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <Title level={4} className={styles.featureTitle}>{feature.title}</Title>
              <Paragraph className={styles.featureDesc}>{feature.description}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <div className={styles.cta}>
        <Title level={3}>立即开始您的视频解说创作之旅</Title>
        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={() => navigate('/projects/new')}
            className={styles.ctaButton}
          >
            开始使用
          </Button>
          <Button
            size="large"
            icon={<SettingOutlined />}
            onClick={goToApiSettings}
            className={styles.secondaryButton}
          >
            配置模型
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Home; 