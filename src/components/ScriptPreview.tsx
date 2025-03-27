import React from 'react';
import { Card, Typography, Divider, Button, Tag } from 'antd';
import { FilePdfOutlined, CopyOutlined, FileTextOutlined } from '@ant-design/icons';
import type { Script } from '@/types';
import styles from './ScriptPreview.module.less';

const { Title, Paragraph, Text } = Typography;

interface ScriptPreviewProps {
  script: Script;
  onEdit: () => void;
  onExport: () => void;
}

const ScriptPreview: React.FC<ScriptPreviewProps> = ({ script, onEdit, onExport }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = () => {
    const text = script.content
      .map(
        (segment) =>
          `[${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}] ${
            segment.content
          }`
      )
      .join('\n\n');

    navigator.clipboard.writeText(text).then(
      () => {
        alert('脚本已复制到剪贴板');
      },
      (err) => {
        console.error('复制失败:', err);
      }
    );
  };

  const totalDuration = script.content.reduce(
    (acc, segment) => acc + (segment.endTime - segment.startTime),
    0
  );

  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={4}>脚本预览</Title>
          <div className={styles.meta}>
            <Tag color="blue">总时长: {Math.round(totalDuration / 60)} 分钟</Tag>
            <Tag color="green">段落数: {script.content.length}</Tag>
            <Tag>创建于: {new Date(script.createdAt).toLocaleString()}</Tag>
          </div>
        </div>
        <div className={styles.actions}>
          <Button 
            icon={<CopyOutlined />} 
            onClick={copyToClipboard}
            className={styles.actionButton}
          >
            复制全文
          </Button>
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={onExport}
            className={styles.actionButton}
          >
            导出 PDF
          </Button>
          <Button 
            type="primary" 
            icon={<FileTextOutlined />} 
            onClick={onEdit}
          >
            编辑脚本
          </Button>
        </div>
      </div>

      <Divider />

      <div className={styles.scriptContent}>
        {script.content.map((segment, index) => (
          <div key={segment.id} className={styles.segment}>
            <div className={styles.segmentHeader}>
              <Text strong className={styles.timeCode}>
                {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
              </Text>
              <Tag color={
                segment.type === 'narration' ? 'blue' : 
                segment.type === 'dialogue' ? 'green' : 'orange'
              }>
                {segment.type === 'narration' ? '旁白' : 
                 segment.type === 'dialogue' ? '对话' : '描述'}
              </Tag>
            </div>
            <Paragraph className={styles.content}>
              {segment.content}
            </Paragraph>
            {index < script.content.length - 1 && <Divider dashed className={styles.divider} />}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ScriptPreview; 