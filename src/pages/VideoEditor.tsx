import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, Card, Button, Dropdown, Space, Typography, Tabs, 
  Row, Col, Progress, Tooltip, message, Empty, Tag, Skeleton
} from 'antd';
import { 
  PlayCircleOutlined, PauseCircleOutlined, ScissorOutlined, 
  SaveOutlined, UndoOutlined, RedoOutlined, DownloadOutlined, 
  FileImageOutlined, SettingOutlined, UploadOutlined, CopyOutlined,
  DeleteOutlined, CheckCircleOutlined, ShareAltOutlined, PlusOutlined,
  FullscreenOutlined, SyncOutlined, ExpandOutlined, LockOutlined
} from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

import styles from './VideoEditor.module.less';

// 导入组件和服务
import { VideoSegment, extractKeyFrames, generateThumbnail, analyzeVideo } from '@/services/videoService';
import { saveProjectFile } from '@/services/projectService';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const VideoEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // 状态管理
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [keyframes, setKeyframes] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('trim');
  const [editHistory, setEditHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(-1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<string>('mp4');
  const [videoQuality, setVideoQuality] = useState<string>('medium');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // 模拟项目数据
  const projectData = {
    id: projectId || 'new',
    name: '未命名项目',
    videoPath: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    segmentCount: segments.length,
    duration: 0,
    width: 1920,
    height: 1080,
    fps: 30,
  };
  
  // 加载视频文件
  const handleLoadVideo = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: '视频文件',
          extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm']
        }]
      });

      if (!selected || typeof selected !== 'string') {
        return;
      }

      // 开始分析视频
      setLoading(true);
      setAnalyzing(true);
      
      try {
        // 设置视频源
        setVideoSrc(`file://${selected}`);
        
        // 获取视频元数据
        const metadata = await analyzeVideo(selected);
        setDuration(metadata.duration);
        
        // 创建一个默认片段
        const newSegment: VideoSegment = {
          start: 0,
          end: metadata.duration,
          type: 'video',
          content: '完整视频'
        };
        
        setSegments([newSegment]);
        
        // 添加到历史记录
        addToHistory([newSegment]);
        
        // 提取关键帧
        const frames = await extractKeyFrames(selected, {
          interval: Math.max(5, Math.floor(metadata.duration / 10)),
          maxFrames: 10
        });
        
        setKeyframes(frames.map(frame => frame.path));
        
        message.success('视频加载成功');
      } catch (error) {
        console.error('视频分析失败:', error);
        message.error('视频分析失败，请检查文件格式');
      } finally {
        setAnalyzing(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('选择文件失败:', err);
    }
  };

  // 播放/暂停视频
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // 视频时间更新
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };
  
  // 视频加载完成
  const handleVideoLoaded = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };
  
  // 添加到历史记录
  const addToHistory = (newSegments: VideoSegment[]) => {
    // 如果当前不在历史记录的末尾，移除后面的记录
    if (historyIndex < editHistory.length - 1) {
      setEditHistory(editHistory.slice(0, historyIndex + 1));
    }
    
    // 添加新记录
    setEditHistory([...editHistory, newSegments]);
    setHistoryIndex(historyIndex + 1);
  };
  
  // 撤销
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSegments(editHistory[historyIndex - 1]);
    }
  };
  
  // 重做
  const handleRedo = () => {
    if (historyIndex < editHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSegments(editHistory[historyIndex]);
    }
  };
  
  // 添加片段
  const handleAddSegment = () => {
    // 创建一个5秒的新片段
    const newSegment: VideoSegment = {
      start: Math.min(currentTime, duration - 5),
      end: Math.min(currentTime + 5, duration),
      type: 'video',
      content: `片段 ${segments.length + 1}`
    };
    
    const newSegments = [...segments, newSegment];
    setSegments(newSegments);
    addToHistory(newSegments);
    setSelectedSegmentIndex(newSegments.length - 1);
    message.success('已添加新片段');
  };
  
  // 删除片段
  const handleDeleteSegment = (index: number) => {
    const newSegments = segments.filter((_, i) => i !== index);
    setSegments(newSegments);
    addToHistory(newSegments);
    setSelectedSegmentIndex(-1);
    message.success('已删除片段');
  };
  
  // 选择片段
  const handleSelectSegment = (index: number) => {
    setSelectedSegmentIndex(index);
    
    // 设置播放头到片段起始位置
    if (videoRef.current && index >= 0 && segments[index]) {
      videoRef.current.currentTime = segments[index].start;
      setCurrentTime(segments[index].start);
    }
  };
  
  // 保存项目
  const handleSaveProject = async () => {
    setIsSaving(true);
    
    try {
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 保存逻辑
      const projectToSave = {
        ...projectData,
        segments,
        updatedAt: new Date().toISOString()
      };
      
      await saveProjectFile(projectId || 'new', JSON.stringify(projectToSave));
      
      message.success('项目保存成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };
  
  // 导出视频
  const handleExportVideo = async () => {
    setIsExporting(true);
    
    try {
      // 模拟导出
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 导出视频逻辑
      message.success('视频导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };
  
  // 格式化时间
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean);
    
    return parts.join(':');
  };
  
  // 渲染顶部工具栏
  const renderToolbar = () => (
    <div className={styles.toolbar}>
      <div className={styles.leftTools}>
        <Button 
          type="primary" 
          icon={<UploadOutlined />} 
          onClick={handleLoadVideo}
          loading={loading}
        >
          加载视频
        </Button>
        
        <Tooltip title="撤销">
          <Button 
            icon={<UndoOutlined />} 
            disabled={historyIndex <= 0}
            onClick={handleUndo}
          />
        </Tooltip>
        
        <Tooltip title="重做">
          <Button 
            icon={<RedoOutlined />} 
            disabled={historyIndex >= editHistory.length - 1}
            onClick={handleRedo}
          />
        </Tooltip>
        
        <Tooltip title="添加片段">
          <Button 
            icon={<PlusOutlined />} 
            onClick={handleAddSegment}
            disabled={!videoSrc}
          />
        </Tooltip>
      </div>
      
      <div className={styles.rightTools}>
        <Button 
          icon={<SaveOutlined />} 
          onClick={handleSaveProject}
          loading={isSaving}
          disabled={!videoSrc}
        >
          保存
        </Button>
        
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={handleExportVideo}
          loading={isExporting}
          disabled={!videoSrc || segments.length === 0}
        >
          导出
        </Button>
      </div>
    </div>
  );
  
  // 渲染播放器控制栏
  const renderPlayerControls = () => (
    <div className={styles.playerControls}>
      <Button 
        type="text" 
        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
        onClick={togglePlayPause}
        size="large"
        disabled={!videoSrc}
      />
      
      <div className={styles.timeDisplay}>
        <Text>{formatTime(currentTime)} / {formatTime(duration)}</Text>
      </div>
      
      <div className={styles.progressBar}>
        <Progress 
          percent={(currentTime / Math.max(duration, 1)) * 100} 
          showInfo={false}
          strokeColor="#1E88E5"
          trailColor="#e6e6e6"
        />
      </div>
      
      <Tooltip title="全屏">
        <Button 
          type="text" 
          icon={<FullscreenOutlined />} 
          disabled={!videoSrc}
        />
      </Tooltip>
    </div>
  );
  
  // 渲染片段列表
  const renderSegmentList = () => (
    <div className={styles.segmentList}>
      <Title level={5} className={styles.sectionTitle}>片段列表</Title>
      
      {segments.length === 0 ? (
        <Empty description="暂无片段" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        segments.map((segment, index) => (
          <Card 
            key={index}
            className={`${styles.segmentCard} ${selectedSegmentIndex === index ? styles.selected : ''}`}
            onClick={() => handleSelectSegment(index)}
          >
            <div className={styles.segmentHeader}>
              <Text strong>片段 {index + 1}</Text>
              <Space>
                <Tooltip title="删除">
                  <Button 
                    type="text" 
                    size="small" 
                    danger
                    icon={<DeleteOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSegment(index);
                    }}
                  />
                </Tooltip>
              </Space>
            </div>
            
            <div className={styles.segmentTime}>
              <Tag color="blue">
                {formatTime(segment.start)} - {formatTime(segment.end)}
              </Tag>
              <Text type="secondary">
                时长: {formatTime(segment.end - segment.start)}
              </Text>
            </div>
            
            {segment.content && (
              <div className={styles.segmentContent}>
                <Text ellipsis>{segment.content}</Text>
              </div>
            )}
          </Card>
        ))
      )}
      
      <Button 
        type="dashed" 
        icon={<PlusOutlined />} 
        block
        onClick={handleAddSegment}
        disabled={!videoSrc}
        className={styles.addSegmentButton}
      >
        添加片段
      </Button>
    </div>
  );
  
  // 渲染关键帧区域
  const renderKeyframes = () => (
    <div className={styles.keyframesContainer}>
      <Title level={5} className={styles.sectionTitle}>关键帧</Title>
      
      {keyframes.length === 0 ? (
        <Empty description="暂无关键帧" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className={styles.keyframeList}>
          {keyframes.map((frame, index) => (
            <div key={index} className={styles.keyframeItem}>
              <img src={frame} alt={`关键帧 ${index + 1}`} className={styles.keyframeImage} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  return (
    <Layout className={styles.editorLayout}>
      <Content className={styles.editorContent}>
        {renderToolbar()}
        
        <Row gutter={[24, 24]}>
          {/* 视频预览区 */}
          <Col span={16}>
            <Card className={styles.playerCard} title="视频预览">
              {videoSrc ? (
                <div className={styles.playerWrapper}>
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    className={styles.videoPlayer}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleVideoLoaded}
                    onClick={togglePlayPause}
                  />
                  {renderPlayerControls()}
                </div>
              ) : (
                <div className={styles.emptyPlayer}>
                  <Button 
                    type="primary" 
                    icon={<UploadOutlined />} 
                    onClick={handleLoadVideo}
                    size="large"
                  >
                    加载视频
                  </Button>
                  <Text type="secondary" style={{ marginTop: 16 }}>
                    支持MP4, MOV, AVI, MKV等格式
                  </Text>
                </div>
              )}
            </Card>
            
            {/* 时间轴 */}
            <div className={styles.timelineContainer}>
              <div className={styles.timeline} ref={timelineRef}>
                {segments.map((segment, index) => (
                  <div 
                    key={index}
                    className={`${styles.timelineSegment} ${selectedSegmentIndex === index ? styles.selected : ''}`}
                    style={{
                      left: `${(segment.start / Math.max(duration, 1)) * 100}%`,
                      width: `${((segment.end - segment.start) / Math.max(duration, 1)) * 100}%`
                    }}
                    onClick={() => handleSelectSegment(index)}
                  >
                    <div className={styles.segmentHandle} />
                    <div className={styles.segmentLabel}>
                      {index + 1}
                    </div>
                    <div className={styles.segmentHandle} />
                  </div>
                ))}
                
                {/* 播放头 */}
                <div 
                  className={styles.playhead}
                  style={{
                    left: `${(currentTime / Math.max(duration, 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          </Col>
          
          {/* 右侧工具面板 */}
          <Col span={8}>
            <Tabs 
              defaultActiveKey="trim" 
              onChange={value => setActiveTab(value)}
              className={styles.editorTabs}
            >
              <TabPane tab="片段" key="trim">
                {renderSegmentList()}
              </TabPane>
              
              <TabPane tab="关键帧" key="keyframes">
                {renderKeyframes()}
              </TabPane>
              
              <TabPane tab="效果" key="effects">
                <div className={styles.effectsPanel}>
                  <Title level={5} className={styles.sectionTitle}>视频效果</Title>
                  <Empty description="此功能正在开发中" />
                </div>
              </TabPane>
              
              <TabPane tab="设置" key="settings">
                <div className={styles.settingsPanel}>
                  <Title level={5} className={styles.sectionTitle}>导出设置</Title>
                  
                  <Card className={styles.settingCard}>
                    <div className={styles.settingItem}>
                      <Text strong>输出格式</Text>
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'mp4', label: 'MP4' },
                            { key: 'mov', label: 'MOV' },
                            { key: 'webm', label: 'WebM' }
                          ],
                          onClick: ({ key }) => setOutputFormat(key)
                        }}
                      >
                        <Button>
                          {outputFormat.toUpperCase()} <DownloadOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                    
                    <div className={styles.settingItem}>
                      <Text strong>视频质量</Text>
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'low', label: '低 (720p)' },
                            { key: 'medium', label: '中 (1080p)' },
                            { key: 'high', label: '高 (原始分辨率)' }
                          ],
                          onClick: ({ key }) => setVideoQuality(key)
                        }}
                      >
                        <Button>
                          {videoQuality === 'low' ? '低 (720p)' : 
                           videoQuality === 'medium' ? '中 (1080p)' : 
                           '高 (原始分辨率)'} <DownloadOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                  </Card>
                </div>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default VideoEditor; 