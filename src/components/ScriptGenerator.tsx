import React, { useState } from 'react';
import { Card, Button, Radio, Form, Input, Select, message, Typography, Alert, Spin } from 'antd';
import { FileTextOutlined, RobotOutlined } from '@ant-design/icons';
import { scriptApi } from '@/services/api';
import type { Script, VideoAnalysis } from '@/types';
import styles from './ScriptGenerator.module.less';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ScriptGeneratorProps {
  projectId: string;
  analysis: VideoAnalysis;
  onScriptGenerated: (script: Script) => void;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({
  projectId,
  analysis,
  onScriptGenerated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [generationMethod, setGenerationMethod] = useState<'auto' | 'guided'>('auto');

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 在实际项目中，应当将表单值传递给后端
      const formValues = form.getFieldsValue();
      console.log('Form values:', formValues);

      const script = await scriptApi.generateScript(projectId);
      
      message.success('脚本生成成功');
      onScriptGenerated(script);
    } catch (error: any) {
      setError(error.message || '脚本生成失败');
      message.error('脚本生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={styles.container}>
      <Title level={4}>脚本生成</Title>
      <Paragraph>
        基于视频分析结果，生成专业的解说脚本。您可以选择自动生成，或者通过引导模式自定义脚本风格和内容。
      </Paragraph>

      {error && (
        <Alert
          message="生成错误"
          description={error}
          type="error"
          showIcon
          className={styles.alert}
        />
      )}

      <div className={styles.generationMethod}>
        <Radio.Group
          value={generationMethod}
          onChange={(e) => setGenerationMethod(e.target.value)}
          className={styles.radioGroup}
        >
          <Radio.Button value="auto">自动生成</Radio.Button>
          <Radio.Button value="guided">引导模式</Radio.Button>
        </Radio.Group>
      </div>

      {generationMethod === 'guided' && (
        <Form
          form={form}
          layout="vertical"
          className={styles.form}
        >
          <Form.Item
            name="style"
            label="脚本风格"
            initialValue="informative"
          >
            <Select>
              <Option value="informative">信息型 - 客观、教育性、详细</Option>
              <Option value="entertaining">娱乐型 - 活泼、风趣、吸引人</Option>
              <Option value="dramatic">戏剧型 - 情感丰富、紧张、引人入胜</Option>
              <Option value="casual">随意型 - 轻松、对话式、自然</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tone"
            label="语气"
            initialValue="neutral"
          >
            <Select>
              <Option value="neutral">中立</Option>
              <Option value="enthusiastic">热情</Option>
              <Option value="serious">严肃</Option>
              <Option value="humorous">幽默</Option>
              <Option value="inspirational">励志</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="focusPoints"
            label="重点关注"
          >
            <Select mode="multiple" placeholder="选择要重点关注的内容">
              {analysis.keyMoments.map((moment, index) => (
                <Option key={index} value={index}>
                  {moment.description} ({Math.floor(moment.timestamp / 60)}:{moment.timestamp % 60})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="additionalInstructions"
            label="其他说明"
          >
            <TextArea
              rows={4}
              placeholder="请输入其他特殊要求或说明..."
            />
          </Form.Item>
        </Form>
      )}

      <Button
        type="primary"
        icon={<FileTextOutlined />}
        onClick={handleGenerate}
        loading={loading}
        className={styles.button}
      >
        生成脚本
      </Button>

      {loading && (
        <div className={styles.spinner}>
          <Spin indicator={<RobotOutlined spin className={styles.loadingIcon} />} />
          <span className={styles.loadingText}>AI 正在努力创作中...</span>
        </div>
      )}
    </Card>
  );
};

export default ScriptGenerator; 