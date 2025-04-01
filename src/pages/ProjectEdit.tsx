import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Steps, Space, message, Alert, Typography, Select, Tooltip } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, VideoCameraOutlined, FormOutlined, RobotOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import VideoSelector from '@/components/VideoSelector';
import { saveProjectToFile } from '@/services/tauriService';
import { AI_MODEL_INFO, AIModelType } from '@/types';
import styles from './ProjectEdit.module.less';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addProject, updateProject, selectedAIModel, aiModelsSettings, setSelectedAIModel } = useStore();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [videoPath, setVideoPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModelType>(selectedAIModel);

  // 如果是编辑模式，加载项目数据
  useEffect(() => {
    if (id) {
      const project = projects.find(p => p.id === id);
      if (project) {
        form.setFieldsValue({
          name: project.name,
          description: project.description,
          aiModel: project.aiModel?.key || selectedAIModel
        });
        setVideoPath(project.videoUrl);
        setIsEdit(true);
        setCurrentStep(1); // 跳过选择视频步骤
        if (project.aiModel?.key) {
          setSelectedModel(project.aiModel.key as AIModelType);
        }
      } else {
        setError('找不到项目');
        navigate('/projects');
      }
    } else {
      // 新建项目时，设置默认选择的AI模型
      form.setFieldsValue({
        aiModel: selectedAIModel
      });
    }
  }, [id, projects, form, navigate, selectedAIModel]);

  const handleVideoSelected = (path: string, filename: string) => {
    try {
      setError(null);
      setVideoPath(path);
      // 从文件名预填充项目名称
      const projectName = filename.replace(/\.[^/.]+$/, ""); // 移除扩展名
      form.setFieldsValue({ name: projectName });
      
      // 前进到下一步
      setCurrentStep(1);
    } catch (error) {
      console.error('处理视频选择失败:', error);
      setError('处理视频选择失败，请重试');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      const values = await form.validateFields();
      
      if (!videoPath) {
        setError('请先选择视频文件');
        setLoading(false);
        return;
      }
      
      // 检查选择的AI模型是否有API密钥
      const modelKey = values.aiModel as AIModelType;
      const modelSettings = aiModelsSettings[modelKey];
      
      if (!modelSettings.enabled) {
        setError(`${AI_MODEL_INFO[modelKey].name}模型尚未启用，请在设置中配置API密钥`);
        setLoading(false);
        return;
      }
      
      const aiModel = {
        ...AI_MODEL_INFO[modelKey],
        apiKey: modelSettings.apiKey
      };
      
      if (isEdit && id) {
        // 更新现有项目
        const project = projects.find(p => p.id === id);
        if (project) {
          const updatedProject = {
            ...project,
            name: values.name,
            description: values.description || '',
            videoUrl: videoPath,
            aiModel,
            updatedAt: new Date().toISOString()
          };
          
          try {
            // 先保存到文件
            await saveProjectToFile(updatedProject);
            // 更新状态
            updateProject(updatedProject);
            message.success('项目更新成功');
            navigate(`/projects/${id}`);
          } catch (error) {
            console.error('保存项目文件失败:', error);
            setError('保存项目文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
            return;
          }
        }
      } else {
        // 创建新项目
        const newProject = {
          id: uuidv4(),
          name: values.name,
          description: values.description || '',
          videoUrl: videoPath,
          analysis: undefined,
          scripts: [],
          aiModel,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        try {
          // 先保存到文件
          await saveProjectToFile(newProject);
          // 更新状态
          addProject(newProject);
          // 更新默认AI模型
          setSelectedAIModel(modelKey);
          message.success('项目创建成功');
          navigate(`/projects/${newProject.id}`);
        } catch (error) {
          console.error('保存项目文件失败:', error);
          setError('保存项目文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
          return;
        }
      }
    } catch (error) {
      console.error('保存项目失败:', error);
      setError(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAIModelChange = (value: AIModelType) => {
    setSelectedModel(value);
    
    // 检查是否有API密钥
    const modelSettings = aiModelsSettings[value];
    if (!modelSettings.enabled) {
      message.warning(`您尚未配置${AI_MODEL_INFO[value].name}的API密钥，请前往"设置"页面进行配置`);
    }
  }

  const steps = [
    {
      title: '选择视频',
      content: (
        <div style={{padding: '20px 0'}}>
          <VideoSelector onVideoSelected={handleVideoSelected} />
        </div>
      ),
      icon: <VideoCameraOutlined />
    },
    {
      title: '项目信息',
      content: (
        <div className={styles.formContainer}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ name: '', description: '', aiModel: selectedAIModel }}
          >
            {error && (
              <Form.Item>
                <Alert
                  message="错误"
                  description={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError(null)}
                />
              </Form.Item>
            )}
  
            <Form.Item
              name="name"
              label={<span className="form-label">项目名称</span>}
              rules={[
                { required: true, message: '请输入项目名称' },
                { max: 50, message: '项目名称不能超过50个字符' }
              ]}
            >
              <Input placeholder="输入项目名称" size="large" style={{ fontSize: '16px' }} className="dark-mode-input" />
            </Form.Item>
            
            {videoPath && (
              <Form.Item 
                label={<span className="form-label">视频文件</span>}
              >
                <Text type="secondary" style={{wordBreak: 'break-all', fontSize: '14px', lineHeight: '1.8' }} className="file-path-text">
                  {videoPath}
                </Text>
                {!isEdit && (
                  <Button 
                    type="link" 
                    onClick={() => setCurrentStep(0)}
                    style={{paddingLeft: 0}}
                  >
                    重新选择
                  </Button>
                )}
              </Form.Item>
            )}
            
            <Form.Item
              name="aiModel"
              label={
                <span className="form-label">
                  AI 模型选择 
                  <Tooltip title="选择用于生成脚本的国产大模型">
                    <InfoCircleOutlined style={{ marginLeft: 8 }} />
                  </Tooltip>
                </span>
              }
              rules={[{ required: true, message: '请选择AI模型' }]}
            >
              <Select 
                placeholder="选择AI模型" 
                onChange={handleAIModelChange}
                className="dark-mode-input"
              >
                {Object.entries(AI_MODEL_INFO).map(([key, model]) => (
                  <Option 
                    key={key} 
                    value={key}
                    disabled={!aiModelsSettings[key as AIModelType].enabled}
                  >
                    <div className={styles.modelOption}>
                      <RobotOutlined className={styles.modelIcon} />
                      <span>{model.name}</span>
                      <span className={styles.modelProvider}>({model.provider})</span>
                      {!aiModelsSettings[key as AIModelType].enabled && (
                        <span className={styles.modelDisabled}>未配置</span>
                      )}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="description"
              label={<span className="form-label">项目描述</span>}
              rules={[
                { max: 500, message: '项目描述不能超过500个字符' }
              ]}
            >
              <TextArea 
                placeholder="输入项目描述（选填）"
                rows={4}
                style={{ fontSize: '14px' }}
                className="dark-mode-input"
              />
            </Form.Item>
          </Form>
        </div>
      ),
      icon: <FormOutlined />
    },
  ];

  return (
    <div className={styles.container}>
      <Card 
        className={styles.card}
        title={
          <div className={styles.header}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              className={styles.backButton}
            >
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              {isEdit ? '编辑项目' : '创建新项目'}
            </Title>
          </div>
        }
      >
        <div className={styles.content}>
          <Steps
            current={currentStep}
            items={steps.map(item => ({
              title: item.title,
              icon: item.icon,
            }))}
            className={styles.steps}
          />
          
          <div className={styles.stepsContent}>
            {steps[currentStep].content}
          </div>
          
          <div className={styles.stepsAction}>
            {currentStep > 0 && (
              <Button 
                style={{ margin: '0 8px' }} 
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                上一步
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={loading}
              >
                {isEdit ? '保存更改' : '创建项目'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectEdit; 