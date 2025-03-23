// 剧本片段
export interface ScriptSegment {
  id: string;
  startTime: number; // 开始时间(秒)
  duration: number; // 持续时间(秒)
  content: string; // 解说内容
  emotion?: string; // 情感色彩：neutral, happy, excited, serious, surprised, sad
  tags?: string[]; // 标签列表
  voiceConfig?: {
    speed: number; // 语速
    pitch: number; // 音调
    volume: number; // 音量
    voice: string; // 声音类型
  }
}

// 视频项目
export interface VideoProject {
  id: string;
  name: string;
  videoPath: string;
  duration: number;
  keyframes: KeyFrame[];
  scriptSegments: ScriptSegment[];
  createdAt: Date;
  updatedAt: Date;
}

// 视频关键帧
export interface KeyFrame {
  id: string;
  timestamp: number; // 时间点(秒)
  imagePath: string; // 帧图片路径
  tags?: string[]; // 标签
}

// AI模型设置
export interface AIModelConfig {
  id: string;
  name: string; // 模型名称
  apiKey: string;
  endpoint?: string;
  enabled: boolean;
}

// 导出设置
export interface ExportSettings {
  outputFormat: 'srt' | 'jianying' | 'premiere';
  outputPath: string;
  includeTimecodes: boolean;
  includeMetadata: boolean;
}

// 用户偏好设置
export interface UserPreferences {
  darkMode: boolean;
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  defaultAIModel: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createTime: string;
  updateTime: string;
  videoPath?: string;
  scriptSegments: ScriptSegment[];
  videoDuration?: number;
  videoWidth?: number;
  videoHeight?: number;
  keyframes?: string[]; // 关键帧路径列表
}

export interface VideoProcessResult {
  keyframes: string[];
  duration: number;
  width: number;
  height: number;
}

export interface AIAnalysisResult {
  segments: ScriptSegment[];
  summary?: string;
  keywords?: string[];
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  apiKey?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'zh-CN' | 'en-US';
  defaultExportFormat: 'srt' | 'jianying' | 'premiere';
  aiModel: string; // 默认AI模型ID
  autoSave: boolean;
  autoSaveInterval: number; // 分钟
} 