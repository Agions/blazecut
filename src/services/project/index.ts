import { Project, ScriptSegment } from '../../interfaces';
import { videoService } from '../video';
import { v4 as uuidv4 } from 'uuid';
import { store } from '@tauri-apps/plugin-store';
import { BaseDirectory, createDir } from '@tauri-apps/plugin-fs';

// 项目存储管理
class ProjectService {
  private static instance: ProjectService;
  private currentProject: Project | null = null;
  private projectStore: typeof store | null = null;
  private readonly storeFileName = 'project_data.json';
  private readonly projectsDir = 'projects';

  private constructor() {
    this.initStore();
  }

  // 单例模式
  public static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  // 初始化存储
  private async initStore() {
    try {
      await createDir(this.projectsDir, { dir: BaseDirectory.AppData, recursive: true });
      this.projectStore = new store(this.storeFileName);
      await this.projectStore.load();
      console.log('项目存储初始化成功');
    } catch (error) {
      console.error('初始化项目存储失败:', error);
    }
  }

  // 创建新项目
  public async createProject(name: string, description: string = '', videoPath?: string): Promise<Project> {
    const now = new Date().toISOString();
    
    let videoDuration = 0;
    let videoWidth = 0;
    let videoHeight = 0;
    let keyframes: string[] = [];
    
    // 如果提供了视频路径，则处理视频
    if (videoPath) {
      try {
        const videoResult = await videoService.processVideo(videoPath);
        videoDuration = videoResult.duration;
        videoWidth = videoResult.width;
        videoHeight = videoResult.height;
        keyframes = videoResult.keyframes;
      } catch (error) {
        console.error('处理视频失败:', error);
      }
    }
    
    const newProject: Project = {
      id: uuidv4(),
      name,
      description,
      createTime: now,
      updateTime: now,
      videoPath,
      scriptSegments: [],
      videoDuration,
      videoWidth,
      videoHeight,
      keyframes
    };
    
    // 保存项目
    await this.saveProject(newProject);
    this.currentProject = newProject;
    
    return newProject;
  }
  
  // 更新项目基本信息
  public async updateProjectInfo(
    id: string, 
    updateInfo: { name?: string; description?: string; videoPath?: string }
  ): Promise<Project | null> {
    const project = await this.getProject(id);
    
    if (!project) {
      return null;
    }
    
    // 更新项目信息
    const updatedProject: Project = {
      ...project,
      ...updateInfo,
      updateTime: new Date().toISOString()
    };
    
    // 如果更新了视频路径，则重新处理视频
    if (updateInfo.videoPath && updateInfo.videoPath !== project.videoPath) {
      try {
        const videoResult = await videoService.processVideo(updateInfo.videoPath);
        updatedProject.videoDuration = videoResult.duration;
        updatedProject.videoWidth = videoResult.width;
        updatedProject.videoHeight = videoResult.height;
        updatedProject.keyframes = videoResult.keyframes;
      } catch (error) {
        console.error('处理视频失败:', error);
      }
    }
    
    // 保存项目
    await this.saveProject(updatedProject);
    if (this.currentProject?.id === id) {
      this.currentProject = updatedProject;
    }
    
    return updatedProject;
  }
  
  // 获取所有项目
  public async getAllProjects(): Promise<Project[]> {
    if (!this.projectStore) {
      await this.initStore();
      if (!this.projectStore) {
        return [];
      }
    }
    
    try {
      const keys = await this.projectStore.keys();
      const projects: Project[] = [];
      
      for (const key of keys) {
        if (key.startsWith('project_')) {
          const project = await this.projectStore.get<Project>(key);
          if (project) {
            projects.push(project);
          }
        }
      }
      
      return projects.sort((a, b) => 
        new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
      );
    } catch (error) {
      console.error('获取项目列表失败:', error);
      return [];
    }
  }
  
  // 获取单个项目
  public async getProject(id: string): Promise<Project | null> {
    if (!this.projectStore) {
      await this.initStore();
      if (!this.projectStore) {
        return null;
      }
    }
    
    try {
      const key = `project_${id}`;
      const project = await this.projectStore.get<Project>(key);
      return project || null;
    } catch (error) {
      console.error(`获取项目 ${id} 失败:`, error);
      return null;
    }
  }
  
  // 保存项目
  public async saveProject(project: Project): Promise<boolean> {
    if (!this.projectStore) {
      await this.initStore();
      if (!this.projectStore) {
        return false;
      }
    }
    
    try {
      const key = `project_${project.id}`;
      await this.projectStore.set(key, project);
      await this.projectStore.save();
      return true;
    } catch (error) {
      console.error(`保存项目 ${project.id} 失败:`, error);
      return false;
    }
  }
  
  // 删除项目
  public async deleteProject(id: string): Promise<boolean> {
    if (!this.projectStore) {
      await this.initStore();
      if (!this.projectStore) {
        return false;
      }
    }
    
    try {
      const key = `project_${id}`;
      await this.projectStore.delete(key);
      await this.projectStore.save();
      
      if (this.currentProject?.id === id) {
        this.currentProject = null;
      }
      
      return true;
    } catch (error) {
      console.error(`删除项目 ${id} 失败:`, error);
      return false;
    }
  }
  
  // 更新脚本片段
  public async updateScriptSegments(id: string, segments: ScriptSegment[]): Promise<boolean> {
    const project = await this.getProject(id);
    
    if (!project) {
      return false;
    }
    
    const updatedProject: Project = {
      ...project,
      scriptSegments: segments,
      updateTime: new Date().toISOString()
    };
    
    const success = await this.saveProject(updatedProject);
    
    if (success && this.currentProject?.id === id) {
      this.currentProject = updatedProject;
    }
    
    return success;
  }
  
  // 获取当前项目
  public getCurrentProject(): Project | null {
    return this.currentProject;
  }
  
  // 设置当前项目
  public async setCurrentProject(id: string): Promise<Project | null> {
    const project = await this.getProject(id);
    
    if (project) {
      this.currentProject = project;
    }
    
    return project;
  }
}

export const projectService = ProjectService.getInstance(); 