/**
 * AI 模型类型
 */
export type AIModelType = 'wenxin' | 'qianwen' | 'spark' | 'chatglm' | 'doubao' | 'deepseek';

/**
 * AI 模型信息
 */
export interface AIModelInfo {
  name: string;
  provider: string;
  description: string;
  icon: string;
  apiKeyFormat: string;
}

/**
 * AI 模型设置
 */
export interface AIModelSettings {
  enabled: boolean;
  apiKey?: string;
  apiUrl?: string;
  apiVersion?: string;
}

/**
 * AI 模型信息映射
 */
export const AI_MODEL_INFO: Record<AIModelType, AIModelInfo> = {
  wenxin: {
    name: '文心一言',
    provider: '百度',
    description: '百度文心大模型，有丰富的中文理解能力。',
    icon: 'WenxinIcon',
    apiKeyFormat: 'API_KEY:SECRET_KEY'
  },
  qianwen: {
    name: '通义千问',
    provider: '阿里云',
    description: '阿里云推出的创新大模型，拥有强大的文本处理能力。',
    icon: 'QianwenIcon',
    apiKeyFormat: 'API_KEY'
  },
  spark: {
    name: '讯飞星火',
    provider: '科大讯飞',
    description: '科大讯飞的认知大模型，支持多种语言理解和生成任务。',
    icon: 'SparkIcon',
    apiKeyFormat: 'APPID:API_KEY:API_SECRET'
  },
  chatglm: {
    name: 'ChatGLM',
    provider: '智谱AI',
    description: '智谱AI推出的开源双语对话模型，支持中英文的对话生成。',
    icon: 'ChatGLMIcon',
    apiKeyFormat: 'API_KEY'
  },
  doubao: {
    name: '豆包',
    provider: '字节跳动',
    description: '字节跳动推出的AI助手，拥有优秀的文本创作和理解能力。',
    icon: 'DoubaoIcon',
    apiKeyFormat: 'API_KEY'
  },
  deepseek: {
    name: 'DeepSeek',
    provider: 'DeepSeek',
    description: '深度搜索推出的大语言模型，拥有强大的创作与思考能力。',
    icon: 'DeepSeekIcon',
    apiKeyFormat: 'API_KEY'
  }
};

/**
 * 脚本生成选项
 */
export interface ScriptGenerationOptions {
  style?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  purpose?: string;
}

/**
 * 存储的应用设置
 */
export interface AppSettings {
  autoSave: boolean;
  defaultAIModel?: AIModelType;
  aiModelsSettings: Partial<Record<AIModelType, AIModelSettings>>;
  theme?: 'light' | 'dark' | 'system';
}

/**
 * 项目数据
 */
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  videoPath: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
  keyFrames?: string[];
  script?: any[];
} 