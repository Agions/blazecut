import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Tabs, 
  message, 
  Typography, 
  Tooltip, 
  Collapse,
  Divider,
  Space,
  Select,
  Tag,
  Slider,
  Alert,
  Row,
  Col,
  Steps,
  Result
} from 'antd';
import { 
  QuestionCircleOutlined, 
  LinkOutlined, 
  SaveOutlined, 
  KeyOutlined,
  InfoCircleOutlined,
  RobotOutlined,
  BulbOutlined,
  ApiOutlined,
  CloudUploadOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  CloudOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  LockOutlined
} from '@ant-design/icons';
import aiService, { AIProviderConfig } from '../services/aiService';
import '../styles/AISettings.less';

const { Title, Paragraph, Text, Link } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;
const { Step } = Steps;

interface ModelConfig {
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  isDefault: boolean;
  status: 'active' | 'disabled' | 'loading';
}

interface ModelOption {
  value: string;
  label: string;
  provider: 'openai' | 'anthropic' | 'local';
  description: string;
}

const modelOptions: ModelOption[] = [
  { 
    value: 'gpt-4', 
    label: 'GPT-4', 
    provider: 'openai',
    description: '适用于复杂任务，理解能力更强，脚本更有创意' 
  },
  { 
    value: 'gpt-3.5-turbo', 
    label: 'GPT-3.5 Turbo', 
    provider: 'openai',
    description: '反应速度快，成本低，适合一般场景' 
  },
  { 
    value: 'claude-3-opus', 
    label: 'Claude 3 Opus', 
    provider: 'anthropic',
    description: 'Anthropic最强大的模型，复杂场景效果优秀' 
  },
  { 
    value: 'claude-3-sonnet', 
    label: 'Claude 3 Sonnet', 
    provider: 'anthropic',
    description: '平衡了性能与速度，适合日常使用' 
  },
  { 
    value: 'local-model', 
    label: '本地模型', 
    provider: 'local',
    description: '使用本地部署的AI模型，无需Internet连接' 
  }
];

const AISettings: React.FC = () => {
  const [form] = Form.useForm();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'success' | 'error'>('none');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'anthropic' | 'local'>('openai');
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  // 从localStorage加载设置
  useEffect(() => {
    const savedConfig = aiService.getConfig();
    if (savedConfig) {
      try {
        form.setFieldsValue({
          apiProvider: savedConfig.provider,
          apiKey: savedConfig.apiKey,
          model: savedConfig.model,
          maxTokens: savedConfig.maxTokens,
          temperature: savedConfig.temperature,
          enableLocalProcessing: true
        });
        setSelectedProvider(savedConfig.provider);
        setIsConfigSaved(true);
      } catch (error) {
        console.error('加载AI配置失败:', error);
      }
    }
  }, [form]);

  // 处理提供商更改
  const handleProviderChange = (value: 'openai' | 'anthropic' | 'local') => {
    setSelectedProvider(value);
    // 更新模型选择
    const filteredModels = modelOptions.filter(model => model.provider === value);
    if (filteredModels.length > 0) {
      form.setFieldValue('model', filteredModels[0].value);
    }
  };

  // 处理连接测试
  const handleTestConnection = async () => {
    try {
      setIsTestingConnection(true);
      setConnectionStatus('none');
      
      const values = await form.validateFields(['apiProvider', 'apiKey']);
      
      // 设置临时配置用于测试
      const testConfig: AIProviderConfig = {
        provider: values.apiProvider,
        apiKey: values.apiKey,
        model: form.getFieldValue('model') || modelOptions[0].value,
        maxTokens: form.getFieldValue('maxTokens') || 1000,
        temperature: form.getFieldValue('temperature') || 0.7
      };
      
      aiService.setConfig(testConfig);
      
      // 测试连接
      const isConnected = await aiService.testConnection();
      
      setConnectionStatus(isConnected ? 'success' : 'error');
      
      if (isConnected) {
        message.success('API连接测试成功！');
      } else {
        message.error('API连接测试失败，请检查您的密钥和网络连接。');
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      setConnectionStatus('error');
      message.error(`测试失败: ${(error as Error).message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // 保存配置
  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      
      const config: AIProviderConfig = {
        provider: values.apiProvider,
        apiKey: values.apiKey,
        model: values.model,
        maxTokens: values.maxTokens,
        temperature: values.temperature
      };
      
      // 更新全局AI服务配置
      aiService.setConfig(config);
      
      message.success('AI设置已保存');
      setIsConfigSaved(true);
      
      // 更新当前步骤
      if (currentStep === 0) {
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error(`保存失败: ${(error as Error).message}`);
    }
  };

  // 根据当前步骤渲染内容
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderConfigForm();
      case 1:
        return renderModelTuning();
      case 2:
        return renderAdvancedSettings();
      case 3:
        return (
          <Result
            status="success"
            title="AI配置已完成"
            subTitle="您现在可以使用AI生成高燃解说文案并导出到剪映"
            extra={[
              <Button 
                type="primary" 
                key="console" 
                onClick={() => window.location.href = '/script-editor'}
              >
                开始创建解说文案
              </Button>,
              <Button 
                key="reset" 
                onClick={() => setCurrentStep(0)}
              >
                重新配置
              </Button>,
            ]}
          />
        );
      default:
        return null;
    }
  };

  // 配置表单
  const renderConfigForm = () => {
    return (
      <Form 
        form={form}
        layout="vertical"
        initialValues={{
          apiProvider: 'openai',
          apiKey: '',
          model: 'gpt-4',
          maxTokens: 1000,
          temperature: 0.7,
          enableLocalProcessing: true
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Alert
              message="配置AI服务"
              description="连接AI服务后，您可以使用AI模型生成专业的短视频解说文案。支持OpenAI、Anthropic或本地模型。"
              type="info"
              showIcon
              icon={<CloudOutlined />}
              style={{ marginBottom: 24 }}
            />
            
            <Form.Item 
              label="AI服务提供商" 
              name="apiProvider"
              required
            >
              <Select onChange={(value) => handleProviderChange(value as 'openai' | 'anthropic' | 'local')}>
                <Option value="openai">OpenAI (GPT-4/GPT-3.5)</Option>
                <Option value="anthropic">Anthropic (Claude)</Option>
                <Option value="local">本地模型</Option>
              </Select>
            </Form.Item>
            
            <Form.Item 
              label="API密钥" 
              name="apiKey"
              required
              rules={[{ required: true, message: '请输入API密钥' }]}
              extra={
                <div>
                  <LockOutlined /> 密钥仅保存在本地，不会上传到服务器
                  {selectedProvider === 'openai' && (
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                      获取OpenAI密钥
                    </a>
                  )}
                  {selectedProvider === 'anthropic' && (
                    <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                      获取Anthropic密钥
                    </a>
                  )}
                </div>
              }
            >
              <Input.Password 
                placeholder={`输入您的${selectedProvider === 'openai' ? 'OpenAI' : selectedProvider === 'anthropic' ? 'Anthropic' : '本地模型'}密钥`} 
                disabled={selectedProvider === 'local'}
              />
            </Form.Item>
            
            <Space>
              <Button 
                type="primary" 
                onClick={handleTestConnection}
                loading={isTestingConnection}
                icon={<ApiOutlined />}
                disabled={selectedProvider === 'local' || !form.getFieldValue('apiKey')}
              >
                测试连接
              </Button>
              
              <Button 
                type="primary" 
                onClick={handleSaveConfig}
                icon={<SaveOutlined />}
              >
                保存配置
              </Button>
              
              {connectionStatus === 'success' && (
                <Tag color="success" icon={<CheckCircleOutlined />}>连接成功</Tag>
              )}
              
              {connectionStatus === 'error' && (
                <Tag color="error" icon={<CloseCircleOutlined />}>连接失败</Tag>
              )}
            </Space>
          </Col>
          
          <Col span={8}>
            <Card title="模型选择" size="small">
              <Form.Item 
                label="选择AI模型" 
                name="model"
                required
              >
                <Select>
                  {modelOptions
                    .filter(model => model.provider === selectedProvider)
                    .map(model => (
                      <Option key={model.value} value={model.value}>
                        {model.label}
                      </Option>
                    ))
                  }
                </Select>
              </Form.Item>
              
              {form.getFieldValue('model') && (
                <div>
                  <Text type="secondary">
                    {modelOptions.find(m => m.value === form.getFieldValue('model'))?.description || ''}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Form>
    );
  };

  // 模型调优设置
  const renderModelTuning = () => {
    return (
      <Form 
        form={form}
        layout="vertical"
      >
        <Row gutter={24}>
          <Col span={12}>
            <Card title="模型参数调整" className="settings-card">
              <Form.Item 
                label={
                  <span>
                    最大标记数 
                    <Tooltip title="控制AI生成内容的最大长度">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                } 
                name="maxTokens"
              >
                <Slider 
                  min={100} 
                  max={4000} 
                  step={100}
                  marks={{ 100: '100', 2000: '2000', 4000: '4000' }}
                />
              </Form.Item>
              
              <Form.Item 
                label={
                  <span>
                    温度(创造性) 
                    <Tooltip title="较高的值使输出更加随机和创造性，较低的值使输出更精确和确定性">
                      <InfoCircleOutlined style={{ marginLeft: 8 }} />
                    </Tooltip>
                  </span>
                } 
                name="temperature"
              >
                <Slider 
                  min={0} 
                  max={2} 
                  step={0.1}
                  marks={{ 0: '精确', 1: '平衡', 2: '创造性' }}
                />
              </Form.Item>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card title="文案风格预设" className="settings-card">
              <div className="style-presets">
                <Tag color="blue" className="preset-tag" onClick={() => message.info('已选择热血激昂风格')}>热血激昂</Tag>
                <Tag color="purple" className="preset-tag" onClick={() => message.info('已选择深度解析风格')}>深度解析</Tag>
                <Tag color="orange" className="preset-tag" onClick={() => message.info('已选择幽默诙谐风格')}>幽默诙谐</Tag>
                <Tag color="cyan" className="preset-tag" onClick={() => message.info('已选择优雅叙事风格')}>优雅叙事</Tag>
                <Tag color="green" className="preset-tag" onClick={() => message.info('已选择科技感风格')}>科技感</Tag>
                <Tag color="red" className="preset-tag" onClick={() => message.info('已选择情感共鸣风格')}>情感共鸣</Tag>
              </div>
              
              <Divider />
              
              <Paragraph>
                <Text type="secondary">
                  风格预设将影响AI生成解说文案的语气和风格。您也可以在生成解说时手动调整。
                </Text>
              </Paragraph>
            </Card>
          </Col>
        </Row>
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => setCurrentStep(0)}>
              上一步
            </Button>
            <Button 
              type="primary" 
              onClick={() => setCurrentStep(2)}
            >
              下一步
            </Button>
          </Space>
        </div>
      </Form>
    );
  };

  // 高级设置
  const renderAdvancedSettings = () => {
    return (
      <Form 
        form={form}
        layout="vertical"
      >
        <Row gutter={24}>
          <Col span={24}>
            <Card title="高级设置">
              <Form.Item 
                label="启用本地视频处理" 
                name="enableLocalProcessing" 
                valuePropName="checked"
                extra="使用本地CPU/GPU处理视频内容，提高隐私性但可能降低性能"
              >
                <Switch defaultChecked />
              </Form.Item>
              
              <Form.Item 
                label="自动调整解说速度以匹配视频节奏"
                name="autoAdjustPace" 
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
              
              <Form.Item 
                label="针对短视频平台优化解说文案"
                name="optimizeForShortVideo" 
                valuePropName="checked"
              >
                <Switch defaultChecked />
              </Form.Item>
            </Card>
          </Col>
        </Row>
        
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Space>
            <Button onClick={() => setCurrentStep(1)}>
              上一步
            </Button>
            <Button 
              type="primary" 
              onClick={() => setCurrentStep(3)}
              icon={<ThunderboltOutlined />}
            >
              完成配置
            </Button>
          </Space>
        </div>
      </Form>
    );
  };

  return (
    <div className="app-container">
      <Title level={3}>AI 设置</Title>
      <Paragraph>配置AI服务参数，优化解说文案生成</Paragraph>
      
      <div style={{ marginBottom: 24 }}>
        <Steps
          current={currentStep}
          onChange={setCurrentStep}
          items={[
            {
              title: '基础配置',
              description: '连接AI服务',
              icon: isConfigSaved ? <CheckCircleOutlined /> : <ApiOutlined />
            },
            {
              title: '模型调优',
              description: '调整参数',
              icon: <RobotOutlined />
            },
            {
              title: '高级设置',
              description: '优化体验',
              icon: <SettingOutlined />
            },
            {
              title: '完成',
              description: '开始使用',
              icon: <ThunderboltOutlined />
            }
          ]}
        />
      </div>
      
      <Card>
        {renderStepContent()}
      </Card>

      <style>
        {`
          .style-presets {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;
          }
          
          .preset-tag {
            cursor: pointer;
            padding: 8px 16px;
            font-size: 14px;
          }
          
          .settings-card {
            height: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default AISettings; 