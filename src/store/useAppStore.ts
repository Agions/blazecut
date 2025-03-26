import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AIProviderConfig } from '@/services/aiService'

// 全局应用状态接口
interface AppState {
  // 应用主题
  theme: 'light' | 'dark' | 'system'
  // 当前正在处理的项目ID
  currentProjectId: string | null
  // AI设置
  aiConfig: AIProviderConfig | null
  // 项目列表是否已经加载
  projectsLoaded: boolean
  // 视频分析是否正在进行
  analyzing: boolean
  // 脚本生成是否正在进行  
  generating: boolean
  // 应用语言
  language: 'zh-CN' | 'en-US'

  // 动作方法
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setCurrentProjectId: (id: string | null) => void
  setAIConfig: (config: AIProviderConfig | null) => void
  setProjectsLoaded: (loaded: boolean) => void
  setAnalyzing: (analyzing: boolean) => void
  setGenerating: (generating: boolean) => void
  setLanguage: (lang: 'zh-CN' | 'en-US') => void
}

// 创建应用状态存储
const useAppStore = create<AppState>()(
  persist(
    (set: any) => ({
      // 默认状态
      theme: 'system',
      currentProjectId: null,
      aiConfig: null,
      projectsLoaded: false,
      analyzing: false,
      generating: false,
      language: 'zh-CN',

      // 动作方法
      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
      setCurrentProjectId: (id: string | null) => set({ currentProjectId: id }),
      setAIConfig: (config: AIProviderConfig | null) => set({ aiConfig: config }),
      setProjectsLoaded: (loaded: boolean) => set({ projectsLoaded: loaded }),
      setAnalyzing: (analyzing: boolean) => set({ analyzing }),
      setGenerating: (generating: boolean) => set({ generating }),
      setLanguage: (lang: 'zh-CN' | 'en-US') => set({ language: lang }),
    }),
    {
      name: 'blazecut-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state: AppState) => ({
        theme: state.theme,
        currentProjectId: state.currentProjectId,
        aiConfig: state.aiConfig,
        language: state.language,
      }),
    }
  )
)

export default useAppStore 