import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Form, 
  Input, 
  Select, 
  Modal, 
  Tooltip, 
  Dropdown, 
  Menu, 
  message 
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlayCircleOutlined, 
  PlusOutlined, 
  SaveOutlined, 
  ExportOutlined, 
  DownOutlined 
} from '@ant-design/icons';
import { VideoSegment, formatDuration, previewSegment } from '@/services/videoService';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import styles from './ScriptEditor.module.less';

interface ScriptEditorProps {
  videoPath: string;
  initialSegments?: VideoSegment[];
  onSave: (segments: VideoSegment[]) => void;
  onExport?: (format: string) => void;
}

/**
 * 脚本编辑器组件
 */
const ScriptEditor: React.FC<ScriptEditorProps> = ({
  videoPath,
  initialSegments = [],
  onSave,
  onExport
}) => {
  const [segments, setSegments] = useState<VideoSegment[]>(initialSegments);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm] = Form.useForm();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  
  // 当段落变化时重新计算总时长
  useEffect(() => {
    const duration = segments.reduce((sum, segment) => sum + (segment.end - segment.start), 0);
    setTotalDuration(duration);
  }, [segments]);

  // 添加新片段
  const handleAddSegment = () => {
    // 计算新片段的开始时间（从上一个片段的结束时间开始）
    const lastSegment = segments.length > 0 ? segments[segments.length - 1] : null;
    const startTime = lastSegment ? lastSegment.end : 0;
    const endTime = startTime + 30; // 默认片段长度30秒
    
    // 初始化表单值
    editForm.setFieldsValue({
      start: startTime,
      end: endTime,
      type: 'narration',
      content: ''
    });
    
    // 设置编辑索引为新片段
    setEditingIndex(segments.length);
  };

  // 编辑片段
  const handleEditSegment = (index: number) => {
    const segment = segments[index];
    
    // 初始化表单值
    editForm.setFieldsValue({
      start: segment.start,
      end: segment.end,
      type: segment.type || 'narration',
      content: segment.content || ''
    });
    
    // 设置编辑索引
    setEditingIndex(index);
  };

  // 保存编辑片段
  const handleSaveSegment = () => {
    editForm.validateFields().then(values => {
      const start = parseFloat(values.start);
      const end = parseFloat(values.end);
      
      // 创建新的片段数组，更新编辑的片段
      const newSegments = [...segments];
      const segment: VideoSegment = {
        start,
        end,
        type: values.type,
        content: values.content
      };
      
      if (editingIndex !== null) {
        if (editingIndex < segments.length) {
          // 更新现有片段
          newSegments[editingIndex] = segment;
        } else {
          // 添加新片段
          newSegments.push(segment);
        }
      }
      
      // 更新状态并关闭编辑
      setSegments(newSegments);
      setEditingIndex(null);
      editForm.resetFields();
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingIndex(null);
    editForm.resetFields();
  };

  // 删除片段
  const handleDeleteSegment = (index: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个片段吗？',
      onOk: () => {
        const newSegments = [...segments];
        newSegments.splice(index, 1);
        setSegments(newSegments);
      }
    });
  };

  // 预览片段
  const handlePreviewSegment = async (index: number) => {
    try {
      setPreviewLoading(true);
      const segment = segments[index];
      
      // 使用服务函数生成预览
      const previewPath = await previewSegment(videoPath, segment);
      
      // 设置预览源并显示预览
      setPreviewSrc(convertFileSrc(previewPath));
      setPreviewVisible(true);
    } catch (error) {
      console.error('生成预览失败:', error);
      message.error('生成预览失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 导出脚本
  const handleExport = () => {
    setExportMenuVisible(true);
  };

  // 打开 AI 优化模态框
  const handleOpenAIModal = () => {
    setAiModalVisible(true);
  };

  // AI 优化脚本
  const handleAIImprove = async () => {
    try {
      message.info('正在使用 AI 优化脚本...');
      
      // 这里应该实现调用 AI API 优化脚本的功能
      // 当前是模拟实现
      
      // 关闭模态框
      setAiModalVisible(false);
      
      // 模拟优化完成
      setTimeout(() => {
        message.success('脚本优化完成');
      }, 2000);
    } catch (error) {
      console.error('AI 优化脚本失败:', error);
      message.error('AI 优化脚本失败');
    }
  };

  // 解析脚本文本为段落
  const parseScriptText = (text: string): VideoSegment[] => {
    try {
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const resultSegments: VideoSegment[] = [];
      
      let currentSegment: VideoSegment | null = null;
      
      for (const line of lines) {
        // 尝试匹配时间轴格式 [00:00 - 00:00] 文本内容
        const timeMatch = line.match(/\[(\d{1,2}:\d{2}(?::\d{2})?) - (\d{1,2}:\d{2}(?::\d{2})?)\]/);
        
        if (timeMatch) {
          // 解析时间
          const startTime = parseTimeString(timeMatch[1]);
          const endTime = parseTimeString(timeMatch[2]);
          
          // 提取内容（时间轴后面的文本）
          const content = line.substring(timeMatch[0].length).trim();
          
          currentSegment = {
            start: startTime,
            end: endTime,
            type: 'narration',
            content
          };
          
          resultSegments.push(currentSegment);
        } else if (currentSegment) {
          // 如果没有匹配到时间轴，但有当前片段，将这行添加到当前片段的内容中
          currentSegment.content += '\n' + line.trim();
        }
      }
      
      return resultSegments;
    } catch (error) {
      console.error('解析脚本失败:', error);
      return [];
    }
  };

  // 解析时间字符串为秒数
  const parseTimeString = (timeString: string): number => {
    const parts = timeString.split(':').map(Number);
    
    if (parts.length === 3) {
      // 格式: HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // 格式: MM:SS
      return parts[0] * 60 + parts[1];
    }
    
    return 0;
  };

  // 表格列定义
  const columns = [
    {
      title: '时间',
      key: 'time',
      width: 180,
      render: (_: any, record: VideoSegment, index: number) => (
        <span>
          {formatDuration(record.start)} - {formatDuration(record.end)}
        </span>
      )
    },
    {
      title: '时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (_: any, record: VideoSegment) => (
        <span>{formatDuration(record.end - record.start)}</span>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <span>
          {type === 'narration' ? '旁白' : 
           type === 'dialogue' ? '对白' : 
           type === 'action' ? '动作' : 
           type === 'transition' ? '转场' : type}
        </span>
      )
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <div className={styles.contentCell}>
          {content || <span className={styles.emptyContent}>（无内容）</span>}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: VideoSegment, index: number) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditSegment(index)}
            />
          </Tooltip>
          <Tooltip title="预览">
            <Button 
              type="text" 
              icon={<PlayCircleOutlined />} 
              onClick={() => handlePreviewSegment(index)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteSegment(index)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className={styles.scriptEditor}>
      <Card 
        title="脚本编辑"
        className={styles.editorCard}
        extra={
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={handleOpenAIModal}
            >
              AI优化
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />}
              onClick={() => onSave(segments)}
            >
              保存
            </Button>
            {onExport && (
              <Dropdown
                overlay={
                  <Menu onClick={({ key }) => onExport(key as string)}>
                    <Menu.Item key="txt">文本文件 (.txt)</Menu.Item>
                    <Menu.Item key="srt">字幕文件 (.srt)</Menu.Item>
                    <Menu.Item key="doc">Word文档 (.docx)</Menu.Item>
                  </Menu>
                }
                visible={exportMenuVisible}
                onVisibleChange={setExportMenuVisible}
              >
                <Button icon={<ExportOutlined />} onClick={handleExport}>
                  导出 <DownOutlined />
                </Button>
              </Dropdown>
            )}
          </Space>
        }
      >
        <div className={styles.statsBar}>
          <div>总片段: {segments.length}</div>
          <div>总时长: {formatDuration(totalDuration)}</div>
        </div>
        
        <Table
          rowKey={(record, index) => String(index)}
          dataSource={segments}
          columns={columns}
          pagination={false}
          className={styles.segmentsTable}
          footer={() => (
            <Button 
              type="dashed" 
              icon={<PlusOutlined />} 
              block
              onClick={handleAddSegment}
            >
              添加片段
            </Button>
          )}
        />
        
        {editingIndex !== null && (
          <div className={styles.editForm}>
            <Card title={`编辑片段 #${editingIndex + 1}`} className={styles.editCard}>
              <Form
                form={editForm}
                layout="vertical"
              >
                <div className={styles.timeInputs}>
                  <Form.Item
                    name="start"
                    label="开始时间 (秒)"
                    rules={[{ required: true, message: '请输入开始时间' }]}
                  >
                    <Input type="number" step="0.1" min="0" />
                  </Form.Item>
                  
                  <Form.Item
                    name="end"
                    label="结束时间 (秒)"
                    rules={[
                      { required: true, message: '请输入结束时间' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (value > getFieldValue('start')) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('结束时间必须大于开始时间'));
                        },
                      }),
                    ]}
                  >
                    <Input type="number" step="0.1" min="0" />
                  </Form.Item>
                </div>
                
                <Form.Item
                  name="type"
                  label="类型"
                  rules={[{ required: true, message: '请选择类型' }]}
                >
                  <Select>
                    <Select.Option value="narration">旁白</Select.Option>
                    <Select.Option value="dialogue">对白</Select.Option>
                    <Select.Option value="action">动作</Select.Option>
                    <Select.Option value="transition">转场</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="content"
                  label="内容"
                  rules={[{ required: true, message: '请输入内容' }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
                
                <div className={styles.formActions}>
                  <Space>
                    <Button onClick={handleCancelEdit}>取消</Button>
                    <Button type="primary" onClick={handleSaveSegment}>保存</Button>
                  </Space>
                </div>
              </Form>
            </Card>
          </div>
        )}
      </Card>
      
      <Modal
        title="预览片段"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div className={styles.previewContainer}>
          {previewLoading ? (
            <div className={styles.previewLoading}>
              <p>正在生成预览...</p>
            </div>
          ) : (
            <video 
              src={previewSrc}
              controls
              autoPlay
              className={styles.previewVideo}
            />
          )}
        </div>
      </Modal>
      
      <Modal
        title="AI 优化脚本"
        visible={aiModalVisible}
        onCancel={() => setAiModalVisible(false)}
        onOk={handleAIImprove}
      >
        <p>使用 AI 优化脚本将会根据视频内容和当前脚本，生成更加专业的表达和结构。</p>
        <p>点击确定开始优化。</p>
      </Modal>
    </div>
  );
};

export default ScriptEditor; 