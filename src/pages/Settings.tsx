import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Input, Switch, Button, message, Tabs, Alert, Divider, Typography, Space, Badge, Modal, Select, InputRef } from 'antd';
import { SaveOutlined, SettingOutlined, ApiOutlined, RobotOutlined, CheckCircleFilled, ExclamationCircleFilled, QuestionCircleOutlined, CheckOutlined, LinkOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { getApiKey, saveApiKey, getAppData, saveAppData, openExternalUrl } from '@/services/tauriService';
import { useStore } from '@/store';
import { AI_MODEL_INFO, AIModelType } from '@/types';
import { aiService } from '@/services/aiService';
import { useLocation } from 'react-router-dom';
import styles from './Settings.module.less';

const { TabPane } = Tabs;
const { Text } = Typography;

// API密钥申请链接
const API_LINKS = {
  wenxin: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Nlks5zkzu',
  qianwen: 'https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key',
  spark: 'https://www.xfyun.cn/doc/spark/Guide.html',
  chatglm: 'https://open.bigmodel.cn/dev/api#apikey',
  doubao: 'https://www.doubao.com/docs/api/',
  deepseek: 'https://platform.deepseek.com'
};

interface LocationState {
  activeModel?: AIModelType;
  showKeyConfig?: boolean;
}

interface SettingsData {
  autoSave: boolean;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const { aiModelsSettings, updateAIModelSettings, setSelectedAIModel, selectedAIModel } = useStore();
  const [testingModel, setTestingModel] = useState<AIModelType | null>(null);
  const [activeTabKey, setActiveTabKey] = useState('aiModels');
  const location = useLocation();
  const locationState = location.state as LocationState || {};
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  
  // 创建各个模型输入框的引用
  const inputRefs = {
    wenxin: useRef<InputRef>(null),
    qianwen: useRef<InputRef>(null),
    spark: useRef<InputRef>(null),
    chatglm: useRef<InputRef>(null),
    doubao: useRef<InputRef>(null),
    deepseek: useRef<InputRef>(null)
  };
  
  const [testResults, setTestResults] = useState<Record<AIModelType, boolean | null>>({
    wenxin: null,
    qianwen: null,
    spark: null,
    chatglm: null,
    doubao: null,
    deepseek: null
  });

  // 加载设置并处理导航状态
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // 从安全存储加载API密钥
        const openaiKey = await getApiKey('openai');
        const anthropicKey = await getApiKey('anthropic');
        
        // 加载国产大模型API密钥
        const wenxinKey = await getApiKey('wenxin');
        const qianwenKey = await getApiKey('qianwen');
        const sparkKey = await getApiKey('spark');
        const chatglmKey = await getApiKey('chatglm');
        const doubaoKey = await getApiKey('doubao');
        const deepseekKey = await getApiKey('deepseek');
        
        // 更新状态
        if (wenxinKey) updateAIModelSettings('wenxin', { apiKey: wenxinKey, enabled: true });
        if (qianwenKey) updateAIModelSettings('qianwen', { apiKey: qianwenKey, enabled: true });
        if (sparkKey) updateAIModelSettings('spark', { apiKey: sparkKey, enabled: true });
        if (chatglmKey) updateAIModelSettings('chatglm', { apiKey: chatglmKey, enabled: true });
        if (doubaoKey) updateAIModelSettings('doubao', { apiKey: doubaoKey, enabled: true });
        if (deepseekKey) updateAIModelSettings('deepseek', { apiKey: deepseekKey, enabled: true });
        
        // 从应用数据加载其他设置
        const appSettings = await getAppData<SettingsData>('settings');
        const autoSave = appSettings?.autoSave ?? true;
        
        setOpenaiApiKey(openaiKey);
        setAnthropicApiKey(anthropicKey);
        
        // 初始化表单值状态
        const initialFormValues = {
          wenxinApiKey: wenxinKey || '',
          qianwenApiKey: qianwenKey || '',
          sparkApiKey: sparkKey || '',
          chatglmApiKey: chatglmKey || '',
          doubaoApiKey: doubaoKey || '',
          deepseekApiKey: deepseekKey || '',
          openaiApiKey: openaiKey || '',
          anthropicApiKey: anthropicKey || '',
        };
        setFormValues(initialFormValues);
        
        // 设置表单初始值
        form.setFieldsValue({
          ...initialFormValues,
          autoSave,
          darkMode: isDarkMode
        });
        
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('加载设置失败:', error);
        message.error('加载设置失败');
        setInitialized(true);
        setLoading(false);
      }
    };
    
    loadSettings();
  }, [form, isDarkMode, updateAIModelSettings]);
  
  // 处理从其他页面跳转过来的焦点设置
  useEffect(() => {
    if (initialized && locationState.activeModel && locationState.showKeyConfig) {
      // 确保切换到AI模型配置选项卡
      setActiveTabKey('aiModels');
      
      // 设置焦点到对应的输入框
      setTimeout(() => {
        const ref = inputRefs[locationState.activeModel!];
        if (ref?.current) {
          ref.current.focus();
        }
      }, 300);
    }
  }, [initialized, locationState]);

  // 保存设置
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 安全保存API密钥
      if (values.openaiApiKey !== openaiApiKey) {
        await saveApiKey('openai', values.openaiApiKey);
        setOpenaiApiKey(values.openaiApiKey);
      }
      
      if (values.anthropicApiKey !== anthropicApiKey) {
        await saveApiKey('anthropic', values.anthropicApiKey);
        setAnthropicApiKey(values.anthropicApiKey);
      }
      
      // 保存国产大模型API密钥
      const modelKeys: AIModelType[] = ['wenxin', 'qianwen', 'spark', 'chatglm', 'doubao', 'deepseek'];
      for (const key of modelKeys) {
        const apiKeyField = `${key}ApiKey` as keyof typeof values;
        const apiKey = values[apiKeyField] as string;
        
        // 只有当API密钥存在且有效时才启用模型
        const hasValidKey = !!apiKey && apiKey.trim().length > 0;
        
        // 保存API密钥
        await saveApiKey(key, apiKey || '');
        
        // 更新模型设置
        updateAIModelSettings(key, { 
          apiKey: apiKey || undefined, 
          enabled: hasValidKey 
        });
      }
      
      // 保存其他设置
      await saveAppData('settings', {
        autoSave: values.autoSave
      });
      
      // 处理主题切换
      if (values.darkMode !== isDarkMode) {
        toggleTheme();
      }
      
      message.success('设置已保存');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理输入框值变化
  const handleInputChange = (model: AIModelType, value: string) => {
    setFormValues(prev => ({ ...prev, [`${model}ApiKey`]: value }));
  };

  // 打开API密钥申请页面
  const handleApplyApiKey = async (model: AIModelType) => {
    const apiUrl = API_LINKS[model];
    if (apiUrl) {
      try {
        console.log(`正在打开${model}的API申请链接: ${apiUrl}`);
        const success = await openExternalUrl(apiUrl);
        if (!success) {
          message.info(`请手动访问${model}的API申请页面: ${apiUrl}`);
        }
      } catch (error) {
        console.error(`打开${model}的API申请链接失败:`, error);
        message.error(`无法打开申请链接，请手动访问: ${apiUrl}`);
      }
    } else {
      message.error(`未找到${AI_MODEL_INFO[model].name}的API申请链接`);
    }
  };

  // 测试API密钥是否有效
  const testApiKey = async (model: AIModelType) => {
    try {
      setTestingModel(model);
      const apiKey = formValues[`${model}ApiKey`];
      
      if (!apiKey) {
        message.warning(`请先输入${AI_MODEL_INFO[model].name}的API密钥`);
        return;
      }
      
      // 简单的测试提示
      const testPrompt = {
        keyMoments: [{ timestamp: 10, description: '测试画面', importance: 5 }],
        emotions: [{ timestamp: 10, type: '正常', intensity: 0.5 }],
        summary: '这是一个API密钥测试'
      };
      
      // 调用对应模型的API
      const response = await aiService[`${model}GenerateScript`](apiKey, testPrompt, { testing: true });
      
      // 如果没有抛出异常，则表示API密钥有效
      setTestResults(prev => ({ ...prev, [model]: true }));
      message.success(`${AI_MODEL_INFO[model].name}的API密钥有效`);
      
      // 自动启用该模型
      updateAIModelSettings(model, { apiKey, enabled: true });
      
      // 保存API密钥
      await saveApiKey(model, apiKey);
      
    } catch (error) {
      console.error(`测试${model}的API密钥失败:`, error);
      setTestResults(prev => ({ ...prev, [model]: false }));
      message.error(`${AI_MODEL_INFO[model].name}的API密钥无效或测试失败`);
    } finally {
      setTestingModel(null);
    }
  };

  // 设置默认AI模型
  const handleSetDefaultModel = (model: AIModelType) => {
    setSelectedAIModel(model);
    message.success(`已将${AI_MODEL_INFO[model].name}设为默认模型`);
  };

  // 获取模型API密钥格式示例
  const getApiKeyExample = (model: AIModelType): string => {
    switch(model) {
      case 'wenxin':
        return 'API_KEY:SECRET_KEY';
      case 'qianwen':
        return 'sk-xxxxxxxxxxxxxxxxxxxxx';
      case 'spark':
        return 'APPID:API_SECRET:API_KEY';
      case 'chatglm':
        return 'eyJhbxxxxxxxxxxxxxxx';
      case 'doubao':
        return 'sk-xxxxxxxxxxxxxx';
      case 'deepseek':
        return 'sk-xxxxxxxxxxxxxxxxxxxxx';
      default:
        return '';
    }
  };

  // 渲染API密钥申请按钮
  const renderApplyButton = (model: AIModelType) => {
    return (
      <Button
        type="primary"
        size="small"
        icon={<LinkOutlined />}
        onClick={() => handleApplyApiKey(model)}
        className={styles.applyKeyButton}
      >
        申请密钥
      </Button>
    );
  };

  // 渲染API密钥测试按钮
  const renderTestButton = (model: AIModelType) => {
    const isCurrentlyTesting = testingModel === model;
    const testResult = testResults[model];
    const hasApiKey = !!formValues[`${model}ApiKey`] && formValues[`${model}ApiKey`].trim().length > 0;
    
    let icon = <ApiOutlined />;
    if (testResult === true) icon = <CheckCircleFilled style={{ color: '#52c41a' }} />;
    if (testResult === false) icon = <ExclamationCircleFilled style={{ color: '#f5222d' }} />;
    
    return (
      <Button
        type="default"
        size="small"
        icon={isCurrentlyTesting ? null : icon}
        onClick={() => testApiKey(model)}
        loading={isCurrentlyTesting}
        disabled={!hasApiKey}
      >
        {isCurrentlyTesting ? '测试中' : '测试'}
      </Button>
    );
  };

  // 渲染设为默认按钮
  const renderSetDefaultButton = (model: AIModelType) => {
    const isDefaultModel = selectedAIModel === model;
    const isEnabled = testResults[model] === true;
    
    return (
      <Button
        type={isDefaultModel ? "primary" : "default"}
        size="small"
        icon={isDefaultModel ? <CheckOutlined /> : null}
        onClick={() => handleSetDefaultModel(model)}
        disabled={!isEnabled}
      >
        {isDefaultModel ? '当前默认' : '设为默认'}
      </Button>
    );
  };

  // 动态生成国产大模型API密钥表单项
  const renderAIModelFields = () => {
    const modelTypes: AIModelType[] = ['wenxin', 'qianwen', 'spark', 'chatglm', 'doubao', 'deepseek'];
    
    return modelTypes.map(model => {
      const modelInfo = AI_MODEL_INFO[model];
      const fieldName = `${model}ApiKey`;
      const isEnabled = aiModelsSettings[model]?.enabled;
      
      return (
        <Form.Item
          key={model}
          label={
            <Space>
              <span>{modelInfo.name}</span>
              <Text type="secondary">({modelInfo.provider})</Text>
              {isEnabled && (
                <Badge status="success" text="已启用" />
              )}
            </Space>
          }
          name={fieldName}
          tooltip={{
            title: `输入${modelInfo.name}的API密钥，格式：${getApiKeyExample(model)}`,
            icon: <QuestionCircleOutlined />
          }}
        >
          <Input 
            ref={inputRefs[model]}
            placeholder={`${getApiKeyExample(model)}`}
            onChange={(e) => handleInputChange(model, e.target.value)}
            suffix={
              <Space>
                {renderApplyButton(model)}
                {renderTestButton(model)}
                {testResults[model] === true && renderSetDefaultButton(model)}
              </Space>
            }
          />
        </Form.Item>
      );
    });
  };

  if (!initialized) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.container}>
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>设置</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveSettings}
            loading={loading}
            disabled={!initialized}
          >
            保存设置
          </Button>
        }
        className={styles.settingsCard}
      >
        {!initialized ? (
          <div className={styles.loadingTip}>正在加载设置...</div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              openaiApiKey: '',
              anthropicApiKey: '',
              wenxinApiKey: '',
              qianwenApiKey: '',
              sparkApiKey: '',
              chatglmApiKey: '',
              doubaoApiKey: '',
              deepseekApiKey: '',
              autoSave: true,
              darkMode: false
            }}
          >
            <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
              <TabPane
                tab={
                  <span>
                    <RobotOutlined />
                    大模型配置
                  </span>
                }
                key="aiModels"
              >
                <Alert
                  message="直接配置API密钥"
                  description="直接在下方输入框中粘贴您的API密钥，点击测试验证有效性。如果没有API密钥，可以点击「申请密钥」前往官网申请。验证通过后即可使用对应的大模型生成脚本。"
                  type="info"
                  showIcon
                  className={styles.alert}
                />
                
                <Divider orientation="left">API密钥配置</Divider>
                
                {renderAIModelFields()}
                
                <Divider orientation="left">默认模型设置</Divider>
                
                <Form.Item
                  label="选择默认使用的模型"
                >
                  <Select
                    value={selectedAIModel}
                    onChange={(value) => setSelectedAIModel(value as AIModelType)}
                    style={{ width: '100%' }}
                    options={Object.entries(AI_MODEL_INFO).map(([key, info]) => ({
                      label: `${info.name} (${info.provider})`,
                      value: key,
                      disabled: !aiModelsSettings[key as AIModelType]?.enabled
                    }))}
                  />
                </Form.Item>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <SettingOutlined />
                    常规设置
                  </span>
                }
                key="general"
              >
                <Form.Item
                  label="启用暗黑模式"
                  name="darkMode"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                
                <Form.Item
                  label="自动保存项目编辑"
                  name="autoSave"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </TabPane>
            </Tabs>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Settings; 