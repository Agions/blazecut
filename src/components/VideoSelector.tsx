import React, { useState } from 'react';
import { Button, message, Card, Space, Typography, Alert } from 'antd';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import { selectFile } from '@/services/tauriService';

const { Text } = Typography;

interface VideoSelectorProps {
  onVideoSelected: (path: string, filename: string) => void;
}

const VideoSelector: React.FC<VideoSelectorProps> = ({ onVideoSelected }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateVideoFile = async (filePath: string): Promise<boolean> => {
    try {
      // 检查文件扩展名
      const ext = filePath.toLowerCase().split('.').pop();
      const validExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
      if (!ext || !validExtensions.includes(ext)) {
        throw new Error('不支持的视频格式，请选择 MP4、AVI、MOV、MKV 或 WEBM 格式的视频');
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('视频文件验证失败');
      }
      return false;
    }
  };

  const handleSelectVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const selected = await selectFile([{
        name: '视频文件',
        extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm']
      }]);

      if (!selected) {
        setLoading(false);
        return;
      }

      // 验证视频文件
      const isValid = await validateVideoFile(selected);
      if (!isValid) {
        setLoading(false);
        return;
      }

      // 获取文件名
      const name = selected.split('/').pop() || selected.split('\\').pop() || '';
      setSelectedFile(selected);
      setFileName(name);
      onVideoSelected(selected, name);
      setError(null);
    } catch (error) {
      console.error('选择视频失败:', error);
      setError('选择视频失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setSelectedFile(null);
    setFileName('');
    handleSelectVideo();
  };

  return (
    <Card title="选择视频" bordered={false} className="video-selector-card">
      <Space direction="vertical" style={{ width: '100%' }}>
        {error && (
          <Alert
            message="错误"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={handleRetry}>
                重试
              </Button>
            }
          />
        )}

        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleSelectVideo}
          loading={loading}
          block
          size="large"
          style={{ 
            height: '48px', 
            marginBottom: '20px', 
            marginTop: '20px',
            fontSize: '16px'
          }}
        >
          选择视频文件
        </Button>
        
        {selectedFile && !error && (
          <div className="selected-file-container">
            <Space>
              <FileOutlined style={{ fontSize: '18px' }} />
              <Text strong style={{ fontSize: '15px' }} title={fileName}>
                已选择: {fileName}
              </Text>
            </Space>
          </div>
        )}

        <Text type="secondary" style={{ fontSize: '13px', marginTop: '12px' }}>
          支持的视频格式：MP4、AVI、MOV、MKV、WEBM
        </Text>
      </Space>
    </Card>
  );
};

export default VideoSelector; 