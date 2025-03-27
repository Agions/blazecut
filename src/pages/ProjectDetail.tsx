import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tabs, Space, Typography, message, Modal, Spin } from 'antd';
import { 
  EditOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined, 
  ExportOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import VideoInfo from '@/components/VideoInfo';
import ScriptEditor from '@/components/ScriptEditor';
import { exportScriptToFile, saveProjectToFile } from '@/services/tauriService';
import styles from './ProjectDetail.module.less';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject } = useStore();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [activeScript, setActiveScript] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    
    const currentProject = projects.find(p => p.id === id);
    if (currentProject) {
      setProject(currentProject);
      // 如果有脚本，设置第一个为活动脚本
      if (currentProject.scripts && currentProject.scripts.length > 0) {
        setActiveScript(currentProject.scripts[0]);
      }
    } else {
      message.error('找不到项目信息');
      navigate('/projects');
    }
    
    setLoading(false);
  }, [id, projects, navigate]);

  const handleCreateScript = () => {
    if (!project) return;

    const newScript = {
      id: uuidv4(),
      videoId: project.id,
      content: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProject = {
      ...project,
      scripts: [...(project.scripts || []), newScript],
      updatedAt: new Date().toISOString()
    };

    setProject(updatedProject);
    setActiveScript(newScript);
    updateProject(updatedProject);
    
    // 保存到文件
    saveProjectToFile(updatedProject)
      .catch(error => console.error('保存项目文件失败:', error));
  };

  const handleScriptChange = (segments: any[]) => {
    if (!project || !activeScript) return;
    
    // 更新脚本内容
    const updatedScript = {
      ...activeScript,
      content: segments,
      updatedAt: new Date().toISOString()
    };
    
    // 更新脚本列表
    const updatedScripts = project.scripts.map((script: any) => 
      script.id === activeScript.id ? updatedScript : script
    );
    
    // 更新项目
    const updatedProject = {
      ...project,
      scripts: updatedScripts,
      updatedAt: new Date().toISOString()
    };
    
    setProject(updatedProject);
    setActiveScript(updatedScript);
    updateProject(updatedProject);
    
    // 保存到文件
    saveProjectToFile(updatedProject)
      .catch(error => console.error('保存项目文件失败:', error));
  };

  const handleExportScript = async () => {
    if (!project || !activeScript) {
      message.warning('没有可导出的脚本');
      return;
    }
    
    try {
      await exportScriptToFile(
        {
          projectName: project.name,
          createdAt: activeScript.createdAt,
          segments: activeScript.content
        },
        `${project.name}_脚本.txt`
      );
    } catch (error) {
      console.error('导出脚本失败:', error);
    }
  };

  const handleDeleteProject = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此项目吗？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        if (!id) return;
        
        try {
          deleteProject(id);
          message.success('项目已删除');
          navigate('/projects');
        } catch (error) {
          console.error('删除项目失败:', error);
          message.error('删除项目失败');
        }
      }
    });
  };

  if (loading) {
    return <Spin size="large" tip="加载中..." />;
  }

  if (!project) {
    return <div>项目不存在</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Space>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/projects')}
          >
            返回项目列表
          </Button>
          
          <Button 
            icon={<EditOutlined />}
            onClick={() => navigate(`/projects/${id}/edit`)}
          >
            编辑项目
          </Button>
          
          <Button 
            icon={<ExportOutlined />}
            onClick={handleExportScript}
            disabled={!activeScript || !activeScript.content || activeScript.content.length === 0}
          >
            导出脚本
          </Button>
          
          <Button 
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteProject}
          >
            删除项目
          </Button>
        </Space>
        
        <Title level={2}>{project.name}</Title>
      </div>

      {project.description && (
        <Card className={styles.descriptionCard}>
          <Text>{project.description}</Text>
        </Card>
      )}

      <VideoInfo 
        name={project.name}
        path={project.videoUrl}
        duration={project.analysis?.duration || 0}
      />
      
      <div className={styles.scriptSection}>
        <div className={styles.scriptHeader}>
          <Title level={4}>脚本编辑</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateScript}
          >
            创建新脚本
          </Button>
        </div>
        
        {project.scripts && project.scripts.length > 0 ? (
          <>
            <Tabs 
              activeKey={activeScript?.id} 
              onChange={key => {
                const script = project.scripts.find((s: any) => s.id === key);
                if (script) setActiveScript(script);
              }}
            >
              {project.scripts.map((script: any) => (
                <TabPane 
                  key={script.id} 
                  tab={`脚本 ${new Date(script.createdAt).toLocaleDateString()}`}
                >
                  <ScriptEditor 
                    segments={script.content || []}
                    onSegmentsChange={handleScriptChange}
                  />
                </TabPane>
              ))}
            </Tabs>
          </>
        ) : (
          <Card>
            <div className={styles.emptyScript}>
              <Text type="secondary">暂无脚本，点击"创建新脚本"按钮添加</Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail; 