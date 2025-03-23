import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Button, 
  Form, 
  Select, 
  Radio, 
  Input, 
  Space,
  Table,
  Tag,
  Row,
  Col,
  Divider,
  Spin,
  Progress,
  Tabs,
  Modal,
  message,
  Rate,
  Tooltip
} from 'antd';
import { 
  RocketOutlined, 
  ClockCircleOutlined, 
  StarOutlined, 
  CheckCircleOutlined, 
  DashboardOutlined, 
  RobotOutlined, 
  ThunderboltOutlined, 
  CompareOutlined, 
  FileTextOutlined,
  VideoCameraOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  LoadingOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  BarChartOutlined,
  EyeOutlined,
  CompressOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { open } from '@tauri-apps/plugin-dialog';
import { AIServiceFactory } from '../services/ai';

import '../styles/AIModelEvaluation.less';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

// 定义AIModelType类型
type AIModelType = 'openai' | 'azure' | 'anthropic' | 'baidu' | 'xfyun' | 'zhipu' | 'minimax' | 'moonshot';

// 模型名称显示
const modelNames: Record<AIModelType, string> = {
  'openai': 'OpenAI GPT',
  'azure': 'Azure OpenAI',
  'anthropic': 'Anthropic Claude',
  'baidu': '百度文心',
  'xfyun': '讯飞星火',
  'zhipu': '智谱AI',
  'minimax': 'MiniMax',
  'moonshot': 'Moonshot'
};

// 模型特点描述
const modelFeatures: Record<AIModelType, string[]> = {
  'openai': ['强大的通用性能', '多语言支持', '知识面广', '开发者生态成熟'],
  'azure': ['企业级安全', '合规性强', '扩展性好', '与Microsoft服务集成'],
  'anthropic': ['上下文理解深入', '遵循指令能力强', '偏好长文本输入', '安全性和伦理性高'],
  'baidu': ['中文理解优秀', '本地化内容把握准确', '多媒体内容理解', '适合创意和内容生成'],
  'xfyun': ['语音和文本结合优势', '专业领域术语准确', '中文语境理解精确', '适合对话和交互场景'],
  'zhipu': ['学术和专业领域强', '知识库丰富', '逻辑推理能力', '效率和准确度平衡'],
  'minimax': ['创意生成能力', '上下文管理优秀', '适合内容创作', '多轮对话连贯性'],
  'moonshot': ['回答精确性高', '专业领域知识丰富', '逻辑推理能力强', '自然的对话风格']
};

// 模型推荐场景
const modelRecommendations = [
  {
    scenario: '教学解说类短视频',
    models: ['anthropic', 'zhipu', 'openai'],
    reason: '这些模型在解释复杂概念和提供有逻辑性的教学内容方面表现优异，能够将专业知识以清晰、条理化的方式呈现。'
  },
  {
    scenario: '娱乐和创意内容',
    models: ['minimax', 'baidu', 'moonshot'],
    reason: '这些模型在生成有趣、创新的内容方面有优势，能在保持内容创意性的同时保持表达的流畅和连贯。'
  },
  {
    scenario: '产品介绍和营销',
    models: ['openai', 'xfyun', 'azure'],
    reason: '这些模型能够准确把握产品特点，生成有吸引力的营销文案，同时保持专业性和准确性。'
  },
  {
    scenario: '纪录片和知识性内容',
    models: ['zhipu', 'anthropic', 'moonshot'],
    reason: '这些模型在处理事实性内容、提供深度分析和保持内容可靠性方面表现出色，特别适合需要权威性的知识内容。'
  }
];

const AIModelEvaluation: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [compareForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('single');
  
  // 评测相关状态
  const [evaluationResults, setEvaluationResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [selectedModels, setSelectedModels] = useState<AIModelType[]>([]);
  const [videoPath, setVideoPath] = useState('');
  const [videoName, setVideoName] = useState('');
  
  // 详情弹窗
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<any>(null);
  
  // 加载评测结果
  const loadEvaluationResults = async () => {
    setLoading(true);
    try {
      const aiService = AIServiceFactory.getInstance();
      const results = await aiService.getEvaluationResults();
      setEvaluationResults(results);
    } catch (error) {
      console.error('加载评测结果失败:', error);
      message.error('加载评测结果失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadEvaluationResults();
  }, []);
  
  // 选择视频文件
  const handleSelectVideo = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: '视频文件',
          extensions: ['mp4', 'mov', 'avi', 'mkv']
        }]
      });
      
      if (selected && !Array.isArray(selected)) {
        setVideoPath(selected);
        // 提取文件名
        const parts = selected.split(/[\/\\]/);
        setVideoName(parts[parts.length - 1]);
      }
    } catch (error) {
      console.error('选择视频失败:', error);
      message.error('选择视频失败');
    }
  };
  
  // 评测单个模型
  const handleEvaluateModel = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      if (!videoPath) {
        message.warning('请先选择一个视频文件');
        return;
      }
      
      setEvaluating(true);
      
      try {
        const aiService = AIServiceFactory.getInstance();
        const result = await aiService.evaluateModel(values.model, {
          videoPath,
          prompt: values.prompt,
          style: values.style
        });
        
        message.success(`${modelNames[values.model as AIModelType]} 评测完成`);
        await loadEvaluationResults();
        
        // 显示详情
        setCurrentDetails(result);
        setDetailsVisible(true);
      } catch (error) {
        console.error('模型评测失败:', error);
        message.error('模型评测失败，请检查API配置或网络连接');
      } finally {
        setEvaluating(false);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };
  
  // 对比多个模型
  const handleCompareModels = async () => {
    try {
      await compareForm.validateFields();
      
      if (selectedModels.length < 2) {
        message.warning('请至少选择两个模型进行对比');
        return;
      }
      
      if (!videoPath) {
        message.warning('请先选择一个视频文件');
        return;
      }
      
      setComparing(true);
      
      try {
        const values = compareForm.getFieldsValue();
        const aiService = AIServiceFactory.getInstance();
        
        const result = await aiService.compareModels(selectedModels, {
          videoPath,
          prompt: values.prompt,
          style: values.style
        });
        
        setComparisonResult(result);
        message.success('模型对比评测完成');
      } catch (error) {
        console.error('模型对比失败:', error);
        message.error('模型对比失败，请检查API配置或网络连接');
      } finally {
        setComparing(false);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };
  
  // 查看评测详情
  const handleViewDetails = (record: any) => {
    setCurrentDetails(record);
    setDetailsVisible(true);
  };
  
  // 选择模型进行对比
  const handleSelectModel = (model: AIModelType, checked: boolean) => {
    if (checked) {
      setSelectedModels([...selectedModels, model]);
    } else {
      setSelectedModels(selectedModels.filter(m => m !== model));
    }
  };
  
  // 表格列配置
  const columns = [
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
      render: (model: AIModelType) => (
        <Space>
          <RobotOutlined />
          <span>{modelNames[model]}</span>
        </Space>
      )
    },
    {
      title: '视频',
      dataIndex: 'videoName',
      key: 'videoName',
      render: (text: string) => (
        <Space>
          <VideoCameraOutlined />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '响应时间',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => (
        <Space>
          <ClockCircleOutlined />
          <span>{time}秒</span>
        </Space>
      ),
      sorter: (a: any, b: any) => a.responseTime - b.responseTime
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      render: (score: number) => (
        <Rate disabled defaultValue={score} />
      ),
      sorter: (a: any, b: any) => a.qualityScore - b.qualityScore
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleViewDetails(record)}
            icon={<EyeOutlined />}
          >
            详情
          </Button>
        </Space>
      )
    }
  ];
  
  // 渲染模型对比结果卡片
  const renderModelCard = (modelData: any) => {
    const model = modelData.model as AIModelType;
    
    return (
      <Card 
        title={
          <div className="model-card-title">
            <RobotOutlined style={{ marginRight: 8 }} />
            {modelNames[model]}
          </div>
        }
        className="model-comparison-card"
      >
        <div className="model-metrics">
          <div className="metric-item">
            <div className="metric-icon">
              <ClockCircleOutlined />
            </div>
            <div className="metric-label">响应时间</div>
            <div className="metric-value">{modelData.responseTime}秒</div>
          </div>
          <div className="metric-item">
            <div className="metric-icon">
              <StarOutlined />
            </div>
            <div className="metric-label">质量评分</div>
            <div className="metric-value">
              <Rate disabled defaultValue={modelData.qualityScore} />
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-icon">
              <DashboardOutlined />
            </div>
            <div className="metric-label">词汇丰富度</div>
            <div className="metric-value">{modelData.vocabularyScore}/10</div>
          </div>
        </div>
        
        <Divider />
        
        <div className="model-sample">
          <div className="sample-summary">
            <div className="sample-label">内容摘要</div>
            <div className="sample-content">
              {modelData.summary}
              <Tag color="blue" className="emotion-tag">
                {modelData.emotion}
              </Tag>
            </div>
          </div>
          
          <div className="sample-segment">
            <div className="sample-label">解说片段示例</div>
            <div className="sample-content">
              {modelData.sampleSegment}
            </div>
          </div>
        </div>
        
        <Divider />
        
        <div className="model-features">
          <div className="sample-label">模型特点</div>
          {modelFeatures[model].map((feature, index) => (
            <div key={index} className="feature-item">
              <CheckCircleOutlined className="feature-icon" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };
  
  // 渲染性能对比条形图
  const renderPerformanceComparison = () => {
    if (!comparisonResult || !comparisonResult.models || comparisonResult.models.length < 2) {
      return null;
    }
    
    const metrics = [
      { name: '响应时间', key: 'responseTime', color: '#1890ff', reverse: true },
      { name: '质量评分', key: 'qualityScore', color: '#52c41a', reverse: false },
      { name: '词汇丰富度', key: 'vocabularyScore', color: '#722ed1', reverse: false },
      { name: '解说自然度', key: 'naturalness', color: '#fa8c16', reverse: false },
      { name: '专业准确度', key: 'accuracy', color: '#eb2f96', reverse: false }
    ];
    
    return (
      <div className="performance-comparison">
        {metrics.map(metric => {
          // 找出最大值用于计算百分比
          let maxValue = Math.max(...comparisonResult.models.map((m: any) => 
            metric.reverse ? 1/m[metric.key] : m[metric.key]
          ));
          
          return (
            <div key={metric.key} className="performance-item">
              <div className="performance-title">{metric.name}</div>
              <div className="performance-bars">
                {comparisonResult.models.map((model: any) => {
                  const value = model[metric.key];
                  // 对于响应时间，较小值更好，需要反转
                  const normalizedValue = metric.reverse 
                    ? (1/value) / maxValue * 100 
                    : value / maxValue * 100;
                  
                  return (
                    <div key={model.model} className="bar-item">
                      <div className="bar-label">{modelNames[model.model as AIModelType]}</div>
                      <div className="bar-container">
                        <div 
                          className="bar-value" 
                          style={{ 
                            width: `${normalizedValue}%`, 
                            backgroundColor: metric.color 
                          }} 
                        />
                        <div className="bar-text">
                          {metric.reverse 
                            ? `${value}秒` 
                            : metric.key === 'qualityScore' 
                              ? `${value}/5` 
                              : `${value}/10`
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // 渲染模型推荐
  const renderModelRecommendations = () => {
    return (
      <div className="model-recommendations">
        {modelRecommendations.map((rec, index) => (
          <div key={index} className="recommendation-item">
            <div className="scenario">{rec.scenario}</div>
            <div className="recommended-models">
              {rec.models.map(model => (
                <Tag key={model} color="blue">
                  {modelNames[model as AIModelType]}
                </Tag>
              ))}
            </div>
            <div className="recommendation-reason">{rec.reason}</div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="ai-model-evaluation-container">
      <div className="page-header">
        <Title level={2}>AI模型评测</Title>
        <Paragraph className="description">
          评测不同AI模型在视频解说生成中的表现，帮助您选择最适合的模型。
        </Paragraph>
      </div>
      
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        className="evaluation-tabs"
      >
        <TabPane 
          tab={
            <span>
              <RocketOutlined />
              单模型评测
            </span>
          } 
          key="single"
        >
          <Row gutter={24}>
            <Col span={8}>
              <Card 
                title="评测设置" 
                className="evaluation-form-card"
                extra={
                  <Tooltip title="选择一个AI模型并提供视频进行评测，获取详细的性能和质量报告">
                    <InfoCircleOutlined />
                  </Tooltip>
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    model: 'openai',
                    style: 'educational'
                  }}
                >
                  <Form.Item 
                    name="model" 
                    label="选择AI模型" 
                    rules={[{ required: true, message: '请选择一个AI模型' }]}
                  >
                    <Select>
                      <Select.Option value="openai">OpenAI GPT</Select.Option>
                      <Select.Option value="azure">Azure OpenAI</Select.Option>
                      <Select.Option value="anthropic">Anthropic Claude</Select.Option>
                      <Select.Option value="baidu">百度文心</Select.Option>
                      <Select.Option value="xfyun">讯飞星火</Select.Option>
                      <Select.Option value="zhipu">智谱AI</Select.Option>
                      <Select.Option value="minimax">MiniMax</Select.Option>
                      <Select.Option value="moonshot">Moonshot</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="选择视频文件">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        onClick={handleSelectVideo} 
                        icon={<VideoCameraOutlined />}
                        style={{ width: '100%' }}
                      >
                        选择视频
                      </Button>
                      {videoName && (
                        <div className="selected-video-info">
                          <span className="video-name">{videoName}</span>
                        </div>
                      )}
                    </Space>
                  </Form.Item>
                  
                  <Form.Item 
                    name="style" 
                    label="解说风格" 
                    rules={[{ required: true, message: '请选择解说风格' }]}
                  >
                    <Radio.Group>
                      <Radio value="educational">教学</Radio>
                      <Radio value="entertaining">娱乐</Radio>
                      <Radio value="professional">专业</Radio>
                      <Radio value="storytelling">叙事</Radio>
                    </Radio.Group>
                  </Form.Item>
                  
                  <Form.Item 
                    name="prompt" 
                    label="自定义提示词 (可选)"
                  >
                    <Input.TextArea 
                      rows={4} 
                      placeholder="输入自定义提示词以更精确地评测模型表现"
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      onClick={handleEvaluateModel}
                      loading={evaluating}
                      icon={<ExperimentOutlined />}
                      style={{ width: '100%' }}
                    >
                      开始评测
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            
            <Col span={16}>
              <Card 
                title="评测结果" 
                className="evaluation-results-card"
                extra={
                  <Button 
                    type="link" 
                    size="small" 
                    onClick={loadEvaluationResults}
                    icon={<LoadingOutlined spin={loading} />}
                  >
                    刷新
                  </Button>
                }
              >
                {loading ? (
                  <div className="empty-results">
                    <Spin size="large" />
                    <p>加载评测结果中...</p>
                  </div>
                ) : evaluationResults.length > 0 ? (
                  <Table 
                    dataSource={evaluationResults}
                    columns={columns}
                    rowKey={(record) => record.id}
                    className="evaluation-table"
                    pagination={{ pageSize: 5 }}
                  />
                ) : (
                  <div className="empty-results">
                    <ExperimentOutlined className="empty-icon" />
                    <p>暂无评测结果，请先进行模型评测</p>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CompressOutlined />
              模型对比
            </span>
          } 
          key="compare"
        >
          <Row gutter={24}>
            <Col span={8}>
              <Card 
                title="对比设置" 
                className="comparison-card"
                extra={
                  <Tooltip title="选择多个AI模型进行同时评测，直观比较不同模型的表现差异">
                    <InfoCircleOutlined />
                  </Tooltip>
                }
              >
                <Form
                  form={compareForm}
                  layout="vertical"
                  initialValues={{
                    style: 'educational'
                  }}
                >
                  <Form.Item label="选择模型进行对比">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {Object.entries(modelNames).map(([key, name]) => (
                        <div key={key} className="model-checkbox">
                          <input 
                            type="checkbox" 
                            id={`model-${key}`}
                            checked={selectedModels.includes(key as AIModelType)}
                            onChange={(e) => handleSelectModel(key as AIModelType, e.target.checked)}
                          />
                          <label htmlFor={`model-${key}`}>{name}</label>
                        </div>
                      ))}
                    </Space>
                  </Form.Item>
                  
                  <Form.Item label="选择视频文件">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        onClick={handleSelectVideo} 
                        icon={<VideoCameraOutlined />}
                        style={{ width: '100%' }}
                      >
                        选择视频
                      </Button>
                      {videoName && (
                        <div className="selected-video-info">
                          <span className="video-name">{videoName}</span>
                        </div>
                      )}
                    </Space>
                  </Form.Item>
                  
                  <Form.Item 
                    name="style" 
                    label="解说风格" 
                    rules={[{ required: true, message: '请选择解说风格' }]}
                  >
                    <Radio.Group>
                      <Radio value="educational">教学</Radio>
                      <Radio value="entertaining">娱乐</Radio>
                      <Radio value="professional">专业</Radio>
                      <Radio value="storytelling">叙事</Radio>
                    </Radio.Group>
                  </Form.Item>
                  
                  <Form.Item 
                    name="prompt" 
                    label="自定义提示词 (可选)"
                  >
                    <Input.TextArea 
                      rows={4} 
                      placeholder="输入自定义提示词以更精确地对比模型表现"
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      onClick={handleCompareModels}
                      loading={comparing}
                      icon={<BarChartOutlined />}
                      style={{ width: '100%' }}
                    >
                      开始对比评测
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            
            <Col span={16}>
              {comparing ? (
                <div className="comparing-loading">
                  <Spin size="large" tip="正在评测模型性能，这可能需要一些时间..." />
                </div>
              ) : comparisonResult ? (
                <div className="comparison-result">
                  <Card title="对比结果">
                    <Table 
                      dataSource={comparisonResult.models}
                      columns={[
                        {
                          title: '模型',
                          dataIndex: 'model',
                          key: 'model',
                          render: (model: AIModelType) => modelNames[model]
                        },
                        {
                          title: '响应时间',
                          dataIndex: 'responseTime',
                          key: 'responseTime',
                          render: (time: number) => `${time}秒`
                        },
                        {
                          title: '质量评分',
                          dataIndex: 'qualityScore',
                          key: 'qualityScore',
                          render: (score: number) => <Rate disabled defaultValue={score} />
                        },
                        {
                          title: '词汇丰富度',
                          dataIndex: 'vocabularyScore',
                          key: 'vocabularyScore',
                          render: (score: number) => `${score}/10`
                        }
                      ]}
                      rowKey="model"
                      pagination={false}
                    />
                  </Card>
                </div>
              ) : (
                <div className="empty-comparison">
                  <BarChartOutlined className="empty-icon" />
                  <p>暂无对比数据，请选择模型并开始对比评测</p>
                </div>
              )}
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              分析与推荐
            </span>
          } 
          key="analysis"
        >
          <Card title="模型推荐">
            <div className="empty-analysis">
              <LineChartOutlined className="empty-icon" />
              <p>暂无足够评测数据生成分析报告，请先进行更多模型评测</p>
            </div>
          </Card>
        </TabPane>
      </Tabs>
      
      {/* 评测详情弹窗 */}
      <Modal
        title="评测详情"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
        className="evaluation-details"
      >
        {currentDetails && (
          <>
            <div className="detail-header">
              <Space>
                <RobotOutlined />
                <span>{modelNames[currentDetails.model]}</span>
                <Tag color="blue">{currentDetails.style}</Tag>
              </Space>
              <span className="detail-date">{currentDetails.date}</span>
            </div>
            
            <div className="detail-metrics">
              <div className="detail-metric-item">
                <div className="metric-name">响应时间</div>
                <div className="metric-value">{currentDetails.responseTime}秒</div>
              </div>
              <div className="detail-metric-item">
                <div className="metric-name">质量评分</div>
                <div className="metric-value">
                  <Rate disabled defaultValue={currentDetails.qualityScore} />
                </div>
              </div>
              <div className="detail-metric-item">
                <div className="metric-name">词汇丰富度</div>
                <div className="metric-value">{currentDetails.vocabularyScore}/10</div>
              </div>
            </div>
            
            <div className="detail-content">
              <div className="detail-prompt">
                <div className="content-label">评测提示词</div>
                <div className="content-text">
                  {currentDetails.prompt}
                </div>
              </div>
              
              <div className="detail-response">
                <div className="content-label">模型响应</div>
                <div className="content-text response-text">
                  {currentDetails.response}
                </div>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AIModelEvaluation; 