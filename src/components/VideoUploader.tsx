import React, { useState } from 'react';
import { Upload, Button, Progress, message } from 'antd';
import { UploadOutlined, VideoCameraOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd/es/upload/interface';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import styles from './VideoUploader.module.less';

interface VideoUploaderProps {
  onUploadSuccess: (videoPath: string) => void;
  initialValue?: string;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onUploadSuccess, initialValue }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(initialValue);

  const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;

  const openFileDialog = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: '视频文件', extensions: ['mp4', 'mov', 'avi', 'mkv'] }],
      });

      if (selected && !Array.isArray(selected)) {
        // 转换为应用可访问的URL
        const filePath = selected;
        const fileUrl = convertFileSrc(filePath);
        setVideoUrl(fileUrl);
        onUploadSuccess(filePath);
        message.success('视频选择成功');
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      message.error('选择文件失败');
    }
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    setUploading(true);
    setProgress(0);

    try {
      // 模拟进度
      const simulateProgress = () => {
        let percent = 0;
        const interval = setInterval(() => {
          percent += Math.floor(Math.random() * 3 + 1);
          if (percent >= 99) {
            clearInterval(interval);
            percent = 99;
          }
          setProgress(percent);
          onProgress({ percent });
        }, 100);

        return interval;
      };

      const progressInterval = simulateProgress();

      // 模拟上传过程
      await new Promise((resolve) => setTimeout(resolve, 2000));
      clearInterval(progressInterval);

      // 创建一个视频预览URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setVideoUrl(reader.result as string);
        setProgress(100);
        onSuccess(null, null);
        onUploadSuccess(reader.result as string);
        message.success('视频上传成功');
        setUploading(false);
      };
    } catch (error) {
      console.error('上传失败:', error);
      setUploading(false);
      setProgress(0);
      onError(error);
      message.error('视频上传失败');
    }
  };

  const uploadProps: UploadProps = {
    name: 'video',
    accept: 'video/*',
    customRequest,
    fileList,
    showUploadList: false,
    onChange(info) {
      if (info.file.status === 'done') {
        setFileList([info.file]);
      }
    },
  };

  return (
    <div className={styles.container}>
      {videoUrl ? (
        <div className={styles.videoPreview}>
          <div className={styles.videoWrapper}>
            <video
              src={videoUrl}
              controls
              className={styles.video}
            />
          </div>
          <div className={styles.videoActions}>
            <Button
              icon={<UploadOutlined />}
              onClick={() => {
                setVideoUrl(undefined);
                setFileList([]);
              }}
            >
              重新选择视频
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.uploader}>
          {isTauri ? (
            <Button
              icon={<VideoCameraOutlined />}
              size="large"
              onClick={openFileDialog}
              loading={uploading}
              className={styles.uploadButton}
            >
              选择视频文件
            </Button>
          ) : (
            <Upload {...uploadProps}>
              <Button
                icon={<UploadOutlined />}
                size="large"
                loading={uploading}
                className={styles.uploadButton}
              >
                上传视频
              </Button>
            </Upload>
          )}
          <p className={styles.uploadTip}>
            支持MP4、MOV、AVI或MKV格式，最大文件大小500MB
          </p>
          {uploading && <Progress percent={progress} status="active" />}
        </div>
      )}
    </div>
  );
};

export default VideoUploader; 