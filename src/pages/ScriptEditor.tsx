import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Button, 
  Space, 
  Input, 
  Form, 
  Modal, 
  Slider,
  Tooltip,
  message,
  Card,
  Select,
  Tabs,
  Tag,
  Drawer,
  Row,
  Col,
  Divider,
  Dropdown,
  Menu,
  Radio,
  Checkbox
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SaveOutlined, 
  ExportOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  SettingOutlined,
  SoundOutlined,
  FileTextOutlined,
  RobotOutlined,
  ReloadOutlined,
  DownloadOutlined,
  VideoCameraOutlined,
  DragOutlined,
  DownOutlined,
  PauseCircleOutlined,
  ImportOutlined
} from '@ant-design/icons';
import { open } from '@tauri-apps/plugin-dialog';
import { ScriptSegment } from '../interfaces/index';
import ScriptTimeline from '../components/ScriptTimeline';
import { exportService, ExportOptions } from '../services/export';
import '../styles/ScriptEditor.less';
import { useLocation } from 'react-router-dom';
import aiService, { AIService, ExportFormat } from '../services/aiService';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 扩展ScriptSegment接口，添加UI需要的属性
interface ExtendedScriptSegment extends ScriptSegment {
  style?: string;
  timeText?: string; // 用于显示时间格式化文本
  duration: number; // 持续时间
  tone?: string; // 语调，可选
}

const ScriptEditor: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [scriptStyle, setScriptStyle] = useState('professional');
  const [emotionLevel, setEmotionLevel] = useState(3);
  const [detailLevel, setDetailLevel] = useState(3);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [playingSegmentId, setPlayingSegmentId] = useState<string | null>(null);
  const [videoTime, setVideoTime] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [scriptSegments, setScriptSegments] = useState<ExtendedScriptSegment[]>([
    {
      id: '1',
      startTime: 5, // 秒数
      duration: 10, // 持续时间（秒）
      content: '这是一个充满活力的开场，画面中主角笑容灿烂地向观众挥手致意。',
      style: 'professional',
      timeText: '00:00:05 - 00:00:15'
    },
    {
      id: '2',
      startTime: 16,
      duration: 14,
      content: '场景转换到一个精心布置的客厅，温馨的灯光照亮了整个空间，主角开始向观众介绍今天的主题。',
      style: 'professional',
      timeText: '00:00:16 - 00:00:30'
    },
    {
      id: '3',
      startTime: 31,
      duration: 14,
      content: '特写镜头展示了主角手中精致的工艺品，每一个细节都清晰可见，观众可以感受到制作的用心。',
      style: 'professional',
      timeText: '00:00:31 - 00:00:45'
    },
  ]);
  
  // 预览的完整脚本
  const fullScript = scriptSegments.map(segment => segment.content).join('\n\n');
  
  // 预览和编辑状态
  const [videoDuration, setVideoDuration] = useState(180); // 3分钟
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<ExtendedScriptSegment | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isExportDrawerVisible, setIsExportDrawerVisible] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'srt',
    outputPath: './output',
    includeMetadata: true,
  });
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('srt');

  const [form] = Form.useForm();

  // 解析URL参数获取项目ID
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('project');
    if (id) {
      setProjectId(id);
      message.info(`正在加载项目ID: ${id}的解说文案`);
      // 这里可以添加加载项目数据的逻辑
    }
  }, [location]);
  
  // 初始化示例视频URL
  useEffect(() => {
    // 实际应用中应该从项目中加载视频
    setVideoUrl('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4');
  }, []);

  // 格式化时间（秒转换为00:00:00格式）
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 解析时间文本（00:00:00格式转换为秒）
  const parseTimeText = (timeText: string): number => {
    const parts = timeText.split(':').map(Number);
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  };

  // 生成时间文本范围
  const getTimeRangeText = (startTime: number, duration: number): string => {
    const startText = formatTime(startTime);
    const endText = formatTime(startTime + duration);
    return `${startText} - ${endText}`;
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '时间点',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      render: (time: number) => formatTime(time),
    },
    {
      title: '持续时间',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration: number) => `${duration.toFixed(2)}秒`,
    },
    {
      title: '解说内容',
      dataIndex: 'content',
      key: 'content',
      render: (text: string, record: ExtendedScriptSegment) => (
        <div className="script-content">
          {text}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: ExtendedScriptSegment) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 编辑脚本段落
  const handleEdit = (segment: ExtendedScriptSegment) => {
    setCurrentSegment(segment);
    form.setFieldsValue({
      startTime: segment.startTime,
      duration: segment.duration,
      content: segment.content,
      style: segment.style,
    });
    setIsEditModalVisible(true);
  };

  // 保存编辑
  const handleSave = () => {
    form.validateFields().then(values => {
      if (currentSegment) {
        const newData = scriptSegments.map(item => 
          item.id === currentSegment.id 
            ? { 
                ...item, 
                ...values,
                timeText: getTimeRangeText(values.startTime, values.duration) 
              } 
            : item
        );
        setScriptSegments(newData);
        setIsEditModalVisible(false);
        message.success('修改成功');
      }
    });
  };

  // 删除脚本段落
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这段解说内容吗？',
      onOk() {
        const newData = scriptSegments.filter(item => item.id !== id);
        setScriptSegments(newData);
        message.success('删除成功');
      },
    });
  };

  // 添加新段落
  const handleAdd = () => {
    const newId = Date.now().toString();
    let newStartTime = 0;
    
    // 找到最后一个片段的结束时间
    if (scriptSegments.length > 0) {
      const lastSegment = [...scriptSegments].sort((a, b) => 
        (a.startTime + a.duration) - (b.startTime + b.duration)
      )[scriptSegments.length - 1];
      
      newStartTime = lastSegment.startTime + lastSegment.duration + 1;
    }
    
    const newSegment: ExtendedScriptSegment = {
      id: newId,
      startTime: newStartTime,
      duration: 10,
      content: '',
      style: 'professional',
      timeText: getTimeRangeText(newStartTime, 10)
    };
    
    setCurrentSegment(newSegment);
    form.setFieldsValue({
      startTime: newStartTime,
      duration: 10,
      content: '',
      style: 'professional',
    });
    
    setIsEditModalVisible(true);
  };

  // 保存新段落
  const handleAddSave = () => {
    form.validateFields().then(values => {
      if (currentSegment) {
        const newSegment: ExtendedScriptSegment = {
          ...currentSegment,
          ...values,
          timeText: getTimeRangeText(values.startTime, values.duration)
        };
        
        setScriptSegments([...scriptSegments, newSegment]);
        setIsEditModalVisible(false);
        message.success('添加成功');
      }
    });
  };

  // 导出脚本
  const handleExport = async () => {
    try {
      setExporting(true);

      if (!scriptSegments || scriptSegments.length === 0) {
        message.error('没有可导出的脚本内容');
        return;
      }

      // 将ExtendedScriptSegment转换为ScriptSegment
      const exportableScripts = scriptSegments.map(segment => ({
        id: segment.id,
        startTime: segment.startTime,
        endTime: segment.startTime + segment.duration,
        content: segment.content,
        tone: segment.style || "normal",
        associatedSceneIndex: 0
      }));

      // 使用已导入的aiService单例
      let exportedContent = '';
      let fileExtension = '';
      let mimeType = '';
      
      switch (exportFormat) {
        case 'plaintext':
          exportedContent = aiService.exportScript(exportableScripts, ExportFormat.PLAIN_TEXT);
          fileExtension = 'txt';
          mimeType = 'text/plain';
          break;
        case 'jianying':
          exportedContent = aiService.exportScript(exportableScripts, ExportFormat.JIANYING);
          fileExtension = 'json';
          mimeType = 'application/json';
          break;
        case 'srt':
          exportedContent = aiService.exportScript(exportableScripts, ExportFormat.SRT);
          fileExtension = 'srt';
          mimeType = 'text/plain';
          break;
        case 'fcpxml':
          exportedContent = aiService.exportScript(exportableScripts, ExportFormat.FINAL_CUT_PRO);
          fileExtension = 'fcpxml';
          mimeType = 'application/xml';
          break;
        default:
          throw new Error(`不支持的导出格式: ${exportFormat}`);
      }

      // 创建Blob对象
      const blob = new Blob([exportedContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const a = document.createElement('a');
      a.href = url;
      a.download = `script_export_${new Date().getTime()}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('导出成功');
      
      // 如果是剪映格式，显示使用说明
      if (exportFormat === 'jianying') {
        Modal.info({
          title: '剪映导入说明',
          content: (
            <div>
              <p>1. 成功导出了剪映格式的脚本文件</p>
              <p>2. 打开剪映应用后，点击"导入"或"+"按钮</p>
              <p>3. 选择"从草稿导入"，然后导入刚才下载的JSON文件</p>
              <p>4. 剪映会自动创建字幕轨道并导入所有脚本</p>
              <p>5. 如有问题，可以尝试查看剪映官方的导入教程</p>
            </div>
          ),
          width: 500,
        });
      }
    } catch (error: any) {
      console.error('导出失败:', error);
      message.error(`导出失败: ${error.message || '未知错误'}`);
    } finally {
      setExporting(false);
    }
  };

  // 生成解说文案
  const generateScript = () => {
    setLoading(true);
    message.loading('正在生成解说文案，请稍候...', 2.5)
      .then(() => {
        message.success('解说文案生成成功！');
        setLoading(false);
      });
  };
  
  // 保存解说文案
  const saveScript = () => {
    message.success('解说文案已保存');
  };
  
  // 更新单个片段内容
  const updateSegmentContent = (id: string, content: string) => {
    setScriptSegments(
      scriptSegments.map(segment => 
        segment.id === id ? { ...segment, content } : segment
      )
    );
  };

  // 重新生成单个片段
  const regenerateSegment = (id: string) => {
    message.loading(`正在重新生成第${id}段解说...`, 1.5)
      .then(() => {
        const newContent = '这是重新生成的解说内容，更加符合你选择的风格和情感程度。AI会根据视频内容智能调整描述的细节和表达方式。';
        updateSegmentContent(id, newContent);
        message.success('重新生成成功！');
      });
  };
  
  // 播放指定片段
  const playSegment = (id: string) => {
    setPlayingSegmentId(id);
    const segment = scriptSegments.find(s => s.id === id);
    if (segment && videoUrl) {
      const videoElement = document.getElementById('previewVideo') as HTMLVideoElement;
      if (videoElement) {
        videoElement.currentTime = segment.startTime;
        videoElement.play();
      }
    }
  };
  
  // 监听视频时间更新
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    setVideoTime(video.currentTime);
    
    // 检查是否需要停止播放
    if (playingSegmentId) {
      const segment = scriptSegments.find(s => s.id === playingSegmentId);
      if (segment) {
        const endTimeInSeconds = segment.startTime + segment.duration;
        
        if (video.currentTime >= endTimeInSeconds) {
          video.pause();
          setPlayingSegmentId(null);
        }
      }
    }
  };

  return (
    <div className="app-container">
      <Title level={3} className="page-title">
        解说编辑
        {projectId && <Text type="secondary" style={{ fontSize: 16, marginLeft: 16 }}>项目ID: {projectId}</Text>}
      </Title>
      <Paragraph>基于AI分析的视频内容生成专业解说文案，支持多种风格和自定义编辑</Paragraph>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <RobotOutlined />
              AI生成
            </span>
          } 
          key="1"
        >
          <Row gutter={24}>
            <Col span={14}>
              <Card title="解说文案内容" style={{ marginBottom: 24 }}>
                {scriptSegments.map((segment) => (
                  <div 
                    key={segment.id} 
                    style={{ 
                      marginBottom: 24, 
                      border: '1px solid #f0f0f0', 
                      padding: 16, 
                      borderRadius: 8,
                      boxShadow: playingSegmentId === segment.id ? '0 0 8px rgba(51, 102, 255, 0.5)' : 'none',
                      transition: 'box-shadow 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Space>
                        <DragOutlined style={{ cursor: 'move', color: '#999' }} />
                        <Text type="secondary">
                          片段 {segment.id} ({formatTime(segment.startTime)} - {formatTime(segment.startTime + segment.duration)})
                        </Text>
                      </Space>
                      <Space>
                        <Tooltip title="重新生成">
                          <Button 
                            icon={<ReloadOutlined />} 
                            size="small"
                            onClick={() => regenerateSegment(segment.id)}
                          />
                        </Tooltip>
                        <Tooltip title="预览朗读">
                          <Button 
                            icon={<SoundOutlined />} 
                            size="small"
                          />
                        </Tooltip>
                        <Tooltip title="在视频中预览">
                          <Button 
                            icon={<PlayCircleOutlined />} 
                            size="small"
                            onClick={() => playSegment(segment.id)}
                            type={playingSegmentId === segment.id ? 'primary' : 'default'}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                    <TextArea
                      value={segment.content}
                      onChange={(e) => updateSegmentContent(segment.id, e.target.value)}
                      autoSize={{ minRows: 2, maxRows: 6 }}
                    />
                    
                    <Space style={{ marginTop: 8 }}>
                      <Select 
                        size="small" 
                        defaultValue={segment.style} 
                        style={{ width: 120 }}
                        onChange={(value) => setScriptSegments(
                          scriptSegments.map(s => 
                            s.id === segment.id ? { ...s, style: value } : s
                          )
                        )}
                      >
                        <Option value="professional">专业解说</Option>
                        <Option value="humorous">幽默风趣</Option>
                        <Option value="dramatic">戏剧化</Option>
                        <Option value="educational">教育讲解</Option>
                      </Select>
                      <Button size="small" icon={<SettingOutlined />}>高级设置</Button>
                    </Space>
                  </div>
                ))}
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={() => {
                      const newId = (scriptSegments.length + 1).toString();
                      const lastSegment = scriptSegments[scriptSegments.length - 1];
                      const newStartTime = lastSegment ? lastSegment.startTime + lastSegment.duration : 0;
                      const newDuration = 15;
                      
                      setScriptSegments([
                        ...scriptSegments, 
                        {
                          id: newId,
                          startTime: newStartTime,
                          duration: newDuration,
                          content: '新增解说片段，在此编辑内容...',
                          style: 'professional',
                          timeText: getTimeRangeText(newStartTime, newDuration)
                        }
                      ]);
                    }}
                  >
                    添加片段
                  </Button>
                </div>
                
                <Divider />
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />}
                      onClick={saveScript}
                    >
                      保存解说
                    </Button>
                    
                    <Dropdown 
                      overlay={
                        <Menu>
                          <Menu.Item key="srt" icon={<FileTextOutlined />}>
                            导出SRT字幕
                          </Menu.Item>
                          <Menu.Item key="txt" icon={<FileTextOutlined />}>
                            导出纯文本
                          </Menu.Item>
                          <Menu.Item key="jianying" icon={<VideoCameraOutlined />}>
                            导出剪映草稿
                          </Menu.Item>
                        </Menu>
                      }
                    >
                      <Button icon={<DownloadOutlined />}>
                        导出 <DownOutlined />
                      </Button>
                    </Dropdown>
                  </Space>
                  
                  <Button 
                    type="primary" 
                    ghost
                    icon={<PlayCircleOutlined />}
                  >
                    完整预览
                  </Button>
                </div>
              </Card>
            </Col>
            
            <Col span={10}>
              <Card title="视频预览" style={{ marginBottom: 24 }}>
                {videoUrl ? (
                  <div style={{ textAlign: 'center' }}>
                    <video 
                      id="previewVideo"
                      src={videoUrl} 
                      controls 
                      style={{ width: '100%', borderRadius: 8 }}
                      onTimeUpdate={handleTimeUpdate}
                    />
                    <div style={{ marginTop: 8, textAlign: 'left' }}>
                      <Text type="secondary">当前时间: {formatTime(videoTime)}</Text>
                      
                      <div style={{ 
                        height: 32, 
                        background: '#f0f0f0', 
                        borderRadius: 4, 
                        marginTop: 8,
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {scriptSegments.map(segment => {
                          // 将时间转换为百分比位置
                          const startTimeInSeconds = segment.startTime;
                          const endTimeInSeconds = segment.startTime + segment.duration;
                          
                          // 假设视频总时长为10分钟
                          const totalDuration = 10 * 60;
                          
                          const startPercent = (startTimeInSeconds / totalDuration) * 100;
                          const widthPercent = ((endTimeInSeconds - startTimeInSeconds) / totalDuration) * 100;
                          
                          return (
                            <div 
                              key={segment.id}
                              style={{
                                position: 'absolute',
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                                height: '100%',
                                background: playingSegmentId === segment.id ? '#3366FF' : '#91caff',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease'
                              }}
                              onClick={() => playSegment(segment.id)}
                              title={`片段 ${segment.id}: ${formatTime(segment.startTime)} - ${formatTime(segment.startTime + segment.duration)}`}
                            />
                          );
                        })}
                        
                        {/* 播放位置指示器 */}
                        <div 
                          style={{
                            position: 'absolute',
                            left: `${(videoTime / (10 * 60)) * 100}%`,
                            width: 2,
                            height: '100%',
                            background: 'red',
                            zIndex: 2
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <VideoCameraOutlined style={{ fontSize: 48, opacity: 0.5 }} />
                    <p>暂无视频，请从项目中选择视频文件</p>
                  </div>
                )}
              </Card>
              
              <Card title="解说风格设置" style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>解说风格</Text>
                  </div>
                  <Select
                    defaultValue={scriptStyle}
                    onChange={setScriptStyle}
                    style={{ width: '100%' }}
                  >
                    <Option value="professional">专业解说</Option>
                    <Option value="humorous">幽默风趣</Option>
                    <Option value="dramatic">戏剧化</Option>
                    <Option value="educational">教育讲解</Option>
                    <Option value="storytelling">故事叙述</Option>
                  </Select>
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>情感程度</Text>
                  </div>
                  <Slider 
                    marks={{
                      1: '平淡',
                      3: '适中',
                      5: '强烈'
                    }}
                    min={1} 
                    max={5} 
                    defaultValue={emotionLevel}
                    onChange={(value) => setEmotionLevel(value)}
                  />
                </div>
                
                <div style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong>细节程度</Text>
                  </div>
                  <Slider 
                    marks={{
                      1: '简洁',
                      3: '适中',
                      5: '详细'
                    }}
                    min={1} 
                    max={5} 
                    defaultValue={detailLevel}
                    onChange={(value) => setDetailLevel(value)}
                  />
                </div>
                
                <div style={{ marginTop: 24 }}>
                  <Button 
                    type="primary" 
                    block 
                    icon={<RobotOutlined />} 
                    loading={loading}
                    onClick={generateScript}
                  >
                    生成解说文案
                  </Button>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8, textAlign: 'center' }}>
                    根据视频内容和设置生成专业解说
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <EditOutlined />
              手动编辑
            </span>
          } 
          key="2"
        >
          <Card>
            <Title level={4}>手动编辑解说文案</Title>
            <Paragraph>在此页面可以完全手动创建和编辑解说文案，不依赖AI生成</Paragraph>
            <TextArea 
              rows={12} 
              placeholder="在此输入您的解说文案..."
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button type="primary" icon={<SaveOutlined />}>保存解说</Button>
              <Button icon={<DownloadOutlined />}>导出SRT</Button>
            </div>
          </Card>
        </TabPane>
      </Tabs>

      {/* 编辑模态框 */}
      <Modal
        title={currentSegment && scriptSegments.some(item => item.id === currentSegment.id) ? "编辑解说" : "添加解说"}
        open={isEditModalVisible}
        onOk={currentSegment && scriptSegments.some(item => item.id === currentSegment.id) ? handleSave : handleAddSave}
        onCancel={() => setIsEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="startTime"
            label="开始时间(秒)"
            rules={[{ required: true, message: '请输入开始时间' }]}
          >
            <Slider min={0} max={videoDuration - 1} step={0.1} />
          </Form.Item>
          
          <Form.Item
            name="duration"
            label="持续时间(秒)"
            rules={[{ required: true, message: '请输入持续时间' }]}
          >
            <Slider min={1} max={60} step={0.1} />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="解说内容"
            rules={[{ required: true, message: '请输入解说内容' }]}
          >
            <TextArea rows={6} placeholder="请输入解说内容..." />
          </Form.Item>
          
          <Form.Item
            name="style"
            label="解说风格"
          >
            <Select>
              <Option value="professional">专业解说</Option>
              <Option value="humorous">幽默风趣</Option>
              <Option value="dramatic">戏剧化</Option>
              <Option value="educational">教育讲解</Option>
              <Option value="storytelling">故事叙述</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 导出抽屉 */}
      <Drawer
        title="导出设置"
        placement="right"
        width={400}
        open={isExportDrawerVisible}
        onClose={() => setIsExportDrawerVisible(false)}
        extra={
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            loading={exporting}
            disabled={!scriptSegments || scriptSegments.length === 0}
          >
            开始导出
          </Button>
        }
      >
        <Form layout="vertical">
          <Form.Item label="导出格式">
            <Radio.Group 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <Radio.Button value="plaintext">纯文本</Radio.Button>
              <Radio.Button value="jianying">
                <Tooltip title="导出为剪映可导入的格式">
                  剪映格式
                </Tooltip>
              </Radio.Button>
              <Radio.Button value="srt">SRT字幕</Radio.Button>
              <Radio.Button value="fcpxml">Final Cut Pro</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ScriptEditor; 