import { create } from 'zustand';
import { Project, VideoAnalysis, Script } from '@/types';

// 示例数据
const sampleProjects: Project[] = [
  {
    id: '1',
    name: '示例项目',
    description: '这是一个示例项目，用于展示Tauri应用的功能',
    videoUrl: '/videos/sample.mp4',
    analysis: {
      id: '1',
      title: '示例视频分析',
      duration: 120,
      keyMoments: [
        { timestamp: 10, description: '开场', importance: 5 },
        { timestamp: 60, description: '高潮部分', importance: 8 }
      ],
      emotions: [
        { timestamp: 15, type: '兴奋', intensity: 0.7 },
        { timestamp: 45, type: '紧张', intensity: 0.5 }
      ],
      summary: '这是一个简短的示例视频，展示了一些基本场景和情感'
    },
    scripts: [
      {
        id: '1',
        videoId: '1',
        content: [
          {
            id: '1-1',
            startTime: 0,
            endTime: 10,
            content: '欢迎来到我们的示例视频',
            type: 'narration'
          },
          {
            id: '1-2',
            startTime: 11,
            endTime: 20,
            content: '这里是主要内容的展示部分',
            type: 'description'
          }
        ],
        createdAt: '2023-03-27T10:00:00Z',
        updatedAt: '2023-03-27T10:30:00Z'
      }
    ],
    createdAt: '2023-03-27T09:00:00Z',
    updatedAt: '2023-03-27T11:00:00Z'
  }
];

interface AppState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  projects: sampleProjects, // 使用示例数据初始化
  currentProject: null,
  loading: false,
  error: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (project) => set((state) => ({
    projects: state.projects.map((p) => 
      p.id === project.id ? project : p
    ),
    currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
  })),
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== projectId),
    currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
})); 