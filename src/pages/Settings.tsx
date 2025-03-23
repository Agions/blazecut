import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Tabs, Form, Switch, Input, Button, 
  Select, Radio, Slider, Space, Divider, message, Row, Col,
  Statistic, Badge, Avatar, Upload, Progress, Alert, List, Modal
} from 'antd';
import { 
  SaveOutlined, 
  SettingOutlined, 
  CloudOutlined,
  UserOutlined,
  ToolOutlined,
  FolderOutlined,
  SyncOutlined,
  LoadingOutlined,
  PieChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
  BgColorsOutlined,
  EyeOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';
import colorPalettes from '../styles/colorPalettes';

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

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loaded, setLoaded] = useState(true);
  const [themePreview, setThemePreview] = useState<'light' | 'dark' | 'system'>('light');
  const [customPalette, setCustomPalette] = useState<string>('default');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // 模拟用户设备数据
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
  
  // 模拟应用统计数据
  const [appStats, setAppStats] = useState<AppStats>({
    totalProjects: 15,
    totalVideos: 32,
    totalScripts: 43,
    totalExports: 28,
    timeSpent: 1240, // 约20.6小时
    storageUsed: 1250 // 1.25 GB
  });
  
  // 当主题设置改变时，更新预览
  useEffect(() => {
    const themeValue = form.getFieldValue('theme');
    if (themeValue) {
      setThemePreview(themeValue);
    }
  }, [form]);
  
  // 保存设置
  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('保存设置:', values);
      
      // 更新主题
      if (values.theme && values.theme !== theme) {
        setTheme(values.theme);
      }
      
      // 显示成功消息
      message.success('设置已保存');
      
      // 如果启用了自动同步，则开始同步
      if (values.autoSync) {
        syncWithOtherDevices();
      }
    });
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
  
  // 删除设备
  const removeDevice = (deviceId: string) => {
    Modal.confirm({
      title: '移除设备',
      content: '确定要移除此设备吗？该设备将不再同步您的设置和数据。',
      onOk: () => {
        const updatedDevices = userDevices.filter(device => device.id !== deviceId);
        setUserDevices(updatedDevices);
        message.success('设备已移除');
      },
      okText: '确认移除',
      cancelText: '取消'
    });
  };
  
  // 打开主题预览模态框
  const openThemePreview = () => {
    setShowThemeModal(true);
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
      <Title level={3} className="page-title">系统设置</Title>
      <Paragraph>配置应用的常规设置、AI参数、输出格式等</Paragraph>
      
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic 
              title="总项目数" 
              value={appStats.totalProjects} 
              prefix={<PieChartOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="总使用时间" 
              value={formatDuration(appStats.timeSpent)} 
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic 
              title="存储空间使用" 
              value={formatStorage(appStats.storageUsed)} 
              prefix={<FolderOutlined />} 
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
              <Row gutter={24}>
                <Col span={16}>
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
                aiProvider: 'openai',
                apiKey: '',
                model: 'gpt-4',
                maxTokens: 1000,
                temperature: 0.7,
                enableLocalProcessing: true
              }}
            >
              <Alert
                message="AI功能增强"
                description="连接API密钥后，您可以使用更强大的AI模型生成解说文案、分析视频内容并获取智能建议。"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
                action={
                  <Button size="small" type="primary">
                    了解更多
                  </Button>
                }
              />
              
              <Form.Item 
                label="AI服务提供商" 
                name="aiProvider"
                required
              >
                <Select>
                  <Option value="openai">OpenAI</Option>
                  <Option value="anthropic">Anthropic</Option>
                  <Option value="local">本地模型</Option>
                </Select>
              </Form.Item>
              
              <Form.Item 
                label="API密钥" 
                name="apiKey"
                extra="我们不会将您的API密钥发送到我们的服务器，所有请求都直接从您的设备发送"
              >
                <Input.Password placeholder="输入您的API密钥" />
              </Form.Item>
              
              <Form.Item label="默认模型" name="model">
                <Select>
                  <Option value="gpt-4">GPT-4</Option>
                  <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                  <Option value="claude-3-opus">Claude 3 Opus</Option>
                  <Option value="claude-3-sonnet">Claude 3 Sonnet</Option>
                </Select>
              </Form.Item>
              
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="最大标记数" name="maxTokens">
                    <Slider 
                      min={100} 
                      max={4000} 
                      step={100}
                      marks={{ 100: '100', 2000: '2000', 4000: '4000' }}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item label="温度(创造性)" name="temperature">
                    <Slider 
                      min={0} 
                      max={2} 
                      step={0.1}
                      marks={{ 0: '精确', 1: '平衡', 2: '创造性' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
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
          
          <TabPane 
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
          </TabPane>
          
          <TabPane 
            tab={<span><ToolOutlined />高级</span>}
            key="advanced"
          >
            <Form layout="vertical">
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
                    <Button type="text" icon={<FolderOutlined />} />
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