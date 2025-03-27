import { invoke } from '@tauri-apps/api/tauri';
import { message } from 'antd';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
}

/**
 * 分析视频文件获取元数据
 * @param videoPath 视频文件路径
 * @returns 视频元数据
 */
export const analyzeVideo = async (videoPath: string): Promise<VideoMetadata | null> => {
  try {
    // 调用Tauri后端的FFmpeg命令执行视频分析
    const metadata = await invoke<VideoMetadata>('analyze_video', { path: videoPath });
    return metadata;
  } catch (error) {
    console.error('视频分析失败:', error);
    message.error('视频分析失败，请确保视频格式正确');
    return null;
  }
};

/**
 * 从视频中提取关键帧
 * @param videoPath 视频文件路径
 * @param count 要提取的关键帧数量
 * @returns 关键帧图像路径列表
 */
export const extractKeyFrames = async (videoPath: string, count: number = 5): Promise<string[]> => {
  try {
    // 调用Tauri后端提取关键帧图像
    const frames = await invoke<string[]>('extract_key_frames', { 
      path: videoPath,
      count
    });
    return frames;
  } catch (error) {
    console.error('关键帧提取失败:', error);
    return [];
  }
};

/**
 * 获取视频缩略图
 * @param videoPath 视频文件路径
 * @returns 缩略图路径
 */
export const generateThumbnail = async (videoPath: string): Promise<string | null> => {
  try {
    const thumbnail = await invoke<string>('generate_thumbnail', { path: videoPath });
    return thumbnail;
  } catch (error) {
    console.error('缩略图生成失败:', error);
    return null;
  }
}; 