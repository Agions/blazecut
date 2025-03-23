// AI接口服务
import axios from 'axios';
import { ScriptSegment, AIAnalysisResult } from '../../interfaces';

// AI模型类型
export type AIModelType = 'qianwen' | 'wenxin' | 'chatgpt' | 'deepseek';

// 解说风格
export type ScriptStyle = 'formal' | 'casual' | 'humorous' | 'dramatic';

// 视频分析配置
export interface VideoAnalysisConfig {
  modelType: AIModelType;
  style: ScriptStyle;
  customPrompt?: string;
  useTemplate?: string;
  includeFrames?: boolean;
}

// 分析结果接口，与AIAnalysisResult对接
export interface AnalysisResult {
  scriptSegments: {
    startTime: number;
    duration: number;
    content: string;
    emotion?: string;
    tags?: string[];
  }[];
  tags?: string[];
  summary?: string;
  keywords?: string[];
}

// AI模型评测接口
export interface ModelEvaluationResult {
  modelType: AIModelType;
  responseTime: number; // 毫秒
  tokensGenerated: number;
  qualityScore: number; // 1-10分，由用户评分
  evaluationDate: Date;
  samplePrompt: string;
  sampleResponse: string;
}

// 模型比较结果
export interface ModelComparisonResult {
  prompt: string;
  style: ScriptStyle;
  videoPath: string;
  results: {
    modelType: AIModelType;
    responseTime: number;
    qualityScore: number;
    summary: string;
    sampleSegment: {
      content: string;
      emotion?: string;
    };
  }[];
}

// 提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'general' | 'educational' | 'entertainment' | 'marketing' | 'custom';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 模型API配置
export interface AIModelConfig {
  apiKey: string;
  endpoint: string;
  enabled: boolean;
}

// 基础AI接口
class BaseAIService {
  protected apiKey: string;
  protected endpoint: string;

  constructor(apiKey: string, endpoint: string) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  async analyzeVideo(
    videoPath: string, 
    config: VideoAnalysisConfig
  ): Promise<AnalysisResult> {
    throw new Error('Method not implemented');
  }
  
  // 将分析结果转换为应用接口格式
  protected convertToAnalysisResult(result: AnalysisResult): AIAnalysisResult {
    return {
      segments: result.scriptSegments.map(segment => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        startTime: segment.startTime,
        duration: segment.duration,
        content: segment.content,
        emotion: segment.emotion || 'neutral',
        tags: segment.tags || []
      })),
      summary: result.summary,
      keywords: result.keywords || result.tags
    };
  }
}

// 通义千问服务
class QianwenService extends BaseAIService {
  async analyzeVideo(
    videoPath: string, 
    config: VideoAnalysisConfig
  ): Promise<AnalysisResult> {
    // 模拟请求
    console.log(`使用通义千问分析视频: ${videoPath}，风格: ${config.style}`);
    
    try {
      // 实际API请求示例 (在实际环境下实现)
      // const response = await axios.post(this.endpoint, {
      //   model: "qwen-turbo",
      //   messages: [
      //     {role: "system", content: `你是一个专业的短视频解说员。请根据视频内容生成${config.style}风格的解说文案。`},
      //     {role: "user", content: `请为这个视频生成解说文案，视频路径：${videoPath}`}
      //   ],
      //   apiKey: this.apiKey
      // });
      // return response.data.result;
      
      // 模拟数据
      return {
        scriptSegments: [
          {
            startTime: 0,
            duration: 5,
            content: '大家好，今天我们来讲解这部短剧的精彩内容',
            emotion: 'neutral',
            tags: ['开场白']
          },
          {
            startTime: 6,
            duration: 8,
            content: '故事发生在一个小山村，主人公李小明是一名普通的大学生',
            emotion: 'neutral',
            tags: ['人物介绍']
          },
          {
            startTime: 15,
            duration: 10,
            content: '暑假期间，他回到家乡，发现村里的变化让他感到惊讶',
            emotion: 'surprised',
            tags: ['情节']
          }
        ],
        tags: ['青春', '乡村', '成长', '亲情'],
        summary: '一个大学生回到家乡，发现了家乡的变化，同时也找到了自己的人生方向。'
      };
    } catch (error) {
      console.error('通义千问分析失败:', error);
      throw new Error('通义千问API调用失败');
    }
  }
}

// 文心一言服务
class WenxinService extends BaseAIService {
  async analyzeVideo(
    videoPath: string, 
    config: VideoAnalysisConfig
  ): Promise<AnalysisResult> {
    // 模拟请求
    console.log(`使用文心一言分析视频: ${videoPath}，风格: ${config.style}`);
    
    try {
      // 实际API请求示例 (在实际环境下实现)
      // const response = await axios.post(this.endpoint, {
      //   messages: [
      //     {role: "system", content: `你是一个专业的短视频解说员。请根据视频内容生成${config.style}风格的解说文案。`},
      //     {role: "user", content: `请为这个视频生成解说文案，视频路径：${videoPath}`}
      //   ],
      //   token: this.apiKey
      // });
      // return response.data.result;
      
      // 模拟数据
      return {
        scriptSegments: [
          {
            startTime: 0,
            duration: 6,
            content: '欢迎收看我们的短剧分析，今天要为大家解读的是一部乡村题材的作品',
            emotion: 'neutral',
            tags: ['开场白']
          },
          {
            startTime: 7,
            duration: 9,
            content: '男主角李小明是城市里的大学生，暑假回到家乡小山村',
            emotion: 'neutral',
            tags: ['人物介绍']
          },
          {
            startTime: 17,
            duration: 8,
            content: '他看到家乡的巨大变化，农村的现代化建设让他震惊不已',
            emotion: 'surprised',
            tags: ['情节']
          }
        ],
        tags: ['现代化', '城乡差异', '返乡', '成长'],
        summary: '讲述了一位大学生返乡后看到农村现代化建设的故事，体现了中国乡村的巨大变迁。'
      };
    } catch (error) {
      console.error('文心一言分析失败:', error);
      throw new Error('文心一言API调用失败');
    }
  }
}

// ChatGPT服务
class ChatGPTService extends BaseAIService {
  async analyzeVideo(
    videoPath: string, 
    config: VideoAnalysisConfig
  ): Promise<AnalysisResult> {
    // 模拟请求
    console.log(`使用ChatGPT分析视频: ${videoPath}，风格: ${config.style}`);
    
    try {
      // 实际API请求示例 (在实际环境下实现)
      // const response = await axios.post(this.endpoint, {
      //   model: "gpt-3.5-turbo",
      //   messages: [
      //     {role: "system", content: `你是一个专业的短视频解说员。请根据视频内容生成${config.style}风格的解说文案。`},
      //     {role: "user", content: `请为这个视频生成解说文案，视频路径：${videoPath}`}
      //   ],
      //   headers: {
      //     "Authorization": `Bearer ${this.apiKey}`
      //   }
      // });
      // return response.data.choices[0].message.content;
      
      // 模拟数据
      return {
        scriptSegments: [
          {
            startTime: 0,
            duration: 7,
            content: '这是一部关于返乡青年的短剧，我们一起来看看它讲述了什么故事',
            emotion: 'neutral',
            tags: ['开场白']
          },
          {
            startTime: 8,
            duration: 10,
            content: '李小明，一个阳光开朗的大学生，暑假回到自己生活了十几年的小山村',
            emotion: 'happy',
            tags: ['人物介绍']
          },
          {
            startTime: 19,
            duration: 12,
            content: '家乡的变化让他惊喜，新修的道路，整洁的房屋，和村民们幸福的笑容',
            emotion: 'surprised',
            tags: ['情节']
          }
        ],
        tags: ['返乡', '乡村振兴', '青春', '情感'],
        summary: '一部关于乡村振兴和青年返乡创业的温情短剧，展现了新时代农村的新面貌。'
      };
    } catch (error) {
      console.error('ChatGPT分析失败:', error);
      throw new Error('ChatGPT API调用失败');
    }
  }
}

// DeepSeek服务
class DeepseekService extends BaseAIService {
  async analyzeVideo(
    videoPath: string, 
    config: VideoAnalysisConfig
  ): Promise<AnalysisResult> {
    // 模拟请求
    console.log(`使用DeepSeek分析视频: ${videoPath}，风格: ${config.style}`);
    
    try {
      // 实际API请求示例 (实际环境中实现)
      // const response = await axios.post(this.endpoint, {
      //   model: "deepseek-chat",
      //   messages: [
      //     {role: "system", content: `你是一个专业的短视频解说员。请根据视频内容生成${config.style}风格的解说文案。`},
      //     {role: "user", content: `请为这个视频生成解说文案，视频路径：${videoPath}`}
      //   ],
      //   headers: {
      //     "Authorization": `Bearer ${this.apiKey}`
      //   }
      // });
      // return response.data.choices[0].message.content;
      
      // 模拟数据
      return {
        scriptSegments: [
          {
            startTime: 0,
            duration: 6,
            content: '各位观众朋友们好，今天我们要一起欣赏的是一部题材独特的青春短剧',
            emotion: 'excited',
            tags: ['开场白']
          },
          {
            startTime: 7,
            duration: 9,
            content: '主人公李小明是一位充满活力的城市大学生，他决定回到家乡小山村度过暑假',
            emotion: 'neutral',
            tags: ['人物介绍']
          },
          {
            startTime: 17,
            duration: 11,
            content: '当他重返家乡时，眼前的景象令他震惊不已：崭新的基础设施、繁荣的乡村经济，这一切都与他记忆中的家乡大相径庭',
            emotion: 'surprised',
            tags: ['情节']
          }
        ],
        tags: ['乡村振兴', '青春', '返乡', '社会发展', '代际差异'],
        summary: '这部短剧通过大学生李小明返乡的视角，展现了中国乡村振兴战略的显著成效，以及年轻一代在这一进程中重新认识家乡、思考自我价值的心路历程。'
      };
    } catch (error) {
      console.error('DeepSeek分析失败:', error);
      throw new Error('DeepSeek API调用失败');
    }
  }
}

// AI服务工厂
export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private services: Record<AIModelType, BaseAIService>;
  private configs: Record<AIModelType, AIModelConfig>;

  // 添加模型评测记录
  private evaluationResults: ModelEvaluationResult[] = [];
  
  // 模板集合
  private promptTemplates: PromptTemplate[] = [
    {
      id: 'default-educational',
      name: '教育讲解',
      description: '适合知识科普、教学视频的解说风格',
      prompt: '以专业、清晰的风格讲解视频内容，突出重点知识，使用简单易懂的语言解释复杂概念，语调平稳，避免过度情绪化表达。',
      category: 'educational',
      tags: ['教育', '知识', '讲解'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'default-entertainment',
      name: '娱乐幽默',
      description: '适合轻松搞笑类视频的解说风格',
      prompt: '以幽默、活泼的语调解说视频，适当使用双关语、夸张表达等手法，突出有趣的瞬间，增加情绪起伏。',
      category: 'entertainment',
      tags: ['娱乐', '幽默', '活泼'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'default-marketing',
      name: '产品营销',
      description: '适合产品介绍、推广的解说风格',
      prompt: '以简洁有力的语言突出产品特点和优势，强调用户痛点解决方案，使用说服性语言引导关注，语调自信专业。',
      category: 'marketing',
      tags: ['营销', '推广', '产品'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'default-storytelling',
      name: '故事叙述',
      description: '适合叙事类、微电影类视频的解说风格',
      prompt: '以富有感情和韵律的语言讲述故事，注重情节铺垫和情感表达，适当使用修辞手法增加代入感，语调随情节变化。',
      category: 'entertainment',
      tags: ['叙事', '情感', '故事'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'default-documentary',
      name: '纪录片风格',
      description: '适合记录现实、采访类视频的解说风格',
      prompt: '以客观、理性的语言描述事实，避免过度主观评价，注重细节和氛围的刻画，语调庄重自然。',
      category: 'general',
      tags: ['纪录片', '客观', '真实'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  private constructor() {
    // 默认配置
    this.configs = {
      qianwen: { apiKey: '', endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', enabled: false },
      wenxin: { apiKey: '', endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat', enabled: false },
      chatgpt: { apiKey: '', endpoint: 'https://api.openai.com/v1/chat/completions', enabled: false },
      deepseek: { apiKey: '', endpoint: 'https://api.deepseek.com/v1/chat/completions', enabled: false }
    };
    
    // 初始化服务实例
    this.services = {
      qianwen: new QianwenService(this.configs.qianwen.apiKey, this.configs.qianwen.endpoint),
      wenxin: new WenxinService(this.configs.wenxin.apiKey, this.configs.wenxin.endpoint),
      chatgpt: new ChatGPTService(this.configs.chatgpt.apiKey, this.configs.chatgpt.endpoint),
      deepseek: new DeepseekService(this.configs.deepseek.apiKey, this.configs.deepseek.endpoint)
    };
  }

  public static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  public getService(type: AIModelType): BaseAIService {
    return this.services[type];
  }

  public updateConfig(type: AIModelType, apiKey: string, endpoint: string, enabled: boolean = true): void {
    this.configs[type] = { apiKey, endpoint, enabled };
    
    switch (type) {
      case 'qianwen':
        this.services[type] = new QianwenService(apiKey, endpoint);
        break;
      case 'wenxin':
        this.services[type] = new WenxinService(apiKey, endpoint);
        break;
      case 'chatgpt':
        this.services[type] = new ChatGPTService(apiKey, endpoint);
        break;
      case 'deepseek':
        this.services[type] = new DeepseekService(apiKey, endpoint);
        break;
    }
  }
  
  public getConfig(type: AIModelType): AIModelConfig {
    return this.configs[type];
  }
  
  public getAllConfigs(): Record<AIModelType, AIModelConfig> {
    return this.configs;
  }
  
  public getAvailableModels(): Array<{type: AIModelType, name: string, enabled: boolean}> {
    return [
      { type: 'qianwen', name: '通义千问', enabled: this.configs.qianwen.enabled },
      { type: 'wenxin', name: '文心一言', enabled: this.configs.wenxin.enabled },
      { type: 'chatgpt', name: 'ChatGPT', enabled: this.configs.chatgpt.enabled },
      { type: 'deepseek', name: 'DeepSeek', enabled: this.configs.deepseek.enabled }
    ];
  }

  // 评测模型性能
  public async evaluateModel(
    modelType: AIModelType, 
    samplePrompt: string, 
    qualityScore: number
  ): Promise<ModelEvaluationResult> {
    const startTime = Date.now();
    const service = this.getService(modelType);
    
    try {
      // 进行简单测试，使用标准提示分析
      const config: VideoAnalysisConfig = {
        modelType,
        style: 'formal',
        customPrompt: samplePrompt
      };
      
      // 使用样例视频路径，实际场景中应传入真实视频
      const sampleVideoPath = 'sample.mp4';
      const result = await service.analyzeVideo(sampleVideoPath, config);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // 假设返回的文本量作为生成的tokens数(粗略估计)
      let tokensGenerated = 0;
      result.scriptSegments.forEach(segment => {
        tokensGenerated += segment.content.length / 2;
      });
      
      // 创建评测结果
      const evaluationResult: ModelEvaluationResult = {
        modelType,
        responseTime,
        tokensGenerated,
        qualityScore,
        evaluationDate: new Date(),
        samplePrompt,
        sampleResponse: result.scriptSegments[0]?.content || 'No response'
      };
      
      // 保存评测结果
      this.evaluationResults.push(evaluationResult);
      
      return evaluationResult;
    } catch (error) {
      console.error(`评测模型失败: ${modelType}`, error);
      throw new Error(`评测模型失败: ${error}`);
    }
  }
  
  // 比较多个模型
  public async compareModels(
    modelTypes: AIModelType[],
    prompt: string,
    style: ScriptStyle,
    videoPath: string
  ): Promise<ModelComparisonResult> {
    // 创建比较结果对象
    const comparisonResult: ModelComparisonResult = {
      prompt,
      style,
      videoPath,
      results: []
    };
    
    // 对每个模型进行评估
    for (const modelType of modelTypes) {
      try {
        const startTime = Date.now();
        const service = this.getService(modelType);
        
        // 分析视频
        const config: VideoAnalysisConfig = {
          modelType,
          style,
          customPrompt: prompt
        };
        
        const result = await service.analyzeVideo(videoPath, config);
        const endTime = Date.now();
        
        // 获取该模型的平均评分（如果有）
        const modelEvaluations = this.evaluationResults.filter(
          evalResult => evalResult.modelType === modelType
        );
        const avgScore = modelEvaluations.length > 0
          ? modelEvaluations.reduce((sum, evalResult) => sum + evalResult.qualityScore, 0) / modelEvaluations.length
          : 7; // 默认评分
        
        // 添加到比较结果
        comparisonResult.results.push({
          modelType,
          responseTime: endTime - startTime,
          qualityScore: avgScore,
          summary: result.summary || '',
          sampleSegment: {
            content: result.scriptSegments[0]?.content || '',
            emotion: result.scriptSegments[0]?.emotion
          }
        });
      } catch (error) {
        console.error(`比较模型失败: ${modelType}`, error);
        // 添加失败记录
        comparisonResult.results.push({
          modelType,
          responseTime: 0,
          qualityScore: 0,
          summary: `模型评估失败: ${error}`,
          sampleSegment: {
            content: '无法获取样例',
            emotion: 'neutral'
          }
        });
      }
    }
    
    return comparisonResult;
  }
  
  // 获取所有评测结果
  public getEvaluationResults(): ModelEvaluationResult[] {
    return [...this.evaluationResults];
  }
  
  // 获取指定模型的评测结果
  public getModelEvaluations(modelType: AIModelType): ModelEvaluationResult[] {
    return this.evaluationResults.filter(result => result.modelType === modelType);
  }
  
  // 添加提示词模板
  public addPromptTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): PromptTemplate {
    const newTemplate: PromptTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.promptTemplates.push(newTemplate);
    return newTemplate;
  }
  
  // 更新提示词模板
  public updatePromptTemplate(id: string, template: Partial<PromptTemplate>): PromptTemplate | null {
    const index = this.promptTemplates.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.promptTemplates[index] = {
      ...this.promptTemplates[index],
      ...template,
      updatedAt: new Date()
    };
    
    return this.promptTemplates[index];
  }
  
  // 删除提示词模板
  public deletePromptTemplate(id: string): boolean {
    const index = this.promptTemplates.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.promptTemplates.splice(index, 1);
    return true;
  }
  
  // 获取所有提示词模板
  public getPromptTemplates(): PromptTemplate[] {
    return [...this.promptTemplates];
  }
  
  // 获取单个提示词模板
  public getPromptTemplate(id: string): PromptTemplate | null {
    return this.promptTemplates.find(t => t.id === id) || null;
  }
  
  // 根据分类获取模板
  public getPromptTemplatesByCategory(category: PromptTemplate['category']): PromptTemplate[] {
    return this.promptTemplates.filter(t => t.category === category);
  }
}

// 导出单例实例
export const aiService = AIServiceFactory.getInstance();

// 分析视频的便捷函数
export async function analyzeVideo(
  videoPath: string, 
  config: VideoAnalysisConfig
): Promise<AIAnalysisResult> {
  const service = aiService.getService(config.modelType);
  const result = await service.analyzeVideo(videoPath, config);
  
  // 转换为应用接口格式
  const scriptSegments: ScriptSegment[] = result.scriptSegments.map(segment => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    startTime: segment.startTime,
    duration: segment.duration,
    content: segment.content,
    emotion: segment.emotion || 'neutral',
    tags: segment.tags || []
  }));
  
  return {
    segments: scriptSegments,
    summary: result.summary,
    keywords: result.keywords || result.tags
  };
} 