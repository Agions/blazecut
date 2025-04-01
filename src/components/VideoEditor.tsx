import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Progress, 
  Card, 
  Space, 
  message, 
  Spin, 
  Tooltip, 
  Slider, 
  Row, 
  Col, 
  Typography, 
  Select,
  Modal,
  Radio,
  Tabs,
  InputNumber,
  Alert
} from 'antd';
import { 
  ScissorOutlined, 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  SaveOutlined,
  SettingOutlined,
  DownloadOutlined,
  EyeOutlined,
  SoundOutlined,
  TransactionOutlined
} from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/tauri';
import { open, save } from '@tauri-apps/api/dialog';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { ScriptSegment } from '@/types';
import styles from './VideoEditor.module.less';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface VideoEditorProps {
  videoPath: string;
  segments: ScriptSegment[];
  onEditComplete?: (outputPath: string) => void;
}

interface SegmentStyleProps {
  left: string;
  width: string;
  color: string;
}

// 添加转场效果类型
type TransitionType = 'none' | 'fade' | 'dissolve' | 'wipe' | 'slide';

// 转场效果配置
const transitionOptions = [
  { value: 'none', label: '无转场' },
  { value: 'fade', label: '淡入淡出' },
  { value: 'dissolve', label: '交叉溶解' },
  { value: 'wipe', label: '擦除效果' },
  { value: 'slide', label: '滑动效果' }
];

const VideoEditor: React.FC<VideoEditorProps> = ({ videoPath, segments, onEditComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<ScriptSegment | null>(null);
  const [videoQuality, setVideoQuality] = useState<string>('medium');
  const [exportFormat, setExportFormat] = useState<string>('mp4');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSegment, setPreviewSegment] = useState<ScriptSegment | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // 新增状态
  const [transitionType, setTransitionType] = useState<TransitionType>('fade');
  const [transitionDuration, setTransitionDuration] = useState<number>(1);
  const [audioVolume, setAudioVolume] = useState<number>(100);
  const [settingsTab, setSettingsTab] = useState<string>('general');
  const [useSubtitles, setUseSubtitles] = useState<boolean>(true);

  // 视频时长改变时更新状态
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    if (video.readyState >= 2) {
      setDuration(video.duration);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // 监听视频播放时间更新
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // 组件卸载时清理预览文件
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.includes('temp')) {
        // 通知后端清理临时文件
        invoke('clean_temp_file', { path: previewUrl }).catch(error => {
          console.error('清理临时文件失败:', error);
        });
      }
    };
  }, [previewUrl]);

  // 控制视频播放/暂停
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 跳转到指定时间
  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  // 格式化时间显示
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 计算片段在时间轴上的位置和宽度
  const getSegmentStyle = (segment: ScriptSegment): SegmentStyleProps => {
    const left = `${(segment.startTime / duration) * 100}%`;
    const width = `${((segment.endTime - segment.startTime) / duration) * 100}%`;
    
    // 根据片段类型设置颜色
    let color = '#1890ff'; // 默认为蓝色（旁白）
    if (segment.type === 'dialogue') {
      color = '#52c41a'; // 对话为绿色
    } else if (segment.type === 'description') {
      color = '#fa8c16'; // 描述为橙色
    }
    
    return { left, width, color };
  };

  // 点击片段时跳转到对应时间点
  const handleSegmentClick = (segment: ScriptSegment) => {
    seekTo(segment.startTime);
    setSelectedSegment(segment);
  };

  // 预览片段
  const handlePreviewSegment = async (segment: ScriptSegment) => {
    setPreviewLoading(true);
    setPreviewSegment(segment);
    setShowPreviewModal(true);
    
    try {
      // 调用后端生成临时预览视频
      const tempPath = await invoke<string>('generate_preview', {
        inputPath: videoPath,
        segment: {
          start: segment.startTime,
          end: segment.endTime,
          type: segment.type
        },
        // 添加额外参数
        transition: transitionType,
        transitionDuration: transitionDuration,
        volume: audioVolume / 100,
        addSubtitles: useSubtitles
      });
      
      // 将文件路径转换为可加载URL
      const fileUrl = convertFileSrc(tempPath);
      setPreviewUrl(fileUrl);
    } catch (error) {
      console.error('生成预览失败:', error);
      message.error('生成预览失败: ' + error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 关闭预览
  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewUrl('');
    setPreviewSegment(null);
  };

  // 导出设置确认
  const showExportSettings = () => {
    setShowConfirmModal(true);
  };

  // 处理视频导出
  const handleExportVideo = async () => {
    setShowConfirmModal(false);
    
    if (!segments || segments.length === 0) {
      message.warning('没有可用的脚本片段来剪辑视频');
      return;
    }

    // 让用户选择保存位置
    try {
      const savePath = await save({
        defaultPath: `剪辑_${new Date().toISOString().split('T')[0]}.${exportFormat}`,
        filters: [
          { name: '视频文件', extensions: [exportFormat] }
        ]
      });

      if (!savePath) return;

      setProcessing(true);
      setProcessProgress(0);
      
      // 监听进度事件
      const unlistenHandler = await (window as any).__TAURI__.event.listen('cut_progress', (event: { payload: number }) => {
        setProcessProgress(Math.round(event.payload * 100));
      });
      
      // 调用Tauri后端执行视频剪辑，增加更多参数
      await invoke('cut_video', {
        inputPath: videoPath,
        outputPath: savePath,
        segments: segments.map(s => ({
          start: s.startTime,
          end: s.endTime,
          type: s.type,
          content: s.content, // 传递内容用于字幕
        })),
        quality: videoQuality,
        format: exportFormat,
        // 新增高级设置
        transition: transitionType,
        transitionDuration: transitionDuration,
        volume: audioVolume / 100,
        addSubtitles: useSubtitles
      }).catch(error => {
        console.error('视频剪辑失败:', error);
        message.error('视频剪辑失败: ' + error);
        setProcessing(false);
        return null;
      });

      // 取消事件监听
      unlistenHandler();

      if (onEditComplete) {
        onEditComplete(savePath);
      }
      
      message.success('视频剪辑完成');
    } catch (error) {
      console.error('导出视频失败:', error);
      message.error('导出视频失败');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <Title level={4}>视频混剪编辑器</Title>
      
      <Card>
        <div className={styles.videoContainer}>
          <video 
            ref={videoRef} 
            src={`file://${videoPath}`} 
            onEnded={() => setIsPlaying(false)} 
            preload="metadata"
            className={styles.videoPlayer}
          />
        </div>
        
        <div className={styles.controlsContainer}>
          <Button 
            type="text" 
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
            onClick={togglePlay}
            size="large"
          />
          
          <Text>{formatTime(currentTime)}</Text>
          
          <div className={styles.sliderContainer}>
            <Slider 
              min={0} 
              max={duration} 
              value={currentTime} 
              onChange={seekTo} 
              step={0.1} 
              tooltip={{ formatter: value => formatTime(value || 0) }}
            />
          </div>
          
          <Text>{formatTime(duration)}</Text>
        </div>
        
        <div className={styles.timelineContainer}>
          {segments.map((segment, index) => {
            const { left, width, color } = getSegmentStyle(segment);
            return (
              <Tooltip 
                key={segment.id} 
                title={`${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}: ${segment.content.substring(0, 50)}${segment.content.length > 50 ? '...' : ''}`}
              >
                <div 
                  className={styles.segmentMarker}
                  style={{ left, width, backgroundColor: color }}
                  onClick={() => handleSegmentClick(segment)}
                >
                  {index + 1}
                </div>
              </Tooltip>
            );
          })}
        </div>
        
        {selectedSegment && (
          <Card size="small" style={{ marginTop: 10 }}>
            <div className={styles.segmentDetails}>
              <Row gutter={16}>
                <Col span={6}>
                  <Text strong>时间: </Text>
                  <Text>{formatTime(selectedSegment.startTime)} - {formatTime(selectedSegment.endTime)}</Text>
                </Col>
                <Col span={4}>
                  <Text strong>类型: </Text>
                  <Text>{selectedSegment.type === 'narration' ? '旁白' : 
                        selectedSegment.type === 'dialogue' ? '对话' : '描述'}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>内容: </Text>
                  <Text>{selectedSegment.content}</Text>
                </Col>
                <Col span={2}>
                  <Button 
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => handlePreviewSegment(selectedSegment)}
                  >
                    预览
                  </Button>
                </Col>
              </Row>
            </div>
          </Card>
        )}
        
        <div className={styles.editorControls}>
          <Space>
            <Button 
              type="primary" 
              icon={<ScissorOutlined />} 
              onClick={showExportSettings}
              disabled={processing || segments.length === 0}
            >
              生成混剪视频
            </Button>
            
            <Button 
              icon={<SettingOutlined />} 
              onClick={showExportSettings}
              disabled={processing}
            >
              导出设置
            </Button>
          </Space>
          
          {processing && (
            <div className={styles.progressContainer}>
              <Progress percent={processProgress} status="active" style={{ width: 200 }} />
              <Text className={styles.progressText}>
                {processProgress < 30 ? '准备片段...' : 
                 processProgress < 70 ? '处理视频中...' : 
                 processProgress < 90 ? '合成最终视频...' : '完成中...'}
              </Text>
            </div>
          )}
        </div>
      </Card>
      
      {/* 设置弹窗 */}
      <Modal
        title="视频导出设置"
        open={showConfirmModal}
        onOk={handleExportVideo}
        onCancel={() => setShowConfirmModal(false)}
        okText="开始导出"
        cancelText="取消"
        width={600}
      >
        <Tabs activeKey={settingsTab} onChange={setSettingsTab}>
          <TabPane tab="基本设置" key="general">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className={styles.settingItem}>
                <Text strong>视频质量:</Text>
                <Select 
                  value={videoQuality} 
                  onChange={setVideoQuality} 
                  style={{ width: 200, marginLeft: 10 }}
                >
                  <Option value="low">低质量 (720p)</Option>
                  <Option value="medium">中等质量 (1080p)</Option>
                  <Option value="high">高质量 (原始分辨率)</Option>
                </Select>
              </div>
              
              <div className={styles.settingItem}>
                <Text strong>导出格式:</Text>
                <Select 
                  value={exportFormat} 
                  onChange={setExportFormat} 
                  style={{ width: 200, marginLeft: 10 }}
                >
                  <Option value="mp4">MP4 格式</Option>
                  <Option value="mov">MOV 格式</Option>
                  <Option value="mkv">MKV 格式</Option>
                </Select>
              </div>
              
              <div className={styles.settingItem}>
                <Text strong>添加字幕:</Text>
                <Radio.Group
                  value={useSubtitles}
                  onChange={e => setUseSubtitles(e.target.value)}
                  style={{ marginLeft: 10 }}
                >
                  <Radio value={true}>是</Radio>
                  <Radio value={false}>否</Radio>
                </Radio.Group>
              </div>
            </Space>
          </TabPane>
          
          <TabPane tab="高级设置" key="advanced">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className={styles.settingItem}>
                <Text strong>转场效果:</Text>
                <Select 
                  value={transitionType} 
                  onChange={(value: TransitionType) => setTransitionType(value)} 
                  style={{ width: 200, marginLeft: 10 }}
                  options={transitionOptions}
                />
              </div>
              
              <div className={styles.settingItem}>
                <Text strong>转场时长(秒):</Text>
                <InputNumber 
                  value={transitionDuration} 
                  onChange={(value) => value !== null && setTransitionDuration(value)} 
                  min={0.2}
                  max={3}
                  step={0.1}
                  style={{ width: 200, marginLeft: 10 }}
                />
              </div>
              
              <div className={styles.settingItem}>
                <Text strong>音频音量:</Text>
                <Row style={{ width: 200, marginLeft: 10, display: 'flex', alignItems: 'center' }}>
                  <Col span={18}>
                    <Slider 
                      value={audioVolume} 
                      onChange={setAudioVolume}
                      min={0}
                      max={150}
                      step={5}
                    />
                  </Col>
                  <Col span={6} style={{ textAlign: 'right' }}>
                    <InputNumber
                      value={audioVolume}
                      onChange={(value) => value !== null && setAudioVolume(value)}
                      min={0}
                      max={150}
                      step={5}
                      style={{ marginLeft: 8, width: 60 }}
                      addonAfter="%"
                    />
                  </Col>
                </Row>
              </div>
            </Space>
            
            <Alert
              message="高级设置说明"
              description="转场效果会在片段之间添加流畅过渡，可能会稍微增加处理时间。音频音量调整可以让您控制整个视频的音量大小，100%表示保持原音量不变。"
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </TabPane>
        </Tabs>
      </Modal>
      
      {/* 预览弹窗 */}
      <Modal
        title="片段预览"
        open={showPreviewModal}
        onCancel={handleClosePreview}
        footer={[
          <Button key="close" onClick={handleClosePreview}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {previewLoading ? (
          <div className={styles.previewLoading}>
            <Spin tip="生成预览中..." />
          </div>
        ) : previewUrl ? (
          <div className={styles.previewContainer}>
            <video
              controls
              autoPlay
              src={previewUrl}
              className={styles.previewVideo}
            />
            {previewSegment && (
              <div className={styles.previewInfo}>
                <Paragraph>
                  <Text strong>时间段: </Text>
                  <Text>{formatTime(previewSegment.startTime)} - {formatTime(previewSegment.endTime)}</Text>
                </Paragraph>
                <Paragraph>
                  <Text strong>内容: </Text>
                  <Text>{previewSegment.content}</Text>
                </Paragraph>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.previewError}>
            <Text type="danger">无法生成预览，请重试</Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoEditor; 