import React, { useState } from 'react';
import { Card, Button, Progress, message, Alert, Typography, Spin } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { analysisApi } from '@/services/api';
import VideoUploader from './VideoUploader';
import type { VideoAnalysis } from '@/types';
import styles from './VideoAnalyzer.module.less';

const { Title, Paragraph } = Typography;

interface VideoAnalyzerProps {
  projectId: string;
  videoUrl?: string;
  onAnalysisComplete: (analysis: VideoAnalysis) => void;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({
  projectId,
  videoUrl,
  onAnalysisComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | undefined>(videoUrl);

  const handleAnalyze = async () => {
    if (!selectedVideoUrl) {
      message.error('请先上传视频或输入视频链接');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // 模拟进度（实际项目中应从后端获取进度）
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 99) {
            clearInterval(progressInterval);
            return 99;
          }
          return newProgress;
        });
      }, 500);

      const analysis = await analysisApi.analyzeVideo(selectedVideoUrl);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      message.success('视频分析完成');
      onAnalysisComplete(analysis);
    } catch (error: any) {
      setError(error.message || '视频分析失败');
      message.error('视频分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.container}>
      <Title level={4}>视频分析</Title>
      <Paragraph>
        我们将使用先进的AI技术分析您的视频内容，识别关键时刻、情感变化和重要信息，为生成高质量解说脚本提供基础。
      </Paragraph>

      {error && (
        <Alert
          message="分析错误"
          description={error}
          type="error"
          showIcon
          className={styles.alert}
        />
      )}

      <div className={styles.videoSection}>
        {selectedVideoUrl && typeof selectedVideoUrl === 'string' && selectedVideoUrl.startsWith('http') ? (
          <div className={styles.videoInfo}>
            <VideoCameraOutlined className={styles.icon} />
            <span className={styles.url}>{selectedVideoUrl}</span>
          </div>
        ) : (
          <VideoUploader 
            initialValue={selectedVideoUrl} 
            onUploadSuccess={(url) => setSelectedVideoUrl(url)}
          />
        )}
      </div>

      {loading && (
        <div className={styles.progress}>
          <Progress percent={progress} status="active" />
          <Spin tip="分析中..." />
        </div>
      )}

      <Button
        type="primary"
        onClick={handleAnalyze}
        loading={loading}
        disabled={!selectedVideoUrl || loading}
        className={styles.button}
      >
        开始分析
      </Button>
    </Card>
  );
};

export default VideoAnalyzer; 