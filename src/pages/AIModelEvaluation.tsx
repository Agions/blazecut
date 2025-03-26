import React, { useState, useEffect } from 'react';

/**
 * AI模型评测组件功能状态
 * 
 * ✅ 已完成功能：
 * - 视频文件选择与上传
 * - 单个模型评测
 * - 评测结果列表显示
 * - 评测结果详情查看
 * 
 * ⏳ 待完成功能：
 * - 模型对比分析（UI已实现，后端接口待完善）
 * - 评测结果导出功能
 * - 批量评测功能
 * - 评测历史记录管理
 * - 模型推荐系统
 */
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
  Descriptions,
  Divider,
  Spin,
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
  VideoCameraOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ExperimentOutlined,
  LineChartOutlined,
  BarChartOutlined,
  EyeOutlined,
  CompressOutlined
} from '@ant-design/icons';

import { open } from '@tauri-apps/plugin-dialog';
import { AIServiceFactory } from '../services/ai';
import { v4 as uuidv4 } from 'uuid';

import '../styles/AIModelEvaluation.less';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// 使用从 AI 服务导入的类型
import { ModelEvaluationResult, AIModelType } from '../services/ai';

// 扩展评测结果接口
interface EvaluationResult extends ModelEvaluationResult {
  id?: string;
  model?: AIModelType;
  timestamp?: string;
  vocabularyScore?: number;
  naturalness?: number;
  accuracy?: number;
  output?: string;
  videoName?: string;
  // UI相关属性
  style?: string;
  date?: string;
  // 将 modelType 映射到 model
  modelType: AIModelType; 
  // 将 evaluationDate 映射到 date和timestamp
  evaluationDate: Date;
  // 将 samplePrompt 映射到 prompt
  samplePrompt: string;
  prompt?: string;
  // 将 sampleResponse 映射到 response
  sampleResponse: string;
  response?: string;
}

// 重新定义模型比较数据类型
interface ModelComparisonData {
  modelType: AIModelType;
  model?: AIModelType; // 兼容之前的使用
  responseTime: number;
  qualityScore: number;
  vocabularyScore: number;
  // 宽松类型以允许其他可能的属性
  recommendations?: string; // 增加推荐字段
  summary?: string;
  emotion?: string;
  sampleSegment?: string;
  [key: string]: any; // 允许其他属性
}

// 重新定义比较结果类型，确保与现有代码兼容
interface ComparisonResult {
  id: string;
  videoName: string;
  date: string;
  modelData: ModelComparisonData[];
}

// 模型名称显示
const modelNames: Record<AIModelType, string> = {
  'qianwen': '靖瑟千问',
  'wenxin': '百度文心',
  'chatgpt': 'OpenAI ChatGPT',
  'deepseek': 'DeepSeek AI'
};

// 模型特点描述
const modelFeatures: Record<AIModelType, string[]> = {
  'qianwen': ['阿里云自研模型', '中文文学能力强', '原创内容生成力', '情感化表达'],
  'wenxin': ['百度自研模型', '中文理解优秀', '本地化内容把握准确', '多媒体内容理解'],
  'chatgpt': ['强大的通用性能', '多语言支持', '知识面广', '开发者生态成熟'],
  'deepseek': ['前沿开源模型', '强大的编程能力', '高质量长文本生成', '逻辑推理能力强']
};

/**
 * 模型推荐场景数据
 * 此功能将在后续开发中实现，目前仅保留数据结构
 * @todo 实现模型推荐功能 (优先级中)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _modelRecommendations = [
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
  const [form] = Form.useForm();
  const [compareForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('single');
  
  // 评测相关状态
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [selectedModels, setSelectedModels] = useState<AIModelType[]>([]);
  const [videoPath, setVideoPath] = useState('');
  const [videoName, setVideoName] = useState('');
  
  // 详情弹窗
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [currentDetails, setCurrentDetails] = useState<EvaluationResult | null>(null);
  
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
        const parts = selected.split(/[/\\]/);
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
        // @ts-expect-error - evaluateModel 方法参数数量问题
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
        
        // 将API返回的模型比较结果转换为我们定义的格式
        // 假设结果中可能有模型数据数组，但其结构与我们所需的不完全匹配
        const convertedResult: ComparisonResult = {
          id: (result as any).id || uuidv4(),
          videoName: (result as any).videoName || videoName,
          date: (result as any).date || new Date().toLocaleString(),
          modelData: []
        };
        
        // 处理可能存在的模型数据
        if (Array.isArray((result as any).models)) {
          convertedResult.modelData = (result as any).models.map((model: any) => ({
            modelType: model.model || model.modelType || 'unknown',
            model: model.model || model.modelType || 'unknown',
            responseTime: model.responseTime || 0,
            qualityScore: model.qualityScore || 0,
            vocabularyScore: model.vocabularyScore || 0,
            // 可能的其他属性
            summary: model.summary,
            emotion: model.emotion,
            sampleSegment: model.sampleSegment
          }));
        }
        setComparisonResult(convertedResult);
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
    // 如果有推荐，显示在控制台中
    if (record.recommendations) {
      console.log(`模型 ${record.modelType as string} 的推荐:`, record.recommendations);
    }
    
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
  
  /**
   * 渲染模型对比结果卡片
   * @param modelData 模型数据
   * @returns React 组件
   * @todo 在接下来的运营版本中实现该功能
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const renderModelCard = (modelData: ModelComparisonData) => {
    const model = modelData.modelType || (modelData.model as AIModelType);
    
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
                    rowKey="id"
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
                      dataSource={comparisonResult.modelData}
                      columns={[
                        {
                          title: '模型',
                          dataIndex: 'modelType',
                          key: 'modelType',
                          render: (modelType: AIModelType) => modelNames[modelType]
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
                      rowKey="modelType"
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
                <span>{currentDetails.model ? modelNames[currentDetails.model] : '未知模型'}</span>
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