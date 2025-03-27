import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Steps, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, VideoCameraOutlined, FormOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import VideoSelector from '@/components/VideoSelector';
import { saveProjectToFile } from '@/services/tauriService';
import styles from './ProjectEdit.module.less';

const { TextArea } = Input;
const { Step } = Steps;

const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addProject, updateProject } = useStore();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [videoPath, setVideoPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

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
        message.error('找不到项目');
        navigate('/projects');
      }
    }
  }, [id, projects, form, navigate]);

  const handleVideoSelected = (path: string, filename: string) => {
    setVideoPath(path);
    // 从文件名预填充项目名称
    const projectName = filename.replace(/\.[^/.]+$/, ""); // 移除扩展名
    form.setFieldsValue({ name: projectName });
    
    // 前进到下一步
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!videoPath) {
        message.error('请先选择视频文件');
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
          
          updateProject(updatedProject);
          
          // 保存到文件
          try {
            await saveProjectToFile(updatedProject);
          } catch (error) {
            console.error('保存项目文件失败:', error);
          }
          
          message.success('项目更新成功');
          navigate(`/projects/${id}`);
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
        
        // 添加到store
        addProject(newProject);
        
        // 保存到文件
        try {
          await saveProjectToFile(newProject);
        } catch (error) {
          console.error('保存项目文件失败:', error);
        }
        
        message.success('项目创建成功');
        navigate(`/projects/${newProject.id}`);
      }
    } catch (error) {
      console.error('保存项目失败:', error);
      message.error('保存失败，请重试');
      setLoading(false);
    }
  };

  const steps = [
    {
      title: '选择视频',
      content: <VideoSelector onVideoSelected={handleVideoSelected} />,
      icon: <VideoCameraOutlined />
    },
    {
      title: '项目信息',
      content: (
        <Form
          form={form}
          layout="vertical"
          initialValues={{ name: '', description: '' }}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="输入项目名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="项目描述"
          >
            <TextArea 
              placeholder="输入项目描述（可选）" 
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSubmit}
                loading={loading}
              >
                {isEdit ? '更新项目' : '保存项目'}
              </Button>
              
              {!isEdit && (
                <Button onClick={() => setCurrentStep(0)}>
                  返回选择视频
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>
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
        >
          返回项目列表
        </Button>
        <h1>{isEdit ? '编辑项目' : '创建新项目'}</h1>
      </div>
      
      <Card className={styles.card}>
        <Steps current={currentStep} items={steps.map(item => ({
          title: item.title,
          icon: item.icon
        }))} />
        
        <div className={styles.stepsContent}>
          {steps[currentStep].content}
        </div>
      </Card>
    </div>
  );
};

export default ProjectEdit; 