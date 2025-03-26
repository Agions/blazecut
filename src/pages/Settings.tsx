import React, { useState, useEffect, useCallback } from 'react';
import { 
  Typography, Card, Tabs, Form, Switch, Input, Button, 
  Select, Radio, Slider, Space, Divider, message, Row, Col,
  Statistic, Progress, Alert, List, Modal,
  Spin, Tag, Tooltip
} from 'antd';
import { 
  SaveOutlined, 
  SettingOutlined, 
  CloudOutlined,
  ToolOutlined,
  FolderOutlined,
  PieChartOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  BgColorsOutlined,
  EyeOutlined,
  EditOutlined,
  LinkOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import { Store } from '@tauri-apps/plugin-store';
import { AIServiceFactory } from '../services/ai';
import { AIModelType } from '../services/ai';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// 添加用户设备类型
interface UserDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'tablet';
  lastSync: string;
  isCurrentDevice: boolean;
}

// 应用使用统计
interface AppStats {
  totalProjects: number;
  totalVideos: number;
  totalScripts: number;
  totalExports: number;
  timeSpent: number; // 分钟
  storageUsed: number; // MB
}

// 获取 AI 服务实例
const aiService = AIServiceFactory.getInstance();

// 创建 APIKeyManager 类来管理API密钥
class APIKeyManager {
  private keys: Record<string, string> = {};
  
  constructor() {
    this.loadKeys();
  }
  
  // 保存密钥到本地存储
  saveKeys() {
    localStorage.setItem('api-keys', JSON.stringify(this.keys));
  }
  
  // 从本地存储加载密钥
  loadKeys() {
    const savedKeys = localStorage.getItem('api-keys');
    if (savedKeys) {
      try {
        this.keys = JSON.parse(savedKeys);
      } catch (e) {
        console.error('Failed to parse saved API keys', e);
        this.keys = {};
      }
    }
  }
  
  // 设置特定类型的API密钥
  setKey(type: string, key: string) {
    this.keys[type] = key;
    this.saveKeys();
  }
  
  // 获取特定类型的API密钥
  getKey(type: string): string {
    return this.keys[type] || '';
  }
  
  // 检查是否有特定类型的API密钥
  hasKey(type: string): boolean {
    return !!this.keys[type];
  }
  
  // 获取加密显示的API密钥（只显示前4位和后4位，中间用*替代）
  getMaskedKey(type: string): string {
    const key = this.getKey(type);
    if (!key) return '';
    
    if (key.length <= 8) return key;
    
    const prefix = key.substring(0, 4);
    const suffix = key.substring(key.length - 4);
    const maskedPart = '*'.repeat(Math.min(key.length - 8, 20));
    
    return `${prefix}${maskedPart}${suffix}`;
  }
}

// 创建密钥管理器实例
const keyManager = new APIKeyManager();

// 在 Settings 组件内部初始化 Store

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loaded, setLoaded] = useState(false);
  const [themePreview, setThemePreview] = useState<'light' | 'dark' | 'system'>('light');
  const [customPalette, setCustomPalette] = useState<string>('default');
  const [, setIsSyncing] = useState(false); // 未使用变量用下划线忽略
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  // 添加强制更新函数
  const [, setForceUpdate] = useState({});
  const forceUpdate = () => setForceUpdate({});
  
  // 用户设备数据
  const [userDevices, setUserDevices] = useState<UserDevice[]>([
    {
      id: '1',
      name: '我的MacBook Pro',
      type: 'desktop',
      lastSync: '2023-08-25 14:30:20',
      isCurrentDevice: true
    },
    {
      id: '2',
      name: 'iPhone 14 Pro',
      type: 'mobile',
      lastSync: '2023-08-24 09:15:32',
      isCurrentDevice: false
    },
    {
      id: '3',
      name: 'iPad Air',
      type: 'tablet',
      lastSync: '2023-08-20 18:45:10',
      isCurrentDevice: false
    }
  ]);
  
  // 应用统计数据
  const [appStats, setAppStats] = useState<AppStats>({
    totalProjects: 15,
    totalVideos: 32,
    totalScripts: 43,
    totalExports: 28,
    timeSpent: 1240, // 约20.6小时
    storageUsed: 1250 // 1.25 GB
  });
  
  // 获取应用使用统计数据
  const loadAppStats = useCallback(async () => {
    try {
      // 这里可以从API或本地存储获取真实的统计数据
      // 目前使用模拟数据
      const stats: AppStats = {
        totalProjects: 15,
        totalVideos: 32,
        totalScripts: 43,
        totalExports: 28,
        timeSpent: 1240,
        storageUsed: 1250
      };
      
      setAppStats(stats);
    } catch (error) {
      console.error('加载应用统计数据失败:', error);
    }
  }, []);
  
  // 初始化设置存储
  const [settingsStore, setSettingsStore] = useState<Store | null>(null);
  
  // 初始化 Store
  useEffect(() => {
    const initStore = async () => {
      try {
        // 正确的 Store 初始化方式
        // @ts-expect-error - Store 的类型声明可能与实际实现不匹配
        const store = new Store('.settings.json');
        await store.load(); // 加载存储的数据
        setSettingsStore(store);
      } catch (error) {
        console.error('初始化 Store 失败:', error);
        message.error('初始化设置存储失败');
        // 即使出错也重置加载状态
        setLoading(false);
        setLoaded(true);
      }
    };
    
    initStore();
    
    // 添加超时处理，确保不会一直显示加载状态
    const timeoutId = window.setTimeout(() => {
      if (!loaded) {
        console.warn('设置加载超时，显示默认设置');
        setLoading(false);
        setLoaded(true);
      }
    }, 5000); // 5秒超时
    
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loaded]);
  
  // 加载设置数据
  useEffect(() => {
    if (!settingsStore) return;
    
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // 加载主题设置
        const savedTheme = ((await settingsStore.get('theme')) || 'light') as 'light' | 'dark' | 'system';
        const savedPalette = ((await settingsStore.get('colorPalette')) || 'default') as string;
        
        // 加载完整设置并填充表单
        const generalSettings = await settingsStore.get('generalSettings') || {};
        const aiSettings = await settingsStore.get('aiSettings') || {};
        const userSettings = await settingsStore.get('userSettings') || {};
        const advancedSettings = await settingsStore.get('advancedSettings') || {};
        const evaluationSettings = await settingsStore.get('evaluationSettings') || {};
        
        // 设置表单初始值
        form.setFieldsValue({
          ...generalSettings,
          ...aiSettings,
          ...userSettings,
          ...advancedSettings,
          ...evaluationSettings,
          theme: savedTheme,
          colorPalette: savedPalette,
          defaultModelType: 'qianwen',
          defaultStyle: 'formal',
          detailLevel: 'standard',
          emotionLevel: 'moderate',
          targetAudience: 'general'
        });
        
        // 加载保存的API密钥
        keyManager.loadKeys();
        
        // 更新主题预览
        setThemePreview(savedTheme);
        setCustomPalette(savedPalette);
        
        // 获取实际统计数据
        await loadAppStats();
        
        setLoaded(true);
      } catch (error) {
        console.error('加载设置失败:', error);
        message.error('加载设置失败，使用默认设置');
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [form, settingsStore, loadAppStats]);
  
  // 当主题设置改变时，更新预览
  useEffect(() => {
    const themeValue = form.getFieldValue('theme');
    if (themeValue) {
      setThemePreview(themeValue);
    }
  }, [form]);
  

  
  // 保存设置
  const handleSave = async () => {
    try {
      if (!settingsStore) {
        message.error('设置存储未初始化');
        return;
      }
      
      const values = await form.validateFields();
      console.log('保存设置:', values);
      
      // 提取不同类别的设置
      const { 
        theme: themeValue, colorPalette, language, autoSave, autoSaveInterval, outputFormat, maxHistoryItems,
        aiProvider, apiKey, model, maxTokens, temperature, enableLocalProcessing,
        username, email, preferences, autoSync,
        debugMode, gpuAcceleration, maxParallelProcesses, cacheDirectory,
        defaultMetrics, autoEvaluate, evaluationFrequency, saveEvaluationResults
      } = values;
      
      // 分类存储设置
      const generalSettings = { language, autoSave, autoSaveInterval, outputFormat, maxHistoryItems };
      const aiSettings = { aiProvider, apiKey, model, maxTokens, temperature, enableLocalProcessing };
      const userSettings = { username, email, preferences, autoSync };
      const advancedSettings = { debugMode, gpuAcceleration, maxParallelProcesses, cacheDirectory };
      const evaluationSettings = { defaultMetrics, autoEvaluate, evaluationFrequency, saveEvaluationResults };
      
      // 保存到 store
      await settingsStore.set('theme', themeValue);
      await settingsStore.set('colorPalette', colorPalette);
      await settingsStore.set('generalSettings', generalSettings);
      await settingsStore.set('aiSettings', aiSettings);
      await settingsStore.set('userSettings', userSettings);
      await settingsStore.set('advancedSettings', advancedSettings);
      await settingsStore.set('evaluationSettings', evaluationSettings);
      await settingsStore.save(); // 保存到磁盘
      
      // 更新主题
      if (themeValue && themeValue !== theme) {
        setTheme(themeValue);
      }
      
      // 更新 AI 服务设置
      await aiService.updateSettings({
        provider: aiProvider,
        apiKey,
        model,
        maxTokens,
        temperature,
        evaluationMetrics: {
          enableAutoEval: autoEvaluate,
          defaultMetrics: defaultMetrics,
          compareModelsAfterEval: evaluationFrequency === 'after_each_use'
        }
      });
      
      // 显示成功消息
      message.success('设置已保存');
      
      // 如果启用了自动同步，则开始同步
      if (autoSync) {
        syncWithOtherDevices();
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    }
  };
  
  // 重置设置
  const resetSettings = () => {
    Modal.confirm({
      title: '重置设置',
      content: '确定要将所有设置重置为默认值吗？这将不可撤销。',
      onOk: () => {
        form.resetFields();
        message.info('已重置为默认设置');
      },
      okText: '确认重置',
      cancelText: '取消'
    });
  };
  
  // 同步设置到其他设备
  const syncWithOtherDevices = () => {
    setIsSyncing(true);
    
    // 模拟同步过程
    setTimeout(() => {
      setIsSyncing(false);
      
      // 更新设备同步时间
      const updatedDevices = userDevices.map(device => ({
        ...device,
        lastSync: device.isCurrentDevice ? 
          new Date().toLocaleString('zh-CN', { hour12: false }) : 
          device.lastSync
      }));
      
      setUserDevices(updatedDevices);
      message.success('设置已同步到所有设备');
    }, 2000);
  };
  
  
  // 打开主题预览模态框
  const openThemePreview = () => {
    setShowThemeModal(true);
  };
  
  // API密钥管理函数
  const handleApiKeyChange = (type: AIModelType, value: string) => {
    // 直接保存到密钥管理器
    keyManager.setKey(type, value);
    
    // 如果使用了AIService的updateSettings方法进行更新
    aiService.updateSettings({
      provider: form.getFieldValue('aiProvider'),
      apiKey: value,
      model: type // 使用model参数代替keyType
    });
    
    // 强制重新渲染，以更新UI显示
    forceUpdate();
  };
  
  // 编辑API密钥
  const handleEditApiKey = (type: AIModelType) => {
    // 这里可以实现更复杂的编辑逻辑，如打开模态框等
    // 目前简单地清除密钥，让用户重新输入
    keyManager.setKey(type, '');
    // 强制重新渲染
    forceUpdate();
  };
  
  // 格式化持续时间
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };
  
  // 格式化存储空间
  const formatStorage = (mb: number): string => {
    if (mb < 1000) {
      return `${mb} MB`;
    } else {
      return `${(mb / 1000).toFixed(2)} GB`;
    }
  };

  return (
    <div className="app-container">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <Spin size="large" tip="加载设置中..." />
          <div style={{ marginLeft: 16 }}>
            <Button type="link" onClick={() => {
              setLoading(false);
              setLoaded(true);
              message.info('已切换到默认设置');
            }}>
              加载时间过长？点击继续
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Title level={3} className="page-title">系统设置</Title>
          <Paragraph>配置应用的常规设置、AI参数、输出格式等</Paragraph>
      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ height: '100%' }}>
            <Statistic 
              title="总项目数" 
              value={appStats.totalProjects} 
              prefix={<PieChartOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ height: '100%' }}>
            <Statistic 
              title="总使用时间" 
              value={formatDuration(appStats.timeSpent)} 
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ height: '100%' }}>
            <Statistic 
              title="存储空间使用" 
              value={formatStorage(appStats.storageUsed)} 
              prefix={<FolderOutlined />} 
            />
          </Card>
        </Col>
        
        {/* AI 模型使用情况 */}
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ height: '100%' }}>
            <Statistic 
              title="AI 分析总次数" 
              value={aiService.getServiceStats().totalEvaluations} 
              prefix={<PieChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ height: '100%' }}>
            <Statistic 
              title="平均质量得分" 
              value={aiService.getServiceStats().averageQualityScore.toFixed(1)} 
              suffix="/ 10"
              prefix={<EyeOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Tabs defaultActiveKey="general">
          <TabPane 
            tab={<span><SettingOutlined />常规设置</span>}
            key="general"
          >
            <Form 
              form={form}
              layout="vertical"
              initialValues={{
                theme: 'light',
                colorPalette: 'default',
                language: 'zh-CN',
                autoSave: true,
                autoSaveInterval: 5,
                outputFormat: 'srt',
                maxHistoryItems: 10
              }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={16}>
                  <Form.Item label="界面主题" name="theme">
                    <Radio.Group onChange={(e) => setThemePreview(e.target.value)}>
                      <Radio.Button value="light">浅色</Radio.Button>
                      <Radio.Button value="dark">深色</Radio.Button>
                      <Radio.Button value="system">跟随系统</Radio.Button>
                    </Radio.Group>
                    <Button 
                      type="link" 
                      icon={<EyeOutlined />} 
                      onClick={openThemePreview}
                      style={{ marginLeft: 8 }}
                    >
                      预览
                    </Button>
                  </Form.Item>
                  
                  <Form.Item label="主题色彩" name="colorPalette">
                    <Select 
                      style={{ width: 200 }}
                      onChange={(value) => setCustomPalette(value as string)}
                    >
                      <Option value="default">默认蓝</Option>
                      <Option value="green">自然绿</Option>
                      <Option value="purple">优雅紫</Option>
                      <Option value="orange">活力橙</Option>
                      <Option value="red">热情红</Option>
                    </Select>
                    <Button 
                      type="link" 
                      icon={<BgColorsOutlined />} 
                      style={{ marginLeft: 8 }}
                      onClick={() => {
                        Modal.info({
                          title: '主题自定义',
                          content: (
                            <div>
                              <p>选择您喜欢的颜色作为主题色：</p>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                {['#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#f5222d'].map(color => (
                                  <div 
                                    key={color}
                                    style={{
                                      width: '30px',
                                      height: '30px',
                                      backgroundColor: color,
                                      borderRadius: '4px',
                                      cursor: 'pointer',
                                      border: '2px solid transparent',
                                      boxSizing: 'border-box'
                                    }}
                                    onClick={() => {
                                      // 这里应该设置自定义颜色
                                      setCustomPalette('custom');
                                      // 关闭弹窗
                                      Modal.destroyAll();
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          ),
                          okText: '取消'
                        });
                      }}
                    >
                      自定义
                    </Button>
                  </Form.Item>
                  
                  <Form.Item label="界面语言" name="language">
                    <Select style={{ width: 200 }}>
                      <Option value="zh-CN">简体中文</Option>
                      <Option value="en-US">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <div className="theme-preview" style={{ 
                    background: themePreview === 'dark' ? '#1f1f1f' : '#f0f2f5',
                    color: themePreview === 'dark' ? '#fff' : '#000',
                    padding: 16,
                    borderRadius: 8,
                    minHeight: 200,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ marginBottom: 16, fontWeight: 'bold' }}>主题预览</div>
                    <div style={{ 
                      background: themePreview === 'dark' ? '#141414' : '#fff', 
                      padding: 12,
                      borderRadius: 6,
                      marginBottom: 10
                    }}>
                      <div style={{ 
                        height: 20, 
                        width: '70%', 
                        background: themePreview === 'dark' ? '#333' : '#f5f5f5',
                        borderRadius: 4,
                        marginBottom: 8
                      }}></div>
                      <div style={{ 
                        height: 10, 
                        width: '90%', 
                        background: themePreview === 'dark' ? '#333' : '#f5f5f5',
                        borderRadius: 4,
                        marginBottom: 8
                      }}></div>
                      <div style={{ 
                        height: 30, 
                        width: '100%', 
                        background: customPalette === 'default' ? '#1890ff' : 
                                   customPalette === 'green' ? '#52c41a' :
                                   customPalette === 'purple' ? '#722ed1' :
                                   customPalette === 'orange' ? '#fa8c16' : '#f5222d',
                        borderRadius: 4,
                        opacity: themePreview === 'dark' ? 0.85 : 1
                      }}></div>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ 
                        height: 24, 
                        width: 24, 
                        borderRadius: 4,
                        background: themePreview === 'dark' ? '#333' : '#f5f5f5',
                      }}></div>
                      <div style={{ 
                        height: 24, 
                        width: 24, 
                        borderRadius: 4,
                        background: customPalette === 'default' ? '#1890ff' : 
                                   customPalette === 'green' ? '#52c41a' :
                                   customPalette === 'purple' ? '#722ed1' :
                                   customPalette === 'orange' ? '#fa8c16' : '#f5222d',
                        opacity: themePreview === 'dark' ? 0.85 : 1
                      }}></div>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Divider />
              
              <Form.Item label="自动保存" name="autoSave" valuePropName="checked">
                <Switch />
              </Form.Item>
              
              <Form.Item 
                label="自动保存间隔(分钟)" 
                name="autoSaveInterval"
                dependencies={['autoSave']}
              >
                <Slider 
                  min={1} 
                  max={30} 
                  marks={{ 1: '1分钟', 15: '15分钟', 30: '30分钟' }}
                  disabled={!form.getFieldValue('autoSave')}
                />
              </Form.Item>
              
              <Form.Item label="默认输出格式" name="outputFormat">
                <Radio.Group>
                  <Radio value="srt">SRT字幕</Radio>
                  <Radio value="txt">纯文本</Radio>
                  <Radio value="jianying">剪映草稿</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item label="历史记录保存数量" name="maxHistoryItems">
                <Slider 
                  min={5} 
                  max={50} 
                  step={5}
                  marks={{ 5: '5', 25: '25', 50: '50' }}
                />
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane 
            tab={<span><CloudOutlined />AI设置</span>}
            key="ai"
          >
            <Form 
              layout="vertical"
              initialValues={{
                enableLocalProcessing: true
              }}
            >
              <Alert
                message="AI功能增强"
                description="连接API密钥后，您可以使用更强大的AI模型生成解说文案、分析视频内容并获取智能建议。所有请求直接从您的设备发送，保障数据安全。"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
                action={
                  <Button 
                    size="small" 
                    type="primary"
                    onClick={() => window.open('https://help.aliyun.com/document_detail/613695.html', '_blank')}
                  >
                    了解更多
                  </Button>
                }
              />
              
              <Tabs defaultActiveKey="models" style={{ marginBottom: 24 }}>
                <TabPane tab="模型设置" key="models">
                  {/* 大模型卡片列表 */}
                  <Row gutter={[16, 16]}>
                    {[
                      {
                        type: 'qianwen' as AIModelType,
                        name: '通义千问',
                        description: '阿里云旗下大语言模型，支持中文知识问答、内容生成和创意写作',
                        applyUrl: 'https://help.aliyun.com/document_detail/613695.html'
                      },
                      {
                        type: 'wenxin' as AIModelType,
                        name: '文心一言',
                        description: '百度研发的知识增强大语言模型，擅长中文创作和信息整合',
                        applyUrl: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Nlks5zkzu'
                      },
                      {
                        type: 'chatgpt' as AIModelType,
                        name: 'ChatGPT',
                        description: 'OpenAI开发的强大语言模型，支持多语言生成和创意内容创作',
                        applyUrl: 'https://platform.openai.com/signup'
                      },
                      {
                        type: 'deepseek' as AIModelType,
                        name: 'DeepSeek',
                        description: '中文大语言模型，专注于知识问答和内容生成，支持高级创意写作',
                        applyUrl: 'https://www.deepseek.com/'
                      }
                    ].map(model => {
                      // 获取加密显示的API密钥
                      const maskedKey = keyManager.getMaskedKey(model.type);
                      const hasKey = keyManager.hasKey(model.type);
                      
                      return (
                        <Col xs={24} sm={12} key={model.type}>
                          <Card 
                            title={
                              <Space>
                                <span>{model.name}</span>
                                {hasKey && (
                                  <Tag color="success">已配置</Tag>
                                )}
                              </Space>
                            }
                            extra={
                              <Button 
                                type="link" 
                                onClick={() => window.open(model.applyUrl, '_blank')}
                                icon={<LinkOutlined />}
                                size="small"
                              >
                                申请
                              </Button>
                            }
                          >
                            <p>{model.description}</p>
                            
                            <Form.Item 
                              label="API密钥" 
                              name={`apiKey_${model.type}`}
                              style={{ marginBottom: 0 }}
                            >
                              <Space direction="vertical" style={{ width: '100%' }}>
                                <Input.Password 
                                  placeholder={hasKey ? "已设置API密钥" : `输入${model.name}的API密钥`} 
                                  value={maskedKey}
                                  onChange={(e) => handleApiKeyChange(model.type, e.target.value)}
                                  addonAfter={
                                    hasKey ? (
                                      <Tooltip title="编辑API密钥">
                                        <EditOutlined onClick={() => handleEditApiKey(model.type)} />
                                      </Tooltip>
                                    ) : null
                                  }
                                />
                                {hasKey && (
                                  <div style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '12px' }}>
                                    <LockOutlined style={{ marginRight: 5 }} />密钥已加密存储: {maskedKey}
                                  </div>
                                )}
                              </Space>
                            </Form.Item>
                            
                            {model.type === 'wenxin' && (
                              <Alert 
                                message="文心一言需要同时配置API Key和Secret Key" 
                                description="请使用 API_KEY:|:SECRET_KEY 格式填写"
                                type="warning" 
                                showIcon 
                                style={{ marginTop: 16 }}
                              />
                            )}
                            
                            {model.type === 'chatgpt' && (
                              <Alert 
                                message="如果您使用了API代理，请填写完整URL" 
                                description="默认使用官方API端点，如需更改请联系管理员"
                                type="info" 
                                showIcon 
                                style={{ marginTop: 16 }}
                              />
                            )}
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </TabPane>
                
                <TabPane tab="生成设置" key="generation">
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item label="默认模型类型" name="defaultModelType">
                        <Select>
                          <Option value="qianwen">通义千问</Option>
                          <Option value="wenxin">文心一言</Option>
                          <Option value="chatgpt">ChatGPT</Option>
                          <Option value="deepseek">DeepSeek</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item label="默认风格" name="defaultStyle">
                        <Select>
                          <Option value="formal">正式</Option>
                          <Option value="casual">休闲</Option>
                          <Option value="humorous">幽默</Option>
                          <Option value="dramatic">戏剧化</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="解说详细程度" name="detailLevel">
                    <Select>
                      <Option value="basic">基础</Option>
                      <Option value="standard">标准</Option>
                      <Option value="detailed">详细</Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item label="情感表现程度" name="emotionLevel">
                    <Select>
                      <Option value="neutral">中性</Option>
                      <Option value="moderate">适中</Option>
                      <Option value="expressive">表现力强</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item label="生成速度" name="generationSpeed">
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="fast">快速（优先速度，可能稍差质量）</Radio>
                    <Radio value="balanced">平衡（速度和质量的平衡）</Radio>
                    <Radio value="quality">高质量（更长的生成时间，更好的结果）</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item label="目标受众" name="targetAudience">
                <Select>
                  <Option value="general">通用</Option>
                  <Option value="youth">青少年</Option>
                  <Option value="professional">专业人士</Option>
                  <Option value="elderly">老年人</Option>
                </Select>
              </Form.Item>
              </TabPane>
              </Tabs>
              
              <Divider />
              
              <Form.Item 
                label="启用本地视频处理" 
                name="enableLocalProcessing" 
                valuePropName="checked"
                extra="使用本地CPU/GPU处理视频内容，提高隐私性但可能降低性能"
              >
                <Switch />
              </Form.Item>
            </Form>
          </TabPane>
          
          {/* <TabPane 
            tab={<span><UserOutlined />用户档案</span>}
            key="user"
          >
            <Form 
              layout="vertical"
              initialValues={{
                username: '用户',
                email: '',
                preferences: ['drama', 'comedy'],
                autoSync: true
              }}
              form={form}
            >
              <Row gutter={24}>
                <Col span={16}>
                  <Form.Item label="用户头像">
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                      beforeUpload={(file) => {
                        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                        if (!isJpgOrPng) {
                          message.error('只能上传JPG/PNG格式的图片!');
                        }
                        const isLt2M = file.size / 1024 / 1024 < 2;
                        if (!isLt2M) {
                          message.error('图片必须小于2MB!');
                        }
                        return isJpgOrPng && isLt2M;
                      }}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传头像</div>
                      </div>
                    </Upload>
                  </Form.Item>
                  
                  <Form.Item label="用户名" name="username">
                    <Input prefix={<UserOutlined />} />
                  </Form.Item>
                  
                  <Form.Item label="电子邮箱" name="email">
                    <Input type="email" />
                  </Form.Item>
                  
                  <Form.Item label="内容偏好" name="preferences">
                    <Select mode="multiple" placeholder="选择您感兴趣的内容类型">
                      <Option value="drama">剧情</Option>
                      <Option value="comedy">喜剧</Option>
                      <Option value="action">动作</Option>
                      <Option value="documentary">纪录片</Option>
                      <Option value="education">教育</Option>
                      <Option value="vlog">Vlog</Option>
                    </Select>
                  </Form.Item>
                  
                  <Divider />
                  
                  <Form.Item 
                    label="自动同步设置到其他设备" 
                    name="autoSync" 
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  
                  <Button 
                    type="primary" 
                    ghost
                    icon={isSyncing ? <LoadingOutlined /> : <SyncOutlined />}
                    onClick={syncWithOtherDevices}
                    disabled={isSyncing}
                  >
                    {isSyncing ? '同步中...' : '立即同步'}
                  </Button>
                </Col>
                
                <Col span={8}>
                  <Card title="已连接的设备" size="small">
                    <List
                      dataSource={userDevices}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            item.isCurrentDevice ? null : 
                            <Button 
                              type="text" 
                              danger 
                              size="small"
                              onClick={() => removeDevice(item.id)}
                            >
                              移除
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar icon={
                                item.type === 'desktop' ? <LaptopOutlined /> : 
                                item.type === 'mobile' ? <MobileOutlined /> : <TabletOutlined />
                              } />
                            }
                            title={
                              <Space>
                                {item.name}
                                {item.isCurrentDevice && <Badge status="processing" text="当前设备" />}
                              </Space>
                            }
                            description={`上次同步: ${item.lastSync}`}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </Form>
          </TabPane> */}
          
          <TabPane 
            tab={<span><ToolOutlined />高级</span>}
            key="advanced"
          >

            <Form layout="vertical" form={form}>
              <Form.Item label="调试模式" name="debugMode" valuePropName="checked">
                <Switch />
              </Form.Item>
              
              <Form.Item 
                label="GPU加速" 
                name="gpuAcceleration" 
                valuePropName="checked"
                extra="启用GPU加速可提高视频处理和AI任务的性能"
              >
                <Switch defaultChecked />
              </Form.Item>
              
              <Form.Item label="最大并行处理数" name="maxParallelProcesses">
                <Slider min={1} max={8} defaultValue={4} />
              </Form.Item>
              
              <Form.Item label="硬件配置">
                <Card size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic 
                        title="CPU使用率" 
                        value={35} 
                        suffix="%" 
                        precision={2}
                      />
                      <Progress percent={35} size="small" />
                    </Col>
                    <Col span={12}>
                      <Statistic 
                        title="内存使用率" 
                        value={42} 
                        suffix="%" 
                        precision={2}
                      />
                      <Progress percent={42} size="small" />
                    </Col>
                  </Row>
                </Card>
              </Form.Item>
              
              <Divider />
              
              <Form.Item label="缓存目录" name="cacheDirectory">
                <Input 
                  addonAfter={
                    <Button 
                      type="text" 
                      icon={<FolderOutlined />} 
                      onClick={() => {
                        // 模拟选择文件夹操作
                        Modal.info({
                          title: '选择缓存目录',
                          content: '在实际应用中，这里会打开系统文件夹选择对话框。',
                          onOk() {
                            message.success('已选择新的缓存目录');
                            // 此处可以添加更新缓存目录的逻辑
                          }
                        });
                      }}
                    />
                  }
                  defaultValue="C:/Users/Username/AppData/Local/短剧燃剪/cache"
                />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button 
                    danger
                    onClick={() => {
                      Modal.confirm({
                        title: '清除缓存',
                        content: '确定要清除所有缓存文件吗？这可能会导致应用临时变慢。',
                        onOk: () => {
                          message.success('缓存已清除');
                        },
                        okText: '确认清除',
                        cancelText: '取消'
                      });
                    }}
                  >
                    清除缓存
                  </Button>
                  <Button onClick={resetSettings}>重置所有设置</Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={<span><PieChartOutlined />模型评估</span>}
            key="evaluation"
          >
            <Form layout="vertical" form={form}>
              <Alert
                message="AI模型评估设置"
                description="配置AI模型评估的默认参数，包括评估指标、自动评估设置等。"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item
                label="默认评估指标"
                name="defaultMetrics"
                initialValue={['accuracy', 'responseTime', 'qualityScore']}
              >
                <Select mode="multiple" placeholder="选择默认评估指标">
                  <Option value="accuracy">准确度</Option>
                  <Option value="responseTime">响应时间</Option>
                  <Option value="qualityScore">质量分数</Option>
                  <Option value="vocabularyScore">词汇丰富度</Option>
                  <Option value="relevancy">相关性</Option>
                  <Option value="creativity">创造性</Option>
                  <Option value="consistency">一致性</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="自动评估"
                name="autoEvaluate"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="评估频率"
                name="evaluationFrequency"
                initialValue="weekly"
                dependencies={['autoEvaluate']}
              >
                <Radio.Group disabled={!form.getFieldValue('autoEvaluate')}>
                  <Radio value="daily">每日</Radio>
                  <Radio value="weekly">每周</Radio>
                  <Radio value="monthly">每月</Radio>
                  <Radio value="onDemand">按需</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="保存评估结果"
                name="saveEvaluationResults"
                valuePropName="checked"
                initialValue={true}
                extra="启用后，所有评估结果将被保存以供将来参考和比较"
              >
                <Switch />
              </Form.Item>

              <Card 
                title="可用模型" 
                size="small" 
                style={{ marginBottom: 24 }}
              >
                <List
                  dataSource={[
                    { name: 'GPT-4', type: 'openai', status: 'active' },
                    { name: 'GPT-3.5 Turbo', type: 'openai', status: 'active' },
                    { name: 'Claude 3 Opus', type: 'anthropic', status: 'active' },
                    { name: 'Gemini Pro', type: 'google', status: 'inactive' },
                    { name: 'Baidu ERNIE', type: 'baidu', status: 'inactive' }
                  ]}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          key="evaluate"
                          size="small"
                        >
                          立即评估
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={item.name}
                        description={`${item.type} - ${item.status === 'active' ? '已启用' : '未启用'}`}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Form>
          </TabPane>
        </Tabs>
        
        <Divider />
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!loaded}
            >
              保存设置
            </Button>
            <Button onClick={resetSettings}>重置</Button>
          </Space>
          
          <Text type="secondary">
            版本 1.0.0 | 
            <Button type="link" size="small" icon={<QuestionCircleOutlined />}>
              帮助与支持
            </Button>
          </Text>
        </div>
      </Card>
      </>)}
      
      {/* 主题预览模态框 */}
      <Modal
        title="主题预览"
        open={showThemeModal}
        onCancel={() => setShowThemeModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowThemeModal(false)}>
            关闭
          </Button>,
          <Button 
            key="apply" 
            type="primary" 
            onClick={() => {
              form.setFieldsValue({ theme: themePreview });
              setTheme(themePreview);
              setShowThemeModal(false);
              message.success(`已应用${
                themePreview === 'light' ? '浅色' : 
                themePreview === 'dark' ? '深色' : '系统'
              }主题`);
            }}
          >
            应用此主题
          </Button>
        ]}
        width={800}
      >
        <div style={{ 
          background: themePreview === 'dark' ? '#141414' : '#f0f2f5',
          padding: 20,
          borderRadius: 8
        }}>
          <div style={{ 
            background: themePreview === 'dark' ? '#1f1f1f' : '#fff',
            padding: 20,
            borderRadius: 8,
            color: themePreview === 'dark' ? '#fff' : '#000',
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>项目管理</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ 
                flex: 1, 
                height: 40, 
                background: themePreview === 'dark' ? '#141414' : '#f5f5f5', 
                borderRadius: 4
              }}></div>
              <div style={{ 
                width: 100, 
                height: 40, 
                background: customPalette === 'default' ? '#1890ff' : 
                           customPalette === 'green' ? '#52c41a' :
                           customPalette === 'purple' ? '#722ed1' :
                           customPalette === 'orange' ? '#fa8c16' : '#f5222d',
                borderRadius: 4,
                opacity: themePreview === 'dark' ? 0.85 : 1
              }}></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ 
                flex: 2, 
                height: 200, 
                background: themePreview === 'dark' ? '#141414' : '#f5f5f5',
                borderRadius: 4
              }}>
                <div style={{ height: 20, margin: 8, background: themePreview === 'dark' ? '#333' : '#e8e8e8', width: '80%', borderRadius: 4 }}></div>
                <div style={{ height: 20, margin: 8, background: themePreview === 'dark' ? '#333' : '#e8e8e8', width: '60%', borderRadius: 4 }}></div>
                <div style={{ height: 20, margin: 8, background: themePreview === 'dark' ? '#333' : '#e8e8e8', width: '70%', borderRadius: 4 }}></div>
              </div>
              <div style={{ 
                flex: 1, 
                height: 200, 
                background: themePreview === 'dark' ? '#141414' : '#f5f5f5',
                borderRadius: 4 
              }}>
                <div style={{ height: 15, margin: 8, background: themePreview === 'dark' ? '#333' : '#e8e8e8', width: '90%', borderRadius: 4 }}></div>
                <div style={{ height: 40, margin: 8, background: themePreview === 'dark' ? '#333' : '#e8e8e8', width: '90%', borderRadius: 4 }}></div>
                <div style={{ height: 40, margin: 8, background: themePreview === 'dark' ? '#333' : '#e8e8e8', width: '90%', borderRadius: 4 }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: 16
          }}>
            <div style={{ 
              background: themePreview === 'dark' ? '#1f1f1f' : '#fff',
              padding: 16,
              borderRadius: 8,
              flex: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                height: 20, 
                width: '60%', 
                background: themePreview === 'dark' ? '#333' : '#f0f0f0',
                borderRadius: 4,
                marginBottom: 8
              }}></div>
              <div style={{ 
                height: 40, 
                width: '100%', 
                background: customPalette === 'default' ? '#1890ff' : 
                           customPalette === 'green' ? '#52c41a' :
                           customPalette === 'purple' ? '#722ed1' :
                           customPalette === 'orange' ? '#fa8c16' : '#f5222d',
                borderRadius: 4,
                opacity: themePreview === 'dark' ? 0.85 : 1,
                marginBottom: 12
              }}></div>
              <div style={{ 
                height: 10, 
                width: '90%', 
                background: themePreview === 'dark' ? '#333' : '#f0f0f0',
                borderRadius: 4
              }}></div>
            </div>
            
            <div style={{ 
              background: themePreview === 'dark' ? '#1f1f1f' : '#fff',
              padding: 16,
              borderRadius: 8,
              flex: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                height: 20, 
                width: '60%', 
                background: themePreview === 'dark' ? '#333' : '#f0f0f0',
                borderRadius: 4,
                marginBottom: 8
              }}></div>
              <div style={{ 
                height: 40, 
                width: '100%', 
                background: themePreview === 'dark' ? '#141414' : '#f5f5f5',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                padding: '0 8px',
                marginBottom: 12
              }}>
                <div style={{ 
                  height: 24, 
                  width: 24, 
                  background: customPalette === 'default' ? '#1890ff' : 
                             customPalette === 'green' ? '#52c41a' :
                             customPalette === 'purple' ? '#722ed1' :
                             customPalette === 'orange' ? '#fa8c16' : '#f5222d',
                  borderRadius: 4,
                  opacity: themePreview === 'dark' ? 0.85 : 1
                }}></div>
              </div>
              <div style={{ 
                height: 10, 
                width: '90%', 
                background: themePreview === 'dark' ? '#333' : '#f0f0f0',
                borderRadius: 4
              }}></div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings; 