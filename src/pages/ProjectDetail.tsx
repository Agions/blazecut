import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Tabs, Space, Typography, message, Modal, Spin, Select, Form } from 'antd';
import { 
  EditOutlined, 
  ArrowLeftOutlined, 
  DeleteOutlined, 
  ExportOutlined,
  PlusOutlined,
  RobotOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '@/store';
import VideoInfo from '@/components/VideoInfo';
import ScriptEditor from '@/components/ScriptEditor';
import { exportScriptToFile, saveProjectToFile } from '@/services/tauriService';
import { generateScript, polishScript } from '@/services/ai';
import styles from './ProjectDetail.module.less';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, deleteProject } = useStore();
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [activeScript, setActiveScript] = useState<any>(null);
  const [scriptStyle, setScriptStyle] = useState<string>('简洁专业');

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

    try {
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
  
      // 先更新UI
      setProject(updatedProject);
      setActiveScript(newScript);
      
      // 保存到文件，显示loading
      message.loading('正在保存脚本...', 0.5);
      saveProjectToFile(updatedProject)
        .then(() => {
          updateProject(updatedProject);
          message.success('脚本创建成功');
        })
        .catch(error => {
          console.error('保存项目文件失败:', error);
          message.error('保存项目文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
          // 回滚UI状态
          setProject(project);
          setActiveScript(project.scripts?.[0] || null);
        });
    } catch (error) {
      console.error('创建脚本失败:', error);
      message.error('创建脚本失败');
    }
  };

  const handleGenerateScript = async () => {
    if (!project || !project.analysis) {
      message.warning('项目缺少视频分析数据，无法生成脚本');
      return;
    }
    
    try {
      setAiLoading(true);
      
      // 使用AI服务生成脚本
      const generatedScript = await generateScript(project.analysis, scriptStyle);
      
      // 更新项目
      const updatedProject = {
        ...project,
        scripts: [...(project.scripts || []), generatedScript],
        updatedAt: new Date().toISOString()
      };
      
      setProject(updatedProject);
      setActiveScript(generatedScript);
      updateProject(updatedProject);
      
      // 保存到文件
      await saveProjectToFile(updatedProject);
      
      message.success('脚本生成成功');
    } catch (error) {
      console.error('生成脚本失败:', error);
      message.error('生成脚本失败: ' + (error as Error).message);
    } finally {
      setAiLoading(false);
    }
  };
  
  const handlePolishScript = async () => {
    if (!project || !activeScript) {
      message.warning('没有选择脚本');
      return;
    }
    
    if (!activeScript.content || activeScript.content.length === 0) {
      message.warning('脚本内容为空，无法优化');
      return;
    }
    
    try {
      setAiLoading(true);
      
      // 使用AI服务优化脚本
      const polishedScript = await polishScript(activeScript, scriptStyle);
      
      // 更新脚本列表
      const updatedScripts = project.scripts.map((script: any) => 
        script.id === activeScript.id ? polishedScript : script
      );
      
      // 更新项目
      const updatedProject = {
        ...project,
        scripts: updatedScripts,
        updatedAt: new Date().toISOString()
      };
      
      setProject(updatedProject);
      setActiveScript(polishedScript);
      updateProject(updatedProject);
      
      // 保存到文件
      await saveProjectToFile(updatedProject);
      
      message.success('脚本优化成功');
    } catch (error) {
      console.error('优化脚本失败:', error);
      message.error('优化脚本失败: ' + (error as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleScriptChange = (segments: any[]) => {
    if (!project || !activeScript) return;
    
    try {
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
      
      // 先更新UI
      setProject(updatedProject);
      setActiveScript(updatedScript);
      
      // 保存到文件
      saveProjectToFile(updatedProject)
        .then(() => {
          updateProject(updatedProject);
          message.success('脚本内容已保存');
        })
        .catch(error => {
          console.error('保存项目文件失败:', error);
          message.error('保存项目文件失败: ' + (error instanceof Error ? error.message : '未知错误'));
          // 回滚UI状态
          setProject(project);
          setActiveScript(activeScript);
        });
    } catch (error) {
      console.error('更新脚本内容失败:', error);
      message.error('更新脚本内容失败');
    }
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
          <Space>
            <Form.Item label="脚本风格" style={{ marginBottom: 0 }}>
              <Select 
                value={scriptStyle}
                onChange={value => setScriptStyle(value)}
                style={{ width: 120 }}
              >
                <Option value="简洁专业">简洁专业</Option>
                <Option value="生动活泼">生动活泼</Option>
                <Option value="幽默风趣">幽默风趣</Option>
                <Option value="严肃正式">严肃正式</Option>
                <Option value="通俗易懂">通俗易懂</Option>
              </Select>
            </Form.Item>
            
            <Button 
              type="primary" 
              icon={aiLoading ? <LoadingOutlined /> : <RobotOutlined />}
              onClick={handleGenerateScript}
              loading={aiLoading}
              disabled={!project.analysis || aiLoading}
            >
              AI生成脚本
            </Button>
            
            <Button 
              icon={aiLoading ? <LoadingOutlined /> : <RobotOutlined />}
              onClick={handlePolishScript}
              loading={aiLoading}
              disabled={!activeScript || !activeScript.content || activeScript.content.length === 0 || aiLoading}
            >
              优化脚本
            </Button>
            
            <Button 
              icon={<PlusOutlined />}
              onClick={handleCreateScript}
            >
              创建空白脚本
            </Button>
          </Space>
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
              <Text type="secondary">暂无脚本，点击"AI生成脚本"或"创建空白脚本"按钮添加</Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail; 