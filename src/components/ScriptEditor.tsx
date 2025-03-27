import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Space, Divider, message, Typography, Timeline } from 'antd';
import { DeleteOutlined, PlusOutlined, SaveOutlined, EditOutlined } from '@ant-design/icons';
import type { Script, ScriptSegment } from '@/types';
import { scriptApi } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { formatTime } from '@/utils/format';
import styles from './ScriptEditor.module.less';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface ScriptEditorProps {
  projectId?: string;
  scriptId?: string;
  initialScript?: Script;
  onSave?: (script: Script) => void;
  // 兼容两种接口
  segments?: ScriptSegment[];
  onSegmentsChange?: (segments: ScriptSegment[]) => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
  projectId,
  scriptId,
  initialScript,
  onSave,
  segments,
  onSegmentsChange,
}) => {
  const [script, setScript] = useState<Script | undefined>(initialScript);
  const [loading, setLoading] = useState(false);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [form] = Form.useForm();
  
  // 使用segments props初始化脚本内容（当使用旧接口时）
  useEffect(() => {
    if (segments && !initialScript) {
      setScript({
        id: scriptId || 'temp-script',
        videoId: projectId || 'temp-project',
        content: segments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [segments, initialScript, scriptId, projectId]);
  
  useEffect(() => {
    if (!initialScript && scriptId && projectId) {
      fetchScript();
    }
  }, [scriptId, initialScript, projectId]);
  
  const fetchScript = async () => {
    if (!projectId || !scriptId) return;
    
    try {
      setLoading(true);
      // 这个API方法需要在services/api.ts中添加
      const data = await scriptApi.getScript(projectId, scriptId);
      setScript(data);
    } catch (error) {
      message.error('获取脚本失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!script) return;
    
    if (projectId && scriptId && onSave) {
      try {
        setLoading(true);
        const updatedScript = await scriptApi.updateScript(projectId, scriptId, script);
        message.success('保存成功');
        onSave(updatedScript);
      } catch (error) {
        message.error('保存失败');
      } finally {
        setLoading(false);
      }
    } else if (onSegmentsChange) {
      // 使用新接口
      onSegmentsChange(script.content);
    }
  };
  
  const handleAddSegment = () => {
    if (!script) return;
    
    const lastSegment = script.content[script.content.length - 1];
    const newSegment: ScriptSegment = {
      id: Date.now().toString(),
      startTime: lastSegment ? lastSegment.endTime : 0,
      endTime: lastSegment ? lastSegment.endTime + 10 : 10,
      content: '',
      type: 'narration',
    };
    
    const newContent = [...script.content, newSegment];
    setScript({
      ...script,
      content: newContent,
    });
    
    // 如果使用新接口，同时更新父组件状态
    if (onSegmentsChange) {
      onSegmentsChange(newContent);
    }
  };
  
  const handleDeleteSegment = (index: number) => {
    if (!script) return;
    
    const newContent = [...script.content];
    newContent.splice(index, 1);
    
    setScript({
      ...script,
      content: newContent,
    });
    
    // 如果使用新接口，同时更新父组件状态
    if (onSegmentsChange) {
      onSegmentsChange(newContent);
    }
  };
  
  const handleUpdateSegment = (index: number, field: keyof ScriptSegment, value: any) => {
    if (!script) return;
    
    const newContent = [...script.content];
    newContent[index] = {
      ...newContent[index],
      [field]: value,
    };
    
    setScript({
      ...script,
      content: newContent,
    });
    
    // 如果使用新接口，同时更新父组件状态
    if (onSegmentsChange) {
      onSegmentsChange(newContent);
    }
  };
  
  const handleEditSegment = (segment: ScriptSegment) => {
    setEditingSegmentId(segment.id);
    
    // 设置表单初始值
    form.setFieldsValue({
      startMinutes: Math.floor(segment.startTime / 60),
      startSeconds: Math.floor(segment.startTime % 60),
      endMinutes: Math.floor(segment.endTime / 60),
      endSeconds: Math.floor(segment.endTime % 60),
      content: segment.content,
      type: segment.type
    });
  };
  
  const handleSaveEdit = () => {
    form.validateFields().then(values => {
      const { startMinutes, startSeconds, endMinutes, endSeconds, content, type } = values;
      
      const startTime = startMinutes * 60 + startSeconds;
      const endTime = endMinutes * 60 + endSeconds;
      
      if (!isValidTimeRange(startTime, endTime, editingSegmentId)) {
        return;
      }
      
      const updatedSegments = script?.content.map(s => 
        s.id === editingSegmentId 
          ? { ...s, startTime, endTime, content, type } 
          : s
      ) || [];
      
      setScript({
        ...script,
        content: updatedSegments,
        updatedAt: new Date().toISOString()
      });
      setEditingSegmentId(null);
      form.resetFields();
      
      if (onSegmentsChange) {
        onSegmentsChange(updatedSegments);
      }
    });
  };
  
  const handleCancelEdit = () => {
    setEditingSegmentId(null);
    form.resetFields();
  };
  
  const isValidTimeRange = (startTime: number, endTime: number, currentId?: string): boolean => {
    if (startTime >= endTime) {
      message.error('起始时间必须小于结束时间');
      return false;
    }
    
    if (script?.videoId && endTime > script.videoId.duration) {
      message.error(`结束时间不能超过视频总时长 ${formatTime(script.videoId.duration)}`);
      return false;
    }
    
    for (const segment of script?.content || []) {
      if (currentId && segment.id === currentId) continue;
      
      if (
        (startTime >= segment.startTime && startTime < segment.endTime) || 
        (endTime > segment.startTime && endTime <= segment.endTime) ||
        (startTime <= segment.startTime && endTime >= segment.endTime)
      ) {
        message.error(`时间段与 [${formatTime(segment.startTime)}-${formatTime(segment.endTime)}] 重叠`);
        return false;
      }
    }
    
    return true;
  };
  
  if (!script) {
    return <Card loading={loading} className={styles.container} />;
  }
  
  return (
    <div className={styles.scriptEditor}>
      <Card
        title={<Title level={4}>脚本编辑器</Title>}
        extra={
          <Space>
            <Button 
              type="primary" 
              onClick={handleSave}
              icon={<SaveOutlined />}
            >
              保存脚本
            </Button>
            <Button 
              onClick={handleAddSegment}
              icon={<PlusOutlined />}
            >
              添加段落
            </Button>
          </Space>
        }
        className={styles.editorCard}
      >
        <div className={styles.timeline}>
          <Timeline
            mode="left"
            items={script.content.map(segment => ({
              label: formatTime(segment.startTime),
              children: (
                <div className={styles.segmentItem}>
                  <div className={styles.segmentHeader}>
                    <Text strong className={styles.timeRange}>
                      [{formatTime(segment.startTime)} - {formatTime(segment.endTime)}]
                    </Text>
                    <Space size="small">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEditSegment(segment)}
                        title="编辑"
                      />
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteSegment(script.content.indexOf(segment))}
                        title="删除"
                      />
                    </Space>
                  </div>
                  
                  <div className={styles.segmentContent}>
                    {segment.content}
                  </div>
                </div>
              ),
              color: 'blue',
            }))}
          />
        </div>
        
        {editingSegmentId !== null && (
          <Card className={styles.editCard}>
            <Form
              form={form}
              layout="vertical"
            >
              <Space className={styles.timeInputs}>
                <Form.Item
                  label="开始时间"
                  required
                  style={{ marginBottom: 0 }}
                >
                  <Space>
                    <Form.Item
                      name="startMinutes"
                      rules={[{ required: true, message: '请输入分钟' }]}
                      noStyle
                    >
                      <Input
                        type="number"
                        min={0}
                        addonAfter="分"
                        style={{ width: 100 }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="startSeconds"
                      rules={[{ required: true, message: '请输入秒数' }]}
                      noStyle
                    >
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        addonAfter="秒"
                        style={{ width: 100 }}
                      />
                    </Form.Item>
                  </Space>
                </Form.Item>
                
                <Form.Item
                  label="结束时间"
                  required
                  style={{ marginBottom: 0 }}
                >
                  <Space>
                    <Form.Item
                      name="endMinutes"
                      rules={[{ required: true, message: '请输入分钟' }]}
                      noStyle
                    >
                      <Input
                        type="number"
                        min={0}
                        addonAfter="分"
                        style={{ width: 100 }}
                      />
                    </Form.Item>
                    <Form.Item
                      name="endSeconds"
                      rules={[{ required: true, message: '请输入秒数' }]}
                      noStyle
                    >
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        addonAfter="秒"
                        style={{ width: 100 }}
                      />
                    </Form.Item>
                  </Space>
                </Form.Item>
                
                <Form.Item
                  name="type"
                  label="类型"
                  initialValue="narration"
                >
                  <Input.Group compact>
                    <Input 
                      style={{ width: 120 }}
                      value="旁白"
                      readOnly
                    />
                  </Input.Group>
                </Form.Item>
              </Space>
              
              <Form.Item
                name="content"
                label="脚本内容"
                rules={[{ required: true, message: '请输入脚本内容' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="在此输入脚本内容"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button type="primary" onClick={handleSaveEdit} icon={<SaveOutlined />}>
                    保存段落
                  </Button>
                  <Button onClick={handleCancelEdit}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}
        
        {script.content.length === 0 && editingSegmentId === null && (
          <div className={styles.emptyState}>
            <Text type="secondary">还没有脚本内容，点击"添加段落"开始创建</Text>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAddSegment}
              style={{ marginTop: 16 }}
            >
              添加段落
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScriptEditor; 