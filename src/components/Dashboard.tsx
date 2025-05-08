import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Typography, Tooltip, Dropdown, Empty, Spin, Input, Modal, Form, Select, DatePicker } from 'antd';
import { 
  PlusOutlined, 
  MoreOutlined, 
  ClockCircleOutlined, 
  StarOutlined, 
  StarFilled,
  DeleteOutlined,
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.less';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProjectType {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  duration: number;
  resolution: string;
  starred: boolean;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // 模拟从API获取项目数据
    setLoading(true);
    setTimeout(() => {
      const mockProjects: ProjectType[] = [
        {
          id: '1',
          title: '短剧第一集',
          thumbnail: 'https://picsum.photos/seed/1/300/200',
          createdAt: '2023-08-25T15:30:00',
          updatedAt: '2023-08-27T10:15:00',
          duration: 180,
          resolution: '1080p',
          starred: true
        },
        {
          id: '2',
          title: '商业广告',
          thumbnail: 'https://picsum.photos/seed/2/300/200',
          createdAt: '2023-08-20T09:45:00',
          updatedAt: '2023-08-21T14:30:00',
          duration: 45,
          resolution: '4K',
          starred: false
        },
        {
          id: '3',
          title: '产品展示视频',
          thumbnail: 'https://picsum.photos/seed/3/300/200',
          createdAt: '2023-08-15T12:00:00',
          updatedAt: '2023-08-18T16:20:00',
          duration: 120,
          resolution: '1080p',
          starred: false
        },
        {
          id: '4',
          title: '旅行花絮',
          thumbnail: 'https://picsum.photos/seed/4/300/200',
          createdAt: '2023-08-10T08:30:00',
          updatedAt: '2023-08-10T20:45:00',
          duration: 240,
          resolution: '1080p',
          starred: true
        }
      ];
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateProject = (values: any) => {
    console.log('创建新项目:', values);
    // 这里应该实现实际的项目创建逻辑
    setShowCreateModal(false);
    form.resetFields();
    
    // 模拟创建后添加到列表
    const newProject: ProjectType = {
      id: Date.now().toString(),
      title: values.title,
      thumbnail: 'https://picsum.photos/seed/new/300/200',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duration: 0,
      resolution: values.resolution,
      starred: false
    };
    
    setProjects([newProject, ...projects]);
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor/${projectId}`);
  };

  const handleStarProject = (projectId: string, isStarred: boolean) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, starred: !isStarred } 
        : project
    ));
  };

  const handleDeleteProject = (projectId: string) => {
    Modal.confirm({
      title: '确定要删除这个项目吗？',
      content: '删除后无法恢复',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setProjects(projects.filter(project => project.id !== projectId));
      }
    });
  };

  const handleDuplicateProject = (projectId: string) => {
    const projectToDuplicate = projects.find(p => p.id === projectId);
    if (projectToDuplicate) {
      const duplicatedProject: ProjectType = {
        ...projectToDuplicate,
        id: Date.now().toString(),
        title: `${projectToDuplicate.title} (副本)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        starred: false
      };
      setProjects([duplicatedProject, ...projects]);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredProjects = projects
    .filter(project => project.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const fieldA = sortBy === 'title' ? a[sortBy].toLowerCase() : new Date(a[sortBy]).getTime();
      const fieldB = sortBy === 'title' ? b[sortBy].toLowerCase() : new Date(b[sortBy]).getTime();
      
      if (sortOrder === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });

  const sortOptions = [
    { label: '最近编辑', value: 'updatedAt' },
    { label: '创建时间', value: 'createdAt' },
    { label: '名称', value: 'title' }
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <Title level={3}>我的项目</Title>
        <div className={styles.dashboardActions}>
          <Input 
            placeholder="搜索项目..." 
            prefix={<SearchOutlined />} 
            className={styles.searchInput}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Dropdown 
            menu={{
              items: sortOptions.map(option => ({
                key: option.value,
                label: option.label,
                onClick: () => {
                  if (sortBy === option.value) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(option.value as any);
                    setSortOrder('desc');
                  }
                }
              }))
            }}
            trigger={['click']}
          >
            <Button icon={<SortAscendingOutlined />}>
              {sortOptions.find(opt => opt.value === sortBy)?.label} {sortOrder === 'desc' ? '↓' : '↑'}
            </Button>
          </Dropdown>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            新建项目
          </Button>
        </div>
      </div>

      <div className={styles.projectsGrid}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Empty 
            description="没有找到项目" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
            >
              创建第一个项目
            </Button>
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredProjects.map(project => (
              <Col xs={24} sm={12} md={8} lg={6} key={project.id}>
                <Card
                  className={styles.projectCard}
                  cover={
                    <div className={styles.thumbnailContainer} onClick={() => handleOpenProject(project.id)}>
                      <img 
                        alt={project.title} 
                        src={project.thumbnail} 
                        className={styles.projectThumbnail}
                      />
                      <div className={styles.thumbnailOverlay}>
                        <EyeOutlined className={styles.viewIcon} />
                      </div>
                    </div>
                  }
                  actions={[
                    <Tooltip title={project.starred ? '取消收藏' : '收藏'}>
                      {project.starred ? (
                        <StarFilled 
                          className={styles.starredIcon} 
                          onClick={() => handleStarProject(project.id, project.starred)} 
                        />
                      ) : (
                        <StarOutlined onClick={() => handleStarProject(project.id, project.starred)} />
                      )}
                    </Tooltip>,
                    <Tooltip title="编辑">
                      <EditOutlined onClick={() => handleOpenProject(project.id)} />
                    </Tooltip>,
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'duplicate',
                            label: '复制',
                            icon: <CopyOutlined />,
                            onClick: () => handleDuplicateProject(project.id)
                          },
                          {
                            key: 'delete',
                            label: '删除',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => handleDeleteProject(project.id)
                          }
                        ]
                      }}
                      trigger={['click']}
                    >
                      <MoreOutlined />
                    </Dropdown>
                  ]}
                >
                  <div className={styles.projectInfo}>
                    <Typography.Title level={5} ellipsis={{ tooltip: project.title }}>
                      {project.title}
                    </Typography.Title>
                    <div className={styles.projectMeta}>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {formatDuration(project.duration)}
                      </Text>
                      <Text type="secondary">
                        {project.resolution}
                      </Text>
                    </div>
                    <Text type="secondary" className={styles.projectDate}>
                      修改于 {formatDate(project.updatedAt)}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <Modal
        title="创建新项目"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
      >
        <Form 
          form={form}
          layout="vertical" 
          onFinish={handleCreateProject}
          initialValues={{
            aspectRatio: '16:9',
            resolution: '1080p'
          }}
        >
          <Form.Item
            name="title"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="输入项目名称..." />
          </Form.Item>
          
          <Form.Item
            name="aspectRatio"
            label="宽高比"
          >
            <Select>
              <Option value="16:9">16:9 - 横屏</Option>
              <Option value="9:16">9:16 - 竖屏</Option>
              <Option value="1:1">1:1 - 方形</Option>
              <Option value="4:3">4:3 - 传统</Option>
              <Option value="21:9">21:9 - 超宽</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="resolution"
            label="分辨率"
          >
            <Select>
              <Option value="720p">720p - HD</Option>
              <Option value="1080p">1080p - Full HD</Option>
              <Option value="2K">2K - 2560 x 1440</Option>
              <Option value="4K">4K - 3840 x 2160</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="template"
            label="模板"
          >
            <Select>
              <Option value="blank">空白项目</Option>
              <Option value="shortVideo">短视频模板</Option>
              <Option value="documentary">纪录片模板</Option>
              <Option value="vlog">Vlog模板</Option>
            </Select>
          </Form.Item>
          
          <Form.Item className={styles.formActions}>
            <Button onClick={() => setShowCreateModal(false)} style={{ marginRight: 16 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard; 