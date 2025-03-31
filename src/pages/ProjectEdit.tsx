import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Steps, Space, message, Alert, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, VideoCameraOutlined, FormOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import VideoSelector from '@/components/VideoSelector';
import { saveProjectToFile } from '@/services/tauriService';
import styles from './ProjectEdit.module.less';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addProject, updateProject } = useStore();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [videoPath, setVideoPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 如果是编辑模式，加载项目数据
  useEffect(() => {
    if (id) {
      const project = projects.find(p => p.id === id);
      if (project) {
        form.setFieldsValue({
          name: project.name,
          description: project.description
        });
        setVideoPath(project.videoUrl);
        setIsEdit(true);
        setCurrentStep(1); // 跳过选择视频步骤
      } else {
        setError('找不到项目');
        navigate('/projects');
      }
    }
  }, [id, projects, form, navigate]);

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
      
      if (isEdit && id) {
        // 更新现有项目
        const project = projects.find(p => p.id === id);
        if (project) {
          const updatedProject = {
            ...project,
            name: values.name,
            description: values.description || '',
            videoUrl: videoPath,
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        try {
          // 先保存到文件
          await saveProjectToFile(newProject);
          // 更新状态
          addProject(newProject);
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
            initialValues={{ name: '', description: '' }}
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
              name="description"
              label={<span className="form-label">项目描述</span>}
              rules={[
                { max: 500, message: '项目描述不能超过500个字符' }
              ]}
            >
              <TextArea 
                placeholder="输入项目描述（可选）" 
                autoSize={{ minRows: 4, maxRows: 8 }}
                size="large"
                style={{ fontSize: '15px', lineHeight: '1.6' }}
                className="dark-mode-input"
              />
            </Form.Item>
            
            <div className={styles.formButtons}>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSubmit}
                loading={loading}
                size="large"
              >
                {isEdit ? '更新项目' : '保存项目'}
              </Button>
              
              {!isEdit && currentStep === 1 && (
                <Button 
                  onClick={() => {
                    setCurrentStep(0);
                    setError(null);
                  }}
                  size="large"
                >
                  返回选择视频
                </Button>
              )}
            </div>
          </Form>
        </div>
      ),
      icon: <FormOutlined />
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/projects')}
          size="large"
        >
          返回项目列表
        </Button>
        <h1>{isEdit ? '编辑项目' : '创建新项目'}</h1>
      </div>
      
      <Card className={styles.card}>
        <Steps 
          current={currentStep} 
          items={steps.map(item => ({
            title: item.title,
            icon: item.icon
          }))}
          style={{
            marginTop: '12px',
            marginBottom: '12px'
          }}
        />
        
        <div className={styles.stepsContent}>
          {steps[currentStep].content}
        </div>
      </Card>
    </div>
  );
};

export default ProjectEdit; 