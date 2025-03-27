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
} 