import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, Button, Card, Row, Col, List, 
  Empty, Spin, Space, message, Modal, Statistic, Divider, Tag
} from 'antd';
import { 
  VideoCameraOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FireOutlined,
  PlayCircleOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  CameraOutlined,
  CloudOutlined,
  ToolOutlined,
  StarOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import styles from './Home.module.less';

const { Title, Paragraph, Text } = Typography;

// 定义项目接口
interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'processing' | 'completed';
  thumbnail?: string;
}

/**
 * 首页组件
 */
const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const { isDarkMode } = useTheme();
  
  // 获取当前时间
  const now = new Date();
  const hours = now.getHours();
  
  // 根据时间段生成问候语
  const getGreeting = () => {
    if (hours < 12) return '早上好';
    if (hours < 18) return '下午好';
    return '晚上好';
  };

  // 加载项目数据
  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      // 示例数据
      const mockProjects: Project[] = [
        {
          id: '1',
          name: '产品宣传视频',
          description: '公司新产品宣传短视频',
          createdAt: '2023-05-15T08:00:00.000Z',
          updatedAt: '2023-05-16T10:30:00.000Z',
          status: 'completed',
          thumbnail: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        },
        {
          id: '2',
          name: '社交媒体短视频',
          description: '抖音和小红书推广内容',
          createdAt: '2023-05-10T12:00:00.000Z',
          updatedAt: '2023-05-11T09:15:00.000Z',
          status: 'draft',
          thumbnail: 'https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png'
        },
        {
          id: '3',
          name: '教学视频系列',
          description: '软件使用教程系列视频',
          createdAt: '2023-05-05T15:45:00.000Z',
          updatedAt: '2023-05-08T14:20:00.000Z',
          status: 'processing',
          thumbnail: 'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg'
        }
      ];
      
      setProjects(mockProjects);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // 创建新项目
  const handleCreateProject = () => {
    navigate('/project/new');
  };
  
  // 查看项目
  const handleViewProject = (id: string) => {
    navigate(`/project/${id}`);
  };
  
  // 编辑项目
  const handleEditProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/project/edit/${id}`);
  };
  
  // 进入编辑器
  const handleOpenEditor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/editor/${id}`);
  };
  
  // 删除项目
  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除此项目吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setProjects(projects.filter(p => p.id !== id));
        message.success('项目已删除');
      }
    });
  };

  return (
    <div className={styles.container}>
      {/* 欢迎区 */}
      <Card 
        className={`${styles.hero} ${isDarkMode ? styles.darkCard : ''}`}
        bordered={false}
      >
        <div className={styles.heroContent}>
          <Title level={1} className={styles.title}>
            BlazeCut <span className={styles.highlight}>智能视频剪辑</span>
          </Title>
          <Paragraph className={styles.subtitle}>
            AI赋能的短视频创作工具，让视频制作更简单、更高效
          </Paragraph>
          <div className={styles.heroButtons}>
            <Button 
              type="primary" 
              size="large" 
              icon={<PlusOutlined />} 
              onClick={handleCreateProject}
              className={`${styles.primaryButton} ${styles.shineButton}`}
            >
              创建新项目
            </Button>
            <Button
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={() => navigate('/editor')}
              className={styles.secondaryButton}
            >
              进入工作台
            </Button>
          </div>
        </div>
      </Card>
      
      {/* 统计信息 */}
      <Row gutter={[24, 24]} className={styles.stats}>
        <Col xs={24} sm={8}>
          <Card className={`${styles.statsCard} ${isDarkMode ? styles.darkCard : ''}`}>
            <Statistic 
              title="项目总数" 
              value={projects.length} 
              prefix={<VideoCameraOutlined className={styles.statIcon} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={`${styles.statsCard} ${isDarkMode ? styles.darkCard : ''}`}>
            <Statistic 
              title="已完成项目" 
              value={projects.filter(p => p.status === 'completed').length} 
              prefix={<StarOutlined className={styles.statIcon} />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={`${styles.statsCard} ${isDarkMode ? styles.darkCard : ''}`}>
            <Statistic 
              title="处理中项目" 
              value={projects.filter(p => p.status === 'processing').length} 
              prefix={<FireOutlined className={styles.statIcon} />} 
            />
          </Card>
        </Col>
      </Row>
      
      {/* 项目列表 */}
      <Card 
        title={
          <div className={styles.sectionHeader}>
            <Text strong style={{ fontSize: 18 }}>
              <VideoCameraOutlined /> 我的项目
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateProject}
            >
              创建新项目
            </Button>
          </div>
        }
        className={`${styles.sectionCard} ${isDarkMode ? styles.darkCard : ''}`}
        bordered={false}
      >
        <Spin spinning={loading}>
          {projects.length === 0 ? (
            <Empty
              description="暂无项目，点击「创建新项目」开始使用"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateProject}
              >
                创建新项目
              </Button>
            </Empty>
          ) : (
            <List
              grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4 }}
              dataSource={projects}
              renderItem={(project) => (
                <List.Item>
                  <Card
                    className={`${styles.projectCard} ${isDarkMode ? styles.darkProjectCard : ''}`}
                    hoverable
                    onClick={() => handleViewProject(project.id)}
                    cover={
                      project.thumbnail && (
                        <div className={styles.projectThumbnail}>
                          <img alt={project.name} src={project.thumbnail} width={100} style={{width: 150, height:150}}/>
                        </div>
                      )
                    }
                    actions={[
                      <Button 
                        key="edit" 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={(e) => handleEditProject(project.id, e)}
                      />,
                      <Button 
                        key="scissors" 
                        type="text" 
                        icon={<VideoCameraOutlined />} 
                        onClick={(e) => handleOpenEditor(project.id, e)}
                      />,
                      <Button 
                        key="delete" 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={(e) => handleDeleteProject(project.id, e)}
                      />
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div className={styles.projectTitle}>
                          <span>{project.name}</span>
                          <Tag
                            color={
                              project.status === 'draft' ? 'blue' : 
                              project.status === 'processing' ? 'orange' : 'green'
                            }
                            className={styles.statusTag}
                          >
                            {project.status === 'draft' ? '草稿' : 
                             project.status === 'processing' ? '处理中' : '已完成'}
                          </Tag>
                        </div>
                      }
                      description={
                        <>
                          <Text ellipsis style={{ marginBottom: 8, display: 'block' }}>
                            {project.description}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            更新于: {formatDate(project.updatedAt)}
                          </Text>
                        </>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
      
      {/* 特性展示 */}
      <div className={styles.features}>
        <Title level={3} className={styles.sectionTitle}>
          <RocketOutlined /> 强大功能
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className={`${styles.featureCard} ${isDarkMode ? styles.darkCard : ''}`}
              bordered={false}
            >
              <div 
                className={styles.featureIcon} 
                style={{ color: '#1890ff', fontSize: 36 }}
              >
                <ThunderboltOutlined />
              </div>
              <Title level={4} className={styles.featureTitle}>智能分析</Title>
              <Paragraph className={styles.featureDesc}>
                基于AI技术分析视频内容，智能识别关键场景和情感变化
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className={`${styles.featureCard} ${isDarkMode ? styles.darkCard : ''}`}
              bordered={false}
            >
              <div 
                className={styles.featureIcon} 
                style={{ color: '#722ed1', fontSize: 36 }}
              >
                <CodeOutlined />
              </div>
              <Title level={4} className={styles.featureTitle}>脚本生成</Title>
              <Paragraph className={styles.featureDesc}>
                自动生成专业短视频脚本，支持多种风格和平台定制
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className={`${styles.featureCard} ${isDarkMode ? styles.darkCard : ''}`}
              bordered={false}
            >
              <div 
                className={styles.featureIcon} 
                style={{ color: '#13c2c2', fontSize: 36 }}
              >
                <CloudOutlined />
              </div>
              <Title level={4} className={styles.featureTitle}>一键剪辑</Title>
              <Paragraph className={styles.featureDesc}>
                根据脚本一键生成精美短视频，无需复杂操作
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card 
              className={`${styles.featureCard} ${isDarkMode ? styles.darkCard : ''}`}
              bordered={false}
            >
              <div 
                className={styles.featureIcon} 
                style={{ color: '#fa8c16', fontSize: 36 }}
              >
                <BulbOutlined />
              </div>
              <Title level={4} className={styles.featureTitle}>创意辅助</Title>
              <Paragraph className={styles.featureDesc}>
                AI提供创意建议和创作灵感，帮助提升内容质量
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* 工作流程 */}
      <div className={styles.workflow}>
        <Title level={3} className={styles.sectionTitle}>
          <FireOutlined /> 使用流程
        </Title>
        <div className={styles.steps}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={6}>
              <Card 
                className={`${styles.stepCard} ${isDarkMode ? styles.darkCard : ''}`}
                bordered={false}
              >
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepIcon} style={{ fontSize: 32 }}>
                  <CameraOutlined />
                </div>
                <Title level={4}>上传视频</Title>
                <Paragraph>上传您的原始视频素材</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                className={`${styles.stepCard} ${isDarkMode ? styles.darkCard : ''}`}
                bordered={false}
              >
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepIcon} style={{ fontSize: 32 }}>
                  <ThunderboltOutlined />
                </div>
                <Title level={4}>AI分析</Title>
                <Paragraph>智能分析视频内容和结构</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                className={`${styles.stepCard} ${isDarkMode ? styles.darkCard : ''}`}
                bordered={false}
              >
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepIcon} style={{ fontSize: 32 }}>
                  <CodeOutlined />
                </div>
                <Title level={4}>自动生成脚本</Title>
                <Paragraph>基于分析生成专业短视频脚本</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card 
                className={`${styles.stepCard} ${isDarkMode ? styles.darkCard : ''}`}
                bordered={false}
              >
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepIcon} style={{ fontSize: 32 }}>
                  <ToolOutlined />
                </div>
                <Title level={4}>智能剪辑</Title>
                <Paragraph>一键生成精美短视频成品</Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
      
      {/* 行动召唤区 */}
      <Card 
        className={`${styles.cta} ${isDarkMode ? styles.darkCta : ''}`}
        bordered={false}
      >
        <Title level={3}>准备好开始创作了吗？</Title>
        <Paragraph className={styles.ctaText}>
          使用BlazeCut，让AI为您的创作提供灵感和效率
        </Paragraph>
        <Button 
          type="primary" 
          size="large" 
          icon={<PlusOutlined />} 
          onClick={handleCreateProject}
          className={styles.ctaButton}
        >
          立即创建项目
        </Button>
      </Card>
      
      {/* 页脚 */}
      <div className={styles.footer}>
        <Divider />
        <Space split={<Divider type="vertical" />}>
          <Text type="secondary">© 2025 BlazeCut</Text>
          <Text type="secondary">基于 Tauri 和 React 构建</Text>
          <a href="https://github.com/agions/blazecut" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </Space>
      </div>
    </div>
  );
};

export default Home; 