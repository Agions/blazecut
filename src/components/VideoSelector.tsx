import React, { useState } from 'react';
import { Button, message, Card, Space, Typography } from 'antd';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import { open } from '@tauri-apps/api/dialog';
import { basename } from '@tauri-apps/api/path';

const { Text } = Typography;

interface VideoSelectorProps {
  onVideoSelected: (path: string, filename: string) => void;
}

const VideoSelector: React.FC<VideoSelectorProps> = ({ onVideoSelected }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSelectVideo = async () => {
    try {
      setLoading(true);
      const selected = await open({
        multiple: false,
        filters: [{
          name: '视频文件',
          extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm']
        }]
      });

      if (!selected || Array.isArray(selected)) {
        setLoading(false);
        return;
      }

      const name = await basename(selected);
      setSelectedFile(selected);
      setFileName(name);
      onVideoSelected(selected, name);
      setLoading(false);
    } catch (error) {
      console.error('选择视频失败:', error);
      message.error('选择视频失败，请重试');
      setLoading(false);
    }
  };

  return (
    <Card title="选择视频" bordered={false}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleSelectVideo}
          loading={loading}
          block
        >
          选择视频文件
        </Button>
        
        {selectedFile && (
          <div style={{ marginTop: 16 }}>
            <Space>
              <FileOutlined />
              <Text ellipsis style={{ maxWidth: 300 }}>{fileName}</Text>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default VideoSelector; 