export interface VideoAnalysis {
  id: string;
  title: string;
  duration: number;
  keyMoments: KeyMoment[];
  emotions: Emotion[];
  summary: string;
}

export interface KeyMoment {
  timestamp: number;
  description: string;
  importance: number;
}

export interface Emotion {
  timestamp: number;
  type: string;
  intensity: number;
}

export interface Script {
  id: string;
  videoId: string;
  content: ScriptSegment[];
  createdAt: string;
  updatedAt: string;
  modelUsed?: string;
}

export interface ScriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  content: string;
  type: 'narration' | 'dialogue' | 'description';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  analysis?: VideoAnalysis;
  scripts: Script[];
  createdAt: string;
  updatedAt: string;
  aiModel?: AIModel;
}

export interface AIModel {
  key: string;
  name: string;
  provider: string;
  apiKey?: string;
}

export type AIModelType = 'wenxin' | 'qianwen' | 'spark' | 'chatglm' | 'doubao' | 'deepseek';

export const AI_MODEL_INFO: Record<AIModelType, Omit<AIModel, 'apiKey'>> = {
  wenxin: {
    key: 'wenxin',
    name: '文心一言',
    provider: '百度'
  },
  qianwen: {
    key: 'qianwen',
    name: '通义千问',
    provider: '阿里'
  },
  spark: {
    key: 'spark',
    name: '讯飞星火',
    provider: '科大讯飞'
  },
  chatglm: {
    key: 'chatglm',
    name: '智谱清言',
    provider: '智谱AI'
  },
  doubao: {
    key: 'doubao',
    name: '字节豆包',
    provider: '字节跳动'
  },
  deepseek: {
    key: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek'
  }
}; 