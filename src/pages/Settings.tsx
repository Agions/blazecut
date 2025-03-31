import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Switch, Button, message, Tabs, Alert, Divider } from 'antd';
import { SaveOutlined, KeyOutlined, SettingOutlined, ApiOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import { getApiKey, saveApiKey, getAppData, saveAppData } from '@/services/tauriService';
import styles from './Settings.module.less';

const { TabPane } = Tabs;

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

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // 从安全存储加载API密钥
        const openaiKey = await getApiKey('openai');
        const anthropicKey = await getApiKey('anthropic');
        
        // 从应用数据加载其他设置
        const appSettings = await getAppData<SettingsData>('settings');
        const autoSave = appSettings?.autoSave ?? true;
        
        setOpenaiApiKey(openaiKey);
        setAnthropicApiKey(anthropicKey);
        
        form.setFieldsValue({
          openaiApiKey: openaiKey,
          anthropicApiKey: anthropicKey,
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
  }, [form, isDarkMode]);

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

  if (!initialized) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>设置</h1>
      
      <Tabs defaultActiveKey="api">
        <TabPane 
          tab={<span><ApiOutlined />API设置</span>}
          key="api"
        >
          <Card>
            <Alert
              message="API密钥安全提示"
              description="您的API密钥将安全地存储在本地设备上，不会被发送到任何外部服务器。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="openaiApiKey"
                label="OpenAI API密钥"
                extra="用于GPT模型，从OpenAI开发者平台获取"
              >
                <Input 
                  prefix={<KeyOutlined />}
                  placeholder="sk-..." 
                  type="password"
                />
              </Form.Item>
              
              <Form.Item
                name="anthropicApiKey"
                label="Anthropic API密钥"
                extra="用于Claude模型，从Anthropic获取"
              >
                <Input 
                  prefix={<KeyOutlined />}
                  placeholder="sk-ant-..." 
                  type="password"
                />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSaveSettings}
                  loading={loading}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={<span><SettingOutlined />基本设置</span>}
          key="general"
        >
          <Card>
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="darkMode"
                label="深色模式"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="autoSave"
                label="自动保存"
                valuePropName="checked"
                extra="自动保存项目更改"
              >
                <Switch />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  onClick={handleSaveSettings}
                  loading={loading}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings; 