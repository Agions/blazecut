import React, { useState } from 'react';
import { Typography, Steps, Button, Upload, Card, Row, Col, Progress, Spin, Empty, Alert } from 'antd';
import { InboxOutlined, PlayCircleOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;
const { Step } = Steps;

const VideoAnalysis: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([
    '加载视频文件',
    '提取视频帧',
    '场景识别分析',
    '情感与内容分析',
    '生成时间标记',
  ]);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState(0);

  // 模拟分析进度
  const simulateAnalysis = () => {
    setAnalyzing(true);
    let step = 0;
    
    const interval = setInterval(() => {
      setAnalyzeProgress(prev => {
        const newProgress = prev + 5;
        
        // 更新当前分析步骤
        if (newProgress >= (step + 1) * 20 && step < 4) {
          step += 1;
          setCurrentAnalysisStep(step);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setAnalyzing(false);
          setAnalysisComplete(true);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  // 处理视频预览
  const handlePreview = (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj as Blob);
    }
    setVideoUrl(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  const handleNext = () => {
    if (current === 1) {
      simulateAnalysis();
    }
    setCurrent(current + 1);
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'video/*',
    fileList,
    beforeUpload: (file) => {
      setFileList([file]);
      // 创建预览URL
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setVideoUrl('');
    },
    onPreview: (file) => {
      handlePreview(file);
    }
  };

  const steps = [
    {
      title: '选择视频',
      content: (
        <div style={{ padding: '20px 0' }}>
          <Dragger {...uploadProps} style={{ padding: 24 }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽视频文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个视频文件上传，建议视频时长在5分钟以内，格式支持mp4, mov等常见格式
            </p>
          </Dragger>
          
          {fileList.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <Alert 
                message={`已选择视频: ${fileList[0].name}`} 
                type="success" 
                showIcon 
                style={{ marginBottom: 16 }}
              />
              
              {videoUrl && (
                <div style={{ textAlign: 'center' }}>
                  <video 
                    src={videoUrl} 
                    controls 
                    style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '视频预处理',
      content: (
        <div style={{ padding: '20px 0' }}>
          <Card title="视频信息" style={{ marginBottom: 24 }}>
            {fileList.length > 0 ? (
              <Row gutter={16}>
                <Col span={8}>
                  <div className="info-item">
                    <span className="label">视频名称:</span>
                    <span className="value">{fileList[0].name}</span>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="info-item">
                    <span className="label">文件大小:</span>
                    <span className="value">{(fileList[0].size! / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="info-item">
                    <span className="label">视频格式:</span>
                    <span className="value">{fileList[0].type}</span>
                  </div>
                </Col>
              </Row>
            ) : (
              <Empty description="暂无视频信息" />
            )}
          </Card>
          
          <Card title="预处理设置" style={{ marginBottom: 24 }}>
            <Alert 
              message="使用默认设置进行视频分析" 
              description="将使用默认的AI模型和参数进行视频内容分析，如需自定义设置请前往设置页面"
              type="info" 
              showIcon 
            />
          </Card>
        </div>
      ),
    },
    {
      title: '分析中',
      content: (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          {analyzing ? (
            <>
              <Spin size="large" />
              <Title level={4} style={{ marginTop: 24 }}>正在分析视频内容...</Title>
              <Progress percent={analyzeProgress} status="active" style={{ maxWidth: 400, margin: '24px auto' }} />
              
              <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
                {analysisSteps.map((step, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: 8,
                    opacity: index <= currentAnalysisStep ? 1 : 0.45
                  }}>
                    {index < currentAnalysisStep ? (
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    ) : index === currentAnalysisStep ? (
                      <Spin size="small" style={{ marginRight: 8 }} />
                    ) : (
                      <div style={{ width: 14, height: 14, borderRadius: 14, border: '1px solid #d9d9d9', marginRight: 8 }} />
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              
              <Paragraph style={{ marginTop: 24 }}>AI正在识别视频内容并提取关键场景，请耐心等待</Paragraph>
            </>
          ) : analysisComplete ? (
            <>
              <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
              <Title level={4} style={{ marginTop: 24 }}>分析完成!</Title>
              <Paragraph>视频内容分析已完成，可以进入下一步生成解说文案</Paragraph>
              <Progress percent={100} status="success" style={{ maxWidth: 400, margin: '24px auto' }} />
            </>
          ) : (
            <>
              <PlayCircleOutlined style={{ fontSize: 64 }} />
              <Title level={4} style={{ marginTop: 24 }}>准备就绪</Title>
              <Paragraph>点击下一步开始分析视频内容</Paragraph>
            </>
          )}
        </div>
      ),
    },
    {
      title: '生成解说',
      content: (
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="视频分析完成"
            description="视频内容分析已完成，点击下方按钮前往解说编辑页面进行文案生成和编辑"
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <FileTextOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4}>前往解说编辑</Title>
            <Paragraph>
              在解说编辑页面，您可以基于分析结果生成专业解说文案，支持多种风格和自定义编辑
            </Paragraph>
            <Button 
              type="primary" 
              size="large" 
              icon={<FileTextOutlined />}
              style={{ marginTop: 16 }}
            >
              进入解说编辑
            </Button>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="app-container">
      <Title level={3} className="page-title">视频分析</Title>
      <Paragraph>通过AI分析视频内容，识别关键场景、情绪和视觉元素，为解说生成提供基础</Paragraph>
      
      <Card>
        <Steps current={current} style={{ marginBottom: 32 }}>
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        
        <div className="steps-content">{steps[current].content}</div>
        
        <div className="steps-action" style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          {current > 0 && (
            <Button style={{ marginRight: 8 }} onClick={handlePrev}>
              上一步
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={handleNext} disabled={current === 0 && fileList.length === 0}>
              下一步
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary">
              完成
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VideoAnalysis; 