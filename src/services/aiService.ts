import { invoke } from '@tauri-apps/api/tauri';
import axios from 'axios';
import { message } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { getApiKey } from './tauriService';
import { formatDuration } from '@/utils/format';

export interface ScriptGenerationSettings {
  style?: string;    // 风格: 简洁/详细/幽默等
  tone?: string;     // 语气: 正式/轻松/专业等
  targetLength?: number;  // 目标时长(秒)
  instruction?: string;   // 特殊指令
}

export interface ScriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  content: string;
  type: 'narration' | 'dialogue' | 'description';
}

export interface Script {
  id: string;
  projectId: string;
  content: ScriptSegment[];
  fullText: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 使用AI生成视频脚本
 * @param projectId 项目ID
 * @param videoPath 视频文件路径
 * @param settings 脚本生成设置
 */
export const generateScriptWithAI = async (
  projectId: string, 
  videoPath: string,
  settings: ScriptGenerationSettings
): Promise<Script | null> => {
  try {
    // 获取API密钥
    const apiKey = await getApiKey('openai');
    if (!apiKey) {
      message.error('未设置OpenAI API密钥，请在设置中配置');
      return null;
    }
    
    message.loading('正在分析视频...', 0);
    
    // 分析视频以提供给AI
    const metadata = await invoke<any>('analyze_video', { path: videoPath });
    const keyFrames = await invoke<string[]>('extract_key_frames', { 
      path: videoPath,
      count: 10
    });
    
    message.loading('正在生成脚本...', 0);
    
    // 构建提示词
    const prompt = `
    作为一个专业的视频脚本撰写专家，请根据以下视频信息，创作一个适合解说的脚本：
    
    视频信息:
    - 视频时长: ${formatDuration(metadata.duration)}
    - 视频分辨率: ${metadata.width}x${metadata.height}
    - 视频类型: ${metadata.codec || '未知'}
    
    关键帧描述:
    ${keyFrames.map((_, i) => `- 关键帧 ${i+1}: [在此描述]`).join('\n')}
    
    脚本要求:
    - 风格: ${settings.style || '自然流畅'}
    - 语气: ${settings.tone || '专业'}
    - 目标时长: ${settings.targetLength ? formatDuration(settings.targetLength) : '与视频相近'}
    
    附加说明:
    ${settings.instruction || '请创建一个符合视频内容的专业解说脚本'}
    
    请输出完整脚本内容，以及按时间点划分的多个段落。每个段落需要包含时间点和对应的脚本内容。
    格式为: [00:00-00:15] 脚本内容
    
    请将脚本分为8-12个时间段落，覆盖整个视频时长(${formatDuration(metadata.duration)})。
    `;
    
    // 调用OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    message.destroy();
    
    // 解析AI回复
    const scriptText = response.data.choices[0].message.content;
    
    // 解析脚本段落
    const segments = parseScriptSegments(scriptText, metadata.duration);
    
    return {
      id: uuidv4(),
      projectId,
      content: segments,
      fullText: scriptText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    message.destroy();
    console.error('生成脚本失败:', error);
    message.error('脚本生成失败，请稍后重试');
    return null;
  }
};

/**
 * 解析AI生成的脚本文本为段落
 * @param text 脚本文本
 * @param totalDuration 视频总时长(秒)
 * @returns 解析后的脚本段落
 */
function parseScriptSegments(text: string, totalDuration: number): ScriptSegment[] {
  const lines = text.split('\n').filter(line => line.trim());
  const segments: ScriptSegment[] = [];
  
  // 寻找时间标记模式（如 "00:10-00:30", "[0:10-0:30]" 等）
  const timePattern = /\[?(\d{1,2}):(\d{2})[-\s~至到]+(\d{1,2}):(\d{2})\]?/;
  
  let currentContent = '';
  let currentTimeMatch = null;
  
  for (const line of lines) {
    const match = line.match(timePattern);
    
    if (match) {
      // 如果已经有收集的内容，则先保存前一段
      if (currentTimeMatch && currentContent.trim()) {
        const startMins = parseInt(currentTimeMatch[1]);
        const startSecs = parseInt(currentTimeMatch[2]);
        const endMins = parseInt(currentTimeMatch[3]);
        const endSecs = parseInt(currentTimeMatch[4]);
        
        const startTime = startMins * 60 + startSecs;
        const endTime = endMins * 60 + endSecs;
        
        segments.push({
          id: uuidv4(),
          startTime,
          endTime,
          content: currentContent.trim(),
          type: 'narration'
        });
      }
      
      // 开始收集新一段
      currentTimeMatch = match;
      currentContent = line.replace(timePattern, '').trim();
    } else if (currentTimeMatch) {
      // 继续收集当前段落的内容
      currentContent += ' ' + line.trim();
    }
  }
  
  // 保存最后一段
  if (currentTimeMatch && currentContent.trim()) {
    const startMins = parseInt(currentTimeMatch[1]);
    const startSecs = parseInt(currentTimeMatch[2]);
    const endMins = parseInt(currentTimeMatch[3]);
    const endSecs = parseInt(currentTimeMatch[4]);
    
    const startTime = startMins * 60 + startSecs;
    const endTime = endMins * 60 + endSecs;
    
    segments.push({
      id: uuidv4(),
      startTime,
      endTime,
      content: currentContent.trim(),
      type: 'narration'
    });
  }
  
  // 如果解析失败或没有足够的段落，创建默认段落
  if (segments.length === 0) {
    const segmentCount = 8;
    const segmentDuration = Math.floor(totalDuration / segmentCount);
    
    for (let i = 0; i < segmentCount; i++) {
      const startTime = i * segmentDuration;
      const endTime = (i === segmentCount - 1) ? totalDuration : (i + 1) * segmentDuration;
      
      segments.push({
        id: uuidv4(),
        startTime,
        endTime,
        content: `请为时间段 ${formatTime(startTime)}-${formatTime(endTime)} 编写脚本内容。`,
        type: 'narration'
      });
    }
  }
  
  return segments;
}

/**
 * 格式化时间为MM:SS格式
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
} 