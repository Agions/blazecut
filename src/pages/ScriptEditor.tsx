import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, 
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
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined, 
  SaveOutlined, 
  PlayCircleOutlined,
  FileTextOutlined,
  RobotOutlined,
  ReloadOutlined,
  DownloadOutlined,
  VideoCameraOutlined,
  DownOutlined,
  PauseCircleOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { ScriptSegment } from '../interfaces/index';
import '../styles/ScriptEditor.less';
import { useLocation } from 'react-router-dom';
import aiService, { ExportFormat, VideoAnalysisResult } from '../services/aiService';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 脚本片段扩展接口，添加UI所需的额外属性
interface ExtendedScriptSegment extends ScriptSegment {
  style?: string;         // 片段风格
  timeText?: string;      // 格式化的时间文本
  duration: number;       // 持续时间（秒）
  tone?: string;          // 语调
  isGenerating?: boolean; // 是否正在生成中
  favorite?: boolean;     // 是否收藏
  version?: number;       // 版本号
  audioUrl?: string;      // 音频预览URL
  tags?: string[];        // 标签
}

// 项目数据接口
interface ProjectData {
  id: string;                      // 项目ID
  name: string;                    // 项目名称
  videoUrl: string;                // 视频URL
  thumbnailUrl?: string;           // 缩略图URL
  duration: number;                // 视频时长（秒）
  analysisResults?: any;           // 视频分析结果
  script?: ExtendedScriptSegment[]; // 脚本内容
  lastModified: Date;              // 最后修改时间
  author?: string;                 // 作者
  description?: string;            // 项目描述
  category?: string;               // 项目分类
  tags?: string[];                 // 项目标签
  isPublic?: boolean;              // 是否公开
  views?: number;                  // 浏览量
  status?: 'draft' | 'published';  // 项目状态
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
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [scriptSegments, setScriptSegments] = useState<ExtendedScriptSegment[]>([]);
  const [analysisData, setAnalysisData] = useState<VideoAnalysisResult | null>(null);
  // 预览和编辑状态
  const [videoDuration, setVideoDuration] = useState(180); // 3分钟
  const [currentSegment, setCurrentSegment] = useState<ExtendedScriptSegment | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isExportDrawerVisible, setIsExportDrawerVisible] = useState(false);
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
  
  // 加载项目数据
  const loadProjectData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      // 这里应该是从API加载项目数据
      // 模拟加载项目数据
      const mockProjectData: ProjectData = {
        id,
        name: `项目 ${id}`,
        videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        duration: 180, // 3分钟
        lastModified: new Date(),
        analysisResults: {
          scenes: [
            { startTime: 0, endTime: 12, description: '开场画面，花朵特写' },
            { startTime: 13, endTime: 25, description: '花朵随风摇摆' },
            { startTime: 26, endTime: 40, description: '特写镜头，展示花朵细节' }
          ],
          keywords: ['花', '自然', '特写', '美丽'],
          summary: '这是一段展示花朵特写的视频，画面美丽而平静。'
        }
      };

      setProjectData(mockProjectData);
      setVideoUrl(mockProjectData.videoUrl);
      setVideoDuration(mockProjectData.duration);
      setAnalysisData(mockProjectData.analysisResults);

      // 如果已有脚本数据，加载它
      if (mockProjectData.script && mockProjectData.script.length > 0) {
        setScriptSegments(mockProjectData.script);
      } else {
        // 否则准备根据分析结果生成
        prepareSegmentsFromAnalysis(mockProjectData.analysisResults);
      }

      message.success(`成功加载项目: ${mockProjectData.name}`);
    } catch (error: any) {
      console.error('加载项目失败:', error);
      message.error(`加载项目失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // 从分析结果创建脚本段落框架
  const prepareSegmentsFromAnalysis = (analysisResults: any) => {
    if (!analysisResults || !analysisResults.scenes) {
      return;
    }

    const newSegments: ExtendedScriptSegment[] = analysisResults.scenes.map((scene: any, index: number) => ({
      id: (index + 1).toString(),
      startTime: scene.startTime,
      duration: scene.endTime - scene.startTime,
      content: scene.description || '',  // 暂时使用场景描述作为内容占位符
      style: 'professional',
      timeText: getTimeRangeText(scene.startTime, scene.endTime - scene.startTime)
    }));

    setScriptSegments(newSegments);
  };

  // 初始化项目数据
  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    } else {
      // 没有项目ID时，设置默认值
      setVideoUrl('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4');
      setScriptSegments([]);
    }
  }, [projectId, loadProjectData]);

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

  // 已使用卡片布局替代表格，不再需要表格列定义

  // 预览的完整脚本
  const fullScript = scriptSegments.map(segment => segment.content).join('\n\n');


  // 编辑脚本段落
  const handleEdit = (segment: ExtendedScriptSegment) => {
    setCurrentSegment(segment);
    
    // 处理时间文本转换，确保时间格式正确
    const segmentStartTime = segment.startTime || (
      segment.timeText ? parseTimeText(segment.timeText.split(' - ')[0]) : 0
    );
    
    form.setFieldsValue({
      startTime: segmentStartTime,
      duration: segment.duration || 10,
      content: segment.content || '',
      style: segment.style || 'professional',
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
  const generateScript = async () => {
    if (!analysisData) {
      message.error('缺少视频分析数据，无法生成解说文案');
      return;
    }
    
    try {
      setLoading(true);
      message.loading('正在生成解说文案，请稍候...', 0);
      
      // 使用AIService生成脚本
      const results = await aiService.generateScript({
        analysisData,
        style: scriptStyle,
        emotionLevel,
        detailLevel,
        segments: scriptSegments.map(segment => ({
          id: segment.id,
          startTime: segment.startTime,
          endTime: segment.startTime + segment.duration,
          content: segment.content || '',
          associatedSceneIndex: parseInt(segment.id) - 1
        }))
      });
      
      // 更新脚本段落
      if (results && results.segments) {
        const newSegments = results.segments.map(segment => {
          // 找到对应的旧段落以保留UI相关属性
          const existingSegment = scriptSegments.find(s => s.id === segment.id);
          
          return {
            ...segment,
            duration: segment.endTime - segment.startTime,
            style: existingSegment?.style || 'professional',
            timeText: getTimeRangeText(segment.startTime, segment.endTime - segment.startTime)
          };
        });
        
        setScriptSegments(newSegments);
        message.success('解说文案生成成功！');
      } else {
        throw new Error('生成结果格式不正确');
      }
    } catch (error: any) {
      console.error('生成解说文案失败:', error);
      message.error(`生成解说文案失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 保存解说文案
  const saveScript = async () => {
    try {
      if (!projectId) {
        message.warning('无项目ID，无法保存');
        return;
      }
      
      setLoading(true);
      message.loading('正在保存解说文案...', 0);
      
      // 这里应该是调用API保存脚本数据
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 更新本地项目数据
      if (projectData) {
        setProjectData({
          ...projectData,
          script: scriptSegments,
          lastModified: new Date()
        });
      }
      
      message.success('解说文案已保存');
    } catch (error: any) {
      console.error('保存失败:', error);
      message.error(`保存失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
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
  const regenerateSegment = async (id: string) => {
    if (!analysisData) {
      message.error('缺少视频分析数据，无法重新生成');
      return;
    }
    
    try {
      message.loading(`正在重新生成第${id}段解说...`, 0);
      
      // 找到当前段落
      const segment = scriptSegments.find(s => s.id === id);
      if (!segment) {
        throw new Error('未找到指定段落');
      }
      
      // 使用AIService重新生成单个段落
      const result = await aiService.regenerateSegment({
        segment: {
          id: segment.id,
          startTime: segment.startTime,
          endTime: segment.startTime + segment.duration,
          content: segment.content || '',
          associatedSceneIndex: parseInt(segment.id) - 1
        },
        analysisData,
        style: segment.style || scriptStyle,
        emotionLevel,
        detailLevel
      });
      
      if (result && result.content) {
        updateSegmentContent(id, result.content);
        message.success('重新生成成功！');
      } else {
        throw new Error('生成结果格式不正确');
      }
    } catch (error: any) {
      console.error('重新生成失败:', error);
      message.error(`重新生成失败: ${error.message || '未知错误'}`);
    }
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
                    className={`script-segment-card ${playingSegmentId === segment.id ? 'playing' : ''}`}
                    style={{ 
                      marginBottom: 24, 
                      border: '1px solid #f0f0f0', 
                      padding: 20, 
                      borderRadius: 8,
                      background: playingSegmentId === segment.id ? 'rgba(24, 144, 255, 0.05)' : '#fff',
                      boxShadow: playingSegmentId === segment.id ? '0 2px 8px rgba(24, 144, 255, 0.15)' : '0 1px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => playSegment(segment.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          style={{ 
                            fontWeight: 600, 
                            marginRight: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: playingSegmentId === segment.id ? '#1890ff' : '#f5f5f5',
                            color: playingSegmentId === segment.id ? '#fff' : '#333' 
                          }}
                        >
                          {segment.id}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>
                            {formatTime(segment.startTime)} - {formatTime(segment.startTime + segment.duration)}
                          </div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            时长: {segment.duration.toFixed(1)}秒
                            {segment.style && <Tag color="blue" style={{ marginLeft: 8 }}>{segment.style === 'professional' ? '专业解说' : 
                                         segment.style === 'humorous' ? '幽默风趣' : 
                                         segment.style === 'dramatic' ? '戏剧化' : 
                                         segment.style === 'educational' ? '教育讲解' : 
                                         segment.style === 'storytelling' ? '故事叙述' : segment.style}
                            </Tag>}
                          </div>
                        </div>
                      </div>
                      
                      <Space>
                        <Tooltip title="播放片段">
                          <Button 
                            type="text"
                            shape="circle"
                            icon={playingSegmentId === segment.id ? <PauseCircleOutlined style={{ color: '#1890ff' }} /> : <PlayCircleOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (playingSegmentId === segment.id) {
                                const video = document.getElementById('previewVideo') as HTMLVideoElement;
                                if (video) video.pause();
                                setPlayingSegmentId(null);
                              } else {
                                playSegment(segment.id);
                              }
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="重新生成">
                          <Button 
                            type="text"
                            shape="circle"
                            icon={<ReloadOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              regenerateSegment(segment.id);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="编辑片段">
                          <Button 
                            type="text"
                            shape="circle"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(segment);
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="删除片段">
                          <Button 
                            type="text"
                            shape="circle"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(segment.id);
                            }}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                    
                    <Divider style={{ margin: '8px 0 16px' }} />
                    
                    <div className="segment-content">
                      <TextArea
                        value={segment.content}
                        onChange={(e) => {
                          e.stopPropagation(); // 防止冒泡触发卡片点击事件
                          updateSegmentContent(segment.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        autoSize={{ minRows: 3, maxRows: 6 }}
                        style={{ fontSize: 14, border: '1px solid #d9d9d9', padding: '8px 12px', lineHeight: 1.6 }}
                        placeholder="请输入解说内容..."
                      />
                    </div>
                    
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Select 
                        size="middle" 
                        value={segment.style || 'professional'} 
                        style={{ width: 140 }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(value) => setScriptSegments(
                          scriptSegments.map(s => 
                            s.id === segment.id ? { ...s, style: value } : s
                          )
                        )}
                        placeholder="选择风格"
                      >
                        <Option value="professional">专业解说</Option>
                        <Option value="humorous">幽默风趣</Option>
                        <Option value="dramatic">戏剧化</Option>
                        <Option value="educational">教育讲解</Option>
                        <Option value="storytelling">故事叙述</Option>
                      </Select>
                      
                      <Button 
                        size="small" 
                        type="link" 
                        icon={<ReloadOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          regenerateSegment(segment.id);
                        }}
                      >
                        重新生成
                      </Button>
                    </div>
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
                    
                    <Button 
                      icon={<PlusOutlined />} 
                      onClick={handleAdd}
                      style={{ marginRight: 8 }}
                    >
                      添加段落
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
                  
                  <Tooltip title="查看完整解说文案">
                    <Button 
                      type="primary" 
                      ghost
                      icon={<PlayCircleOutlined />}
                      onClick={() => {
                        Modal.info({
                          title: '解说文案完整预览',
                          width: 600,
                          content: (
                            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                              {fullScript.split('\n').map((line, index) => (
                                <Paragraph key={index}>{line || <br />}</Paragraph>
                              ))}
                            </div>
                          )
                        });
                      }}
                    >
                      完整预览
                    </Button>
                  </Tooltip>
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
              
              <Card 
                title={<span style={{ fontSize: 16 }}><RobotOutlined /> 解说风格设置</span>}
                style={{ marginBottom: 24 }}
                bordered={false}
                className="style-settings-card"
              >
                <div style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 15 }}>解说风格</Text>
                    <Tooltip title="选择适合你视频内容的解说风格">
                      <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                    </Tooltip>
                  </div>
                  <Select
                    value={scriptStyle}
                    onChange={setScriptStyle}
                    style={{ width: '100%' }}
                    size="large"
                    dropdownStyle={{ padding: '8px 4px' }}
                  >
                    <Option value="professional">
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 500 }}>专业解说</div>
                        <div style={{ fontSize: 12, color: '#888' }}>适合正式场合、知识性内容</div>
                      </div>
                    </Option>
                    <Option value="humorous">
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 500 }}>幽默风趣</div>
                        <div style={{ fontSize: 12, color: '#888' }}>活泼生动，适合轻松娱乐内容</div>
                      </div>
                    </Option>
                    <Option value="dramatic">
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 500 }}>戏剧化</div>
                        <div style={{ fontSize: 12, color: '#888' }}>强调张力，适合情节剧或故事性内容</div>
                      </div>
                    </Option>
                    <Option value="educational">
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 500 }}>教育讲解</div>
                        <div style={{ fontSize: 12, color: '#888' }}>清晰明了，适合教学或说明类内容</div>
                      </div>
                    </Option>
                    <Option value="storytelling">
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 500 }}>故事叙述</div>
                        <div style={{ fontSize: 12, color: '#888' }}>讲故事式风格，适合叙事性内容</div>
                      </div>
                    </Option>
                  </Select>
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 15 }}>情感程度</Text>
                    <div>
                      <span style={{ marginRight: 8, fontSize: 14 }}>当前: {emotionLevel}</span>
                      <Tooltip title="调整解说的情感表达强度">
                        <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                      </Tooltip>
                    </div>
                  </div>
                  <Slider 
                    marks={{
                      1: '平淡',
                      3: '适中',
                      5: '强烈'
                    }}
                    min={1} 
                    max={5} 
                    value={emotionLevel}
                    onChange={(value) => setEmotionLevel(value)}
                    tooltip={{ formatter: (value) => `${value}` }}
                    trackStyle={{ backgroundColor: '#1890ff' }}
                    handleStyle={{ borderColor: '#1890ff', boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)' }}
                  />
                </div>
                
                <div style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 15 }}>细节程度</Text>
                    <div>
                      <span style={{ marginRight: 8, fontSize: 14 }}>当前: {detailLevel}</span>
                      <Tooltip title="调整解说内容的详细程度">
                        <QuestionCircleOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
                      </Tooltip>
                    </div>
                  </div>
                  <Slider 
                    marks={{
                      1: '简洁',
                      3: '适中',
                      5: '详细'
                    }}
                    min={1} 
                    max={5} 
                    value={detailLevel}
                    onChange={(value) => setDetailLevel(value)}
                    tooltip={{ formatter: (value) => `${value}` }}
                    trackStyle={{ backgroundColor: '#1890ff' }}
                    handleStyle={{ borderColor: '#1890ff', boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)' }}
                  />
                </div>
                
                <Divider style={{ margin: '16px 0' }} />
                
                <div style={{ marginTop: 16 }}>
                  <Button 
                    type="primary" 
                    block 
                    size="large"
                    icon={<ThunderboltOutlined />} 
                    loading={loading}
                    onClick={generateScript}
                    style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                  >
                    智能生成解说文案
                  </Button>
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <BulbOutlined style={{ color: '#faad14', marginRight: 8 }} />
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      根据视频内容和设置生成专业解说，AI将分析视频内容并自动匹配最佳表达
                    </Text>
                  </div>
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
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {currentSegment && scriptSegments.some(item => item.id === currentSegment.id) ? 
              <><EditOutlined style={{ marginRight: 8, color: '#1890ff' }} /> 编辑解说片段</> : 
              <><PlusOutlined style={{ marginRight: 8, color: '#52c41a' }} /> 添加新的解说片段</>}
          </div>
        }
        open={isEditModalVisible}
        onOk={currentSegment && scriptSegments.some(item => item.id === currentSegment.id) ? handleSave : handleAddSave}
        onCancel={() => setIsEditModalVisible(false)}
        okText="保存片段"
        cancelText="取消"
        width={700}
        centered
        bodyStyle={{ padding: '24px 32px' }}
        okButtonProps={{ icon: <SaveOutlined /> }}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>开始时间</span>
                    <span style={{ color: '#888', fontWeight: 'normal' }}>
                      {form.getFieldValue('startTime') !== undefined ? formatTime(form.getFieldValue('startTime')) : '00:00:00'}
                    </span>
                  </div>
                }
                rules={[{ required: true, message: '请设置开始时间' }]}
              >
                <Slider 
                  min={0} 
                  max={videoDuration - 1} 
                  step={0.1} 
                  tooltip={{ formatter: (value) => formatTime(value || 0) }}
                  trackStyle={{ backgroundColor: '#1890ff' }}
                  handleStyle={{ borderColor: '#1890ff', boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)' }}
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="duration"
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>持续时间</span>
                    <span style={{ color: '#888', fontWeight: 'normal' }}>
                      {form.getFieldValue('duration') !== undefined ? `${form.getFieldValue('duration').toFixed(1)}秒` : '5.0秒'}
                    </span>
                  </div>
                }
                rules={[{ required: true, message: '请设置持续时间' }]}
              >
                <Slider 
                  min={1} 
                  max={60} 
                  step={0.1} 
                  tooltip={{ formatter: (value) => `${value?.toFixed(1) || 0}秒` }}
                  trackStyle={{ backgroundColor: '#1890ff' }}
                  handleStyle={{ borderColor: '#1890ff', boxShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="style"
            label="片段风格"
          >
            <Select placeholder="选择此片段的风格（可选）">
              <Option value="professional">专业解说</Option>
              <Option value="humorous">幽默风趣</Option>
              <Option value="dramatic">戏剧化</Option>
              <Option value="educational">教育讲解</Option>
              <Option value="storytelling">故事叙述</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="content"
            label={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>解说内容</span>
                <span style={{ color: '#888', fontWeight: 'normal' }}>
                  {form.getFieldValue('content') ? `${form.getFieldValue('content').length} 字符` : '0 字符'}
                </span>
              </div>
            }
            rules={[{ required: true, message: '请输入解说内容' }]}
          >
            <TextArea 
              rows={8} 
              placeholder="请输入解说内容..."
              showCount 
              maxLength={500}
              style={{ resize: 'none', fontSize: 14 }}
              onChange={(e) => {
                form.setFieldsValue({ content: e.target.value });
                form.validateFields(['content']);
              }}
            />
          </Form.Item>
          
          <div style={{ textAlign: 'right' }}>
            <Button 
              type="default"
              icon={<PlayCircleOutlined />}
              style={{ marginRight: 8 }}
              onClick={() => {
                const values = form.getFieldsValue();
                if (values.startTime !== undefined) {
                  const video = document.getElementById('previewVideo') as HTMLVideoElement;
                  if (video) {
                    video.currentTime = values.startTime;
                    video.play();
                  }
                }
              }}
            >
              预览时间点
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => {
                if (currentSegment && scriptSegments.some(item => item.id === currentSegment.id)) {
                  regenerateSegment(currentSegment.id);
                  setIsEditModalVisible(false);
                }
              }}
              disabled={!(currentSegment && scriptSegments.some(item => item.id === currentSegment.id))}
            >
              AI重新生成
            </Button>
          </div>
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