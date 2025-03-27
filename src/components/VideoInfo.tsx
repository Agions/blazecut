import React from 'react';
import { Card, Descriptions, Space, Image, Tag, Statistic } from 'antd';
import { VideoCameraOutlined, FieldTimeOutlined, DotChartOutlined, FullscreenOutlined } from '@ant-design/icons';
import { VideoMetadata } from '@/services/videoService';
import { formatDuration, formatFileSize } from '@/utils/format';
import styles from './VideoInfo.module.less';

interface VideoInfoProps {
  videoPath: string;
  metadata: VideoMetadata;
  thumbnailUrl?: string;
  keyFrames?: string[];
}

/**
 * 视频信息展示组件
 */
const VideoInfo: React.FC<VideoInfoProps> = ({ 
  videoPath, 
  metadata, 
  thumbnailUrl, 
  keyFrames = [] 
}) => {
  const filename = videoPath.split(/[\/\\]/).pop() || '未知文件';
  
  return (
    <div className={styles.videoInfo}>
      <Card 
        title={<Space><VideoCameraOutlined /> 视频信息</Space>}
        className={styles.card}
      >
        <div className={styles.content}>
          {thumbnailUrl && (
            <div className={styles.thumbnail}>
              <Image 
                src={thumbnailUrl} 
                alt="视频缩略图"
                width={240}
                height={135}
                style={{ objectFit: 'cover' }}
const VideoInfo: React.FC<VideoInfoProps> = ({ name, duration, path }) => {
  // 格式化时间为分:秒
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '未知';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 格式化路径，只显示最后的文件名部分
  const formatPath = (path: string): string => {
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1];
  };

  return (
    <Card title="视频信息" className={styles.container}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic 
            title="视频名称"
            value={name}
            valueStyle={{ fontSize: '16px' }}
            prefix={<FileOutlined />}
          />
        </Col>
        
        <Col span={8}>
          <Statistic 
            title="时长"
            value={formatDuration(duration)}
            valueStyle={{ fontSize: '16px' }}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        
        <Col span={8}>
          <Statistic 
            title="源文件"
            value={formatPath(path)}
            valueStyle={{ fontSize: '16px', overflow: 'hidden', textOverflow: 'ellipsis' }}
            prefix={<VideoCameraOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default VideoInfo; 