// 导出服务
import { ScriptSegment } from '../../interfaces';

// 导出格式
export type ExportFormat = 'srt' | 'jianying' | 'premiere';

// 导出选项
export interface ExportOptions {
  format: ExportFormat;
  outputPath: string;
  includeMetadata?: boolean;
}

// 导出服务
class ExportService {
  private static instance: ExportService;

  private constructor() {}

  // 单例模式
  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  // 导出为SRT格式
  public async exportToSRT(segments: ScriptSegment[], outputPath: string): Promise<boolean> {
    console.log(`导出SRT到路径: ${outputPath}`);
    
    try {
      let srtContent = '';
      let index = 1;
      
      for (const segment of segments) {
        // 格式化时间 (SRT格式: 00:00:00,000 --> 00:00:05,000)
        const startTimeStr = this.formatSRTTime(segment.startTime);
        const endTimeStr = this.formatSRTTime(segment.startTime + segment.duration);
        
        // 构建SRT条目
        srtContent += `${index}\n`;
        srtContent += `${startTimeStr} --> ${endTimeStr}\n`;
        srtContent += `${segment.content}\n\n`;
        
        index++;
      }
      
      // 在实际应用中，这里会写入文件
      console.log('SRT内容:', srtContent);
      console.log(`将SRT内容写入文件: ${outputPath}/export.srt`);
      
      return true;
    } catch (error) {
      console.error('导出SRT失败:', error);
      return false;
    }
  }
  
  // 格式化SRT时间
  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }
  
  // 导出为剪映草稿
  public async exportToJianying(segments: ScriptSegment[], outputPath: string, includeMetadata: boolean = false): Promise<boolean> {
    console.log(`导出剪映草稿到路径: ${outputPath}`);
    
    try {
      // 构建剪映草稿格式
      const draft = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        segments: segments.map(segment => ({
          id: segment.id,
          startTime: segment.startTime,
          duration: segment.duration,
          content: segment.content,
          ...(includeMetadata ? {
            emotion: segment.emotion,
            tags: segment.tags
          } : {})
        }))
      };
      
      // 在实际应用中，这里会写入文件
      console.log('剪映草稿内容:', JSON.stringify(draft, null, 2));
      console.log(`将剪映草稿写入文件: ${outputPath}/draft.json`);
      
      return true;
    } catch (error) {
      console.error('导出剪映草稿失败:', error);
      return false;
    }
  }
  
  // 导出为Premiere项目
  public async exportToPremiere(segments: ScriptSegment[], outputPath: string): Promise<boolean> {
    console.log(`导出Premiere项目到路径: ${outputPath}`);
    console.log('Premiere导出功能尚未实现');
    return false;
  }
  
  // 导出脚本
  public async export(segments: ScriptSegment[], options: ExportOptions): Promise<boolean> {
    console.log(`导出脚本为${options.format}格式到路径: ${options.outputPath}`);
    
    try {
      let success = false;
      
      switch (options.format) {
        case 'srt':
          success = await this.exportToSRT(segments, options.outputPath);
          break;
        case 'jianying':
          success = await this.exportToJianying(segments, options.outputPath, options.includeMetadata);
          break;
        case 'premiere':
          success = await this.exportToPremiere(segments, options.outputPath);
          break;
        default:
          console.error(`不支持的导出格式: ${options.format}`);
          return false;
      }
      
      return success;
    } catch (error) {
      console.error('导出失败:', error);
      return false;
    }
  }
}

export const exportService = ExportService.getInstance(); 