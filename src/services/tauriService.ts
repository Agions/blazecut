import { invoke } from '@tauri-apps/api/tauri';
import { open, save } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile, BaseDirectory, createDir, exists } from '@tauri-apps/api/fs';
import { Store } from '@tauri-apps/api/store';
import { message } from 'antd';
import { appConfigDir } from '@tauri-apps/api/path';

// 确保应用数据目录
export const ensureAppDataDir = async (): Promise<void> => {
  try {
    const appDir = 'blazecut';
    const dirExists = await exists(appDir, { dir: BaseDirectory.AppData });
    
    if (!dirExists) {
      await createDir(appDir, { dir: BaseDirectory.AppData, recursive: true });
    }
    
    return;
  } catch (error) {
    console.error('创建应用数据目录失败:', error);
    throw error;
  }
};

// 保存项目数据到文件
export const saveProjectToFile = async (project: any): Promise<void> => {
  try {
    await ensureAppDataDir();
    
    const projectPath = `blazecut/${project.id}.json`;
    await writeTextFile(
      projectPath,
      JSON.stringify(project, null, 2),
      { dir: BaseDirectory.AppData }
    );
    
    return;
  } catch (error) {
    console.error('保存项目文件失败:', error);
    throw error;
  }
};

// 读取项目数据
export const loadProjectFromFile = async (projectId: string): Promise<any> => {
  try {
    const projectPath = `blazecut/${projectId}.json`;
    const existsFile = await exists(projectPath, { dir: BaseDirectory.AppData });
    
    if (!existsFile) {
      throw new Error('项目文件不存在');
    }
    
    const content = await readTextFile(projectPath, { dir: BaseDirectory.AppData });
    return JSON.parse(content);
  } catch (error) {
    console.error('读取项目文件失败:', error);
    throw error;
  }
};

// 导出脚本到文本文件
export const exportScriptToFile = async (script: any, filename: string): Promise<void> => {
  try {
    const savePath = await save({
      defaultPath: filename,
      filters: [{
        name: '文本文件',
        extensions: ['txt']
      }]
    });
    
    if (!savePath) return;
    
    let content = '';
    
    // 构建脚本内容
    content += `项目: ${script.projectName}\n`;
    content += `创建时间: ${new Date(script.createdAt).toLocaleString()}\n\n`;
    
    // 添加脚本内容
    script.segments.forEach((segment: any) => {
      content += `[${formatTime(segment.startTime)} - ${formatTime(segment.endTime)}]\n`;
      content += `${segment.content}\n\n`;
    });
    
    await writeTextFile(savePath, content);
    message.success('脚本已导出');
  } catch (error) {
    console.error('导出脚本失败:', error);
    message.error('导出脚本失败');
    throw error;
  }
};

// 格式化时间
const formatTime = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

/**
 * 获取应用配置目录
 */
export const getConfigDir = async (): Promise<string> => {
  try {
    const configDir = await appConfigDir();
    // 确保目录存在
    const configExists = await exists(configDir);
    if (!configExists) {
      await createDir(configDir, { recursive: true });
    }
    return configDir;
  } catch (error) {
    console.error('获取配置目录失败:', error);
    return '';
  }
};

/**
 * 获取API密钥
 * @param service 服务名称，如'openai'
 */
export const getApiKey = async (service: string): Promise<string> => {
  try {
    const configDir = await getConfigDir();
    if (!configDir) return '';
    
    const configPath = `${configDir}api_keys.json`;
    const configExists = await exists(configPath);
    
    if (!configExists) {
      await writeTextFile(configPath, JSON.stringify({}));
      return '';
    }
    
    const configContent = await readTextFile(configPath);
    const config = JSON.parse(configContent);
    
    return config[service] || '';
  } catch (error) {
    console.error(`获取${service}的API密钥失败:`, error);
    return '';
  }
};

/**
 * 保存API密钥
 * @param service 服务名称，如'openai'
 * @param apiKey 密钥
 */
export const saveApiKey = async (service: string, apiKey: string): Promise<boolean> => {
  try {
    const configDir = await getConfigDir();
    if (!configDir) return false;
    
    const configPath = `${configDir}api_keys.json`;
    const configExists = await exists(configPath);
    
    let config = {};
    if (configExists) {
      const configContent = await readTextFile(configPath);
      config = JSON.parse(configContent);
    }
    
    config[service] = apiKey;
    
    await writeTextFile(configPath, JSON.stringify(config, null, 2));
    message.success(`${service}的API密钥已保存`);
    return true;
  } catch (error) {
    console.error(`保存${service}的API密钥失败:`, error);
    message.error(`保存API密钥失败: ${error}`);
    return false;
  }
};

/**
 * 选择文件
 * @param filters 文件过滤器
 */
export const selectFile = async (filters?: { name: string, extensions: string[] }[]): Promise<string | null> => {
  try {
    const selected = await open({
      multiple: false,
      filters: filters || [
        { name: '视频文件', extensions: ['mp4', 'mov', 'avi', 'mkv'] }
      ]
    });
    
    if (selected === null) {
      return null;
    }
    
    // Tauri的open函数在选择单个文件时可能返回字符串或数组
    return Array.isArray(selected) ? selected[0] : selected;
  } catch (error) {
    console.error('选择文件失败:', error);
    message.error('选择文件失败');
    return null;
  }
};

/**
 * 保存文件
 * @param defaultPath 默认保存路径
 * @param filters 文件过滤器
 */
export const saveFile = async (
  content: string,
  defaultPath?: string,
  filters?: { name: string, extensions: string[] }[]
): Promise<boolean> => {
  try {
    const savePath = await save({
      defaultPath,
      filters: filters || [
        { name: '文本文件', extensions: ['txt'] }
      ]
    });
    
    if (savePath === null) {
      return false;
    }
    
    await writeTextFile(savePath, content);
    message.success('文件保存成功');
    return true;
  } catch (error) {
    console.error('保存文件失败:', error);
    message.error('保存文件失败');
    return false;
  }
};

/**
 * 获取应用数据
 * @param key 数据键名
 */
export const getAppData = async <T>(key: string): Promise<T | null> => {
  try {
    const configDir = await getConfigDir();
    if (!configDir) return null;
    
    const dataPath = `${configDir}${key}.json`;
    const dataExists = await exists(dataPath);
    
    if (!dataExists) {
      return null;
    }
    
    const dataContent = await readTextFile(dataPath);
    return JSON.parse(dataContent) as T;
  } catch (error) {
    console.error(`获取应用数据(${key})失败:`, error);
    return null;
  }
};

/**
 * 保存应用数据
 * @param key 数据键名
 * @param data 要保存的数据
 */
export const saveAppData = async <T>(key: string, data: T): Promise<boolean> => {
  try {
    const configDir = await getConfigDir();
    if (!configDir) return false;
    
    const dataPath = `${configDir}${key}.json`;
    await writeTextFile(dataPath, JSON.stringify(data, null, 2));
    
    return true;
  } catch (error) {
    console.error(`保存应用数据(${key})失败:`, error);
    message.error(`保存数据失败: ${error}`);
    return false;
  }
}; 