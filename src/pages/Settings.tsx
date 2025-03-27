import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Switch, Button, message, Tabs, Alert, Divider } from 'antd';
import { SaveOutlined, KeyOutlined, SettingOutlined, ApiOutlined } from '@ant-design/icons';
import { useTheme } from '@/context/ThemeContext';
import styles from './Settings.module.less';

const { TabPane } = Tabs;

interface SettingsData {
  openaiApiKey: string;
  anthropicApiKey: string;
  autoSave: boolean;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 从localStorage加载设置
        const settings: Partial<SettingsData> = {
          openaiApiKey: localStorage.getItem('openaiApiKey') || '',
          anthropicApiKey: localStorage.getItem('anthropicApiKey') || '',
          autoSave: localStorage.getItem('autoSave') === 'true'
        };
        
        form.setFieldsValue({
          ...settings,
          darkMode: isDarkMode
        });
        setInitialized(true);
      } catch (error) {
        console.error('加载设置失败:', error);
        message.error('加载设置失败');
        setInitialized(true);
      }
    };
    
    loadSettings();
  }, [form, isDarkMode]);

  // 保存设置
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // 保存API设置
      localStorage.setItem('openaiApiKey', values.openaiApiKey || '');
      localStorage.setItem('anthropicApiKey', values.anthropicApiKey || '');
      localStorage.setItem('autoSave', values.autoSave ? 'true' : 'false');
      
      // 处理主题切换（如果与当前状态不同）
      if (values.darkMode !== isDarkMode) {
        toggleTheme();
      }
      
      message.success('设置已保存');
      setLoading(false);
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
      setLoading(false);
    }
  };

  if (!initialized) {
    return <div>加载中...</div>;
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