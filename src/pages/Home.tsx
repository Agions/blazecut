import React from 'react';
import { Card, Row, Col, Statistic, Button } from 'antd';
import { VideoCameraOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import styles from './Home.module.less';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { projects } = useStore();

  const totalProjects = projects.length;
  const totalScripts = projects.reduce((acc, project) => acc + project.scripts.length, 0);
  const totalDuration = projects.reduce((acc, project) => {
    if (project.analysis) {
      return acc + project.analysis.duration;
    }
    return acc;
  }, 0);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>欢迎使用 BlazeCut</h1>
      <p className={styles.subtitle}>AI 驱动的视频解说脚本生成工具</p>

      <Row gutter={[16, 16]} className={styles.stats}>
        <Col span={8}>
          <Card>
            <Statistic
              title="项目总数"
              value={totalProjects}
              prefix={<VideoCameraOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="脚本总数"
              value={totalScripts}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总时长"
              value={Math.round(totalDuration / 60)}
              suffix="分钟"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div className={styles.actions}>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate('/projects/new')}
        >
          创建新项目
        </Button>
        <Button
          size="large"
          onClick={() => navigate('/projects')}
        >
          查看所有项目
        </Button>
      </div>
    </div>
  );
};

export default Home; 