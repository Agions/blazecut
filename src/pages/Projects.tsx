import React, { useEffect, useState } from 'react';
import { Card, Button, List, Typography, Space, Empty, Modal, message, Tag } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  VideoCameraOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { ensureAppDataDir } from '@/services/tauriService';
import { formatDate, formatDuration } from '@/utils/format';
import styles from './Projects.module.less';

const { Title, Text } = Typography;

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { projects, deleteProject } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // 确保应用数据目录存在
        await ensureAppDataDir();
        setLoading(false);
      } catch (error) {
        console.error('初始化失败:', error);
        message.error('初始化失败');
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此项目吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          deleteProject(id);
          message.success('项目已删除');
        } catch (error) {
          console.error('删除项目失败:', error);
          message.error('删除项目失败');
        }
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>项目列表</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/projects/new')}
        >
          创建新项目
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <Empty
            description="暂无项目"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/projects/new')}
            >
              创建新项目
            </Button>
          </Empty>
        </Card>
      ) : (
        <List
          grid={{ 
            gutter: 16, 
            xs: 1, 
            sm: 1, 
            md: 2, 
            lg: 3, 
            xl: 3, 
            xxl: 4 
          }}
          dataSource={projects}
          renderItem={(project) => (
            <List.Item>
              <Card
                hoverable
                className={styles.projectCard}
                cover={
                  <div className={styles.cardCover}>
                    <VideoCameraOutlined className={styles.cardIcon} />
                  </div>
                }
                actions={[
                  <Button 
                    icon={<EyeOutlined />} 
                    type="text"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    查看
                  </Button>,
                  <Button 
                    icon={<EditOutlined />} 
                    type="text"
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                  >
                    编辑
                  </Button>,
                  <Button 
                    icon={<DeleteOutlined />} 
                    type="text" 
                    danger
                    onClick={() => handleDelete(project.id)}
                  >
                    删除
                  </Button>
                ]}
              >
                <Card.Meta
                  title={project.name}
                  description={
                    <Space direction="vertical" size={4}>
                      {project.description && (
                        <Text ellipsis style={{ maxWidth: '100%' }}>
                          {project.description}
                        </Text>
                      )}
                      <div className={styles.cardInfo}>
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">
                            创建于: {formatDate(project.createdAt)}
                          </Text>
                        </Space>
                      </div>
                      <div>
                        <Space size={[0, 8]} wrap>
                          <Tag color="blue">
                            {project.scripts?.length || 0} 个脚本
                          </Tag>
                          {project.analysis?.duration && (
                            <Tag color="green">
                              {formatDuration(project.analysis.duration)}
                            </Tag>
                          )}
                        </Space>
                      </div>
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default Projects; 