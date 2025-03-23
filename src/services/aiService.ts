import axios from 'axios';

/**
 * AI服务接口
 * 负责与各种AI服务提供商的API通信，处理视频分析结果，生成解说文案
 */

// AI提供商配置接口
export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// 视频场景信息
export interface VideoScene {
  startTime: number;
  endTime: number;
  description: string;
  keyPoints: string[];
  emotions: string[];
  importance: number;
  suggestedTone?: string;
}

// 视频分析结果
export interface VideoAnalysisResult {
  totalDuration: number;
  scenes: VideoScene[];
  mainTheme: string;
  suggestedStyle: string;
  targetAudience: string[];
}

// 脚本片段
export interface ScriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  content: string;
  tone: string;
  associatedSceneIndex: number;
}

// 导出格式选项
export enum ExportFormat {
  PLAIN_TEXT = 'plaintext',
  JIANYING = 'jianying',
  SRT = 'srt',
  FINAL_CUT_PRO = 'fcpxml'
}

/**
 * AI服务类
 * 处理与AI API的所有交互，配置管理和脚本生成
 */
export class AIService {
  private config: AIProviderConfig | null = null;
  private isInitialized = false;

  constructor() {
    // 尝试从localStorage加载配置
    this.loadConfigFromStorage();
  }

  /**
   * 从localStorage加载配置
   */
  private loadConfigFromStorage() {
    try {
      const savedConfig = localStorage.getItem('aiConfig');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('加载AI配置失败:', error);
    }
  }

  /**
   * 设置AI配置
   * @param config AI提供商配置
   */
  setConfig(config: AIProviderConfig) {
    this.config = config;
    this.isInitialized = true;
  }

  /**
   * 获取当前配置
   * @returns 当前AI提供商配置
   */
  getConfig(): AIProviderConfig | null {
    return this.config;
  }

  /**
   * 测试API连接
   * @returns 是否连接成功
   */
  async testConnection(): Promise<boolean> {
    if (!this.config) {
      throw new Error('未设置AI配置');
    }

    try {
      // 根据不同提供商实现API测试连接
      switch (this.config.provider) {
        case 'openai':
          return await this.testOpenAIConnection();
        case 'anthropic':
          return await this.testAnthropicConnection();
        case 'local':
          return true; // 本地模型直接返回成功
        default:
          return false;
      }
    } catch (error) {
      console.error('测试连接失败:', error);
      return false;
    }
  }

  /**
   * 测试OpenAI API连接
   */
  private async testOpenAIConnection(): Promise<boolean> {
    if (!this.config || !this.config.apiKey) {
      return false;
    }

    try {
      // 简单API测试
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('OpenAI连接测试失败:', error);
      return false;
    }
  }

  /**
   * 测试Anthropic API连接
   */
  private async testAnthropicConnection(): Promise<boolean> {
    if (!this.config || !this.config.apiKey) {
      return false;
    }

    try {
      // 简单API测试
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Anthropic连接测试失败:', error);
      return false;
    }
  }

  /**
   * 基于视频分析结果生成脚本
   * @param analysis 视频分析结果
   * @param style 脚本风格
   * @returns 生成的脚本片段数组
   */
  async generateScript(analysis: VideoAnalysisResult, style: string): Promise<ScriptSegment[]> {
    if (!this.config) {
      throw new Error('未设置AI配置');
    }

    try {
      // 构建提示词
      const prompt = this.buildScriptPrompt(analysis, style);
      
      // 调用AI服务
      const response = await this.callAIService(prompt);
      
      // 解析响应为脚本片段
      return this.parseScriptResponse(response, analysis);
    } catch (error) {
      console.error('生成脚本失败:', error);
      throw error;
    }
  }

  /**
   * 构建脚本生成提示词
   * @param analysis 视频分析结果
   * @param style 脚本风格
   * @returns 完整的提示词
   */
  private buildScriptPrompt(analysis: VideoAnalysisResult, style: string): string {
    const promptParts = [
      `你是一位专业的短视频解说脚本撰写专家。请为以下视频创建高燃、吸引人的解说脚本。`,
      `视频主题: ${analysis.mainTheme}`,
      `目标风格: ${style || analysis.suggestedStyle}`,
      `目标受众: ${analysis.targetAudience.join(', ')}`,
      `总时长: ${analysis.totalDuration} 秒`,
      `\n视频场景分析:`
    ];

    // 添加每个场景的描述
    analysis.scenes.forEach((scene, index) => {
      promptParts.push(`
场景 ${index + 1}: 
- 时间: ${scene.startTime}秒 到 ${scene.endTime}秒
- 描述: ${scene.description}
- 关键点: ${scene.keyPoints.join(', ')}
- 情绪: ${scene.emotions.join(', ')}
- 重要性: ${scene.importance}/10
${scene.suggestedTone ? `- 建议语调: ${scene.suggestedTone}` : ''}
      `);
    });

    // 添加脚本要求
    promptParts.push(`
请根据以上场景分析，创建高燃、引人入胜的短视频解说脚本。每个脚本片段需要包含:
1. 时间范围（开始和结束时间，与场景对应）
2. 解说内容（简洁有力，符合目标风格）
3. 语调标注（例如：热情、激昂、深沉等）

请确保解说流畅自然，能够增强视频的感染力和传播效果。使用高能语句、修辞和适当的转场词。
将输出格式化为JSON数组，每个片段包含startTime、endTime、content和tone字段。
    `);

    return promptParts.join('\n');
  }

  /**
   * 调用AI服务获取响应
   * @param prompt 提示词
   * @returns AI响应文本
   */
  private async callAIService(prompt: string): Promise<string> {
    if (!this.config) {
      throw new Error('未设置AI配置');
    }

    try {
      console.log(`正在调用${this.config.provider}服务生成脚本...`);
      
      // 最多重试2次
      let attempts = 0;
      const maxAttempts = 2;
      
      while (attempts <= maxAttempts) {
        try {
          let result;
          switch (this.config.provider) {
            case 'openai':
              result = await this.callOpenAI(prompt);
              break;
            case 'anthropic':
              result = await this.callAnthropic(prompt);
              break;
            case 'local':
              throw new Error('本地模型暂未实现');
            default:
              throw new Error(`不支持的AI提供商: ${this.config.provider}`);
          }
          
          console.log(`成功获取AI响应，长度: ${result.length}字符`);
          return result;
        } catch (error) {
          attempts++;
          if (attempts > maxAttempts) {
            throw error;
          }
          console.warn(`API调用失败，第${attempts}次重试...`, error);
          // 重试前等待1秒
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      throw new Error('API调用失败，已达到最大重试次数');
    } catch (error) {
      console.error('调用AI服务失败:', error);
      throw error;
    }
  }

  /**
   * 调用OpenAI API
   * @param prompt 提示词
   * @returns AI响应文本
   */
  private async callOpenAI(prompt: string): Promise<string> {
    if (!this.config || this.config.provider !== 'openai') {
      throw new Error('OpenAI配置无效');
    }

    try {
      console.log(`调用OpenAI API, 模型: ${this.config.model}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { 
              role: 'system', 
              content: '你是专业的短视频解说脚本撰写专家，可以创作高质量、高燃的旁白文案。你的输出应当是JSON数组格式。'
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API错误: ${response.status}, ${errorText}`);
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('OpenAI响应格式无效');
      }
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error('调用OpenAI失败:', error);
      throw error;
    }
  }

  /**
   * 调用Anthropic API
   * @param prompt 提示词
   * @returns AI响应文本
   */
  private async callAnthropic(prompt: string): Promise<string> {
    if (!this.config || this.config.provider !== 'anthropic') {
      throw new Error('Anthropic配置无效');
    }

    try {
      console.log(`调用Anthropic API, 模型: ${this.config.model}`);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          system: '你是专业的短视频解说脚本撰写专家，可以创作高质量、高燃的旁白文案。始终以JSON数组格式返回响应。',
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API错误: ${response.status}, ${errorText}`);
      }

      const data = await response.json();
      if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
        throw new Error('Anthropic响应格式无效');
      }
      
      return data.content[0].text;
    } catch (error) {
      console.error('调用Anthropic失败:', error);
      throw error;
    }
  }

  /**
   * 解析AI响应为脚本片段数组
   * @param response AI响应文本
   * @param analysis 原始视频分析结果，用于回退
   * @returns 脚本片段数组
   */
  private parseScriptResponse(response: string, analysis: VideoAnalysisResult): ScriptSegment[] {
    try {
      // 尝试解析JSON响应
      const jsonStart = response.indexOf('[');
      const jsonEnd = response.lastIndexOf(']') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = response.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonStr);
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, index) => ({
            id: `segment-${index + 1}`,
            startTime: item.startTime,
            endTime: item.endTime,
            content: item.content,
            tone: item.tone,
            associatedSceneIndex: index
          }));
        }
      }
      
      // 如果解析失败，构造基本脚本
      console.warn('无法解析AI响应为JSON，使用默认结构');
      return analysis.scenes.map((scene, index) => ({
        id: `segment-${index + 1}`,
        startTime: scene.startTime,
        endTime: scene.endTime,
        content: `场景${index + 1}解说: ${scene.description}`,
        tone: scene.suggestedTone || '标准',
        associatedSceneIndex: index
      }));
    } catch (error) {
      console.error('解析AI响应失败:', error);
      // 返回基本脚本
      return analysis.scenes.map((scene, index) => ({
        id: `segment-${index + 1}`,
        startTime: scene.startTime,
        endTime: scene.endTime,
        content: `场景${index + 1}解说: ${scene.description}`,
        tone: scene.suggestedTone || '标准',
        associatedSceneIndex: index
      }));
    }
  }

  /**
   * 导出脚本到指定格式
   * @param scripts 脚本片段数组
   * @param format 导出格式
   * @returns 格式化后的字符串
   */
  exportScript(scripts: ScriptSegment[], format: ExportFormat): string {
    switch (format) {
      case ExportFormat.PLAIN_TEXT:
        return this.exportToPlainText(scripts);
      case ExportFormat.JIANYING:
        return this.exportToJianying(scripts);
      case ExportFormat.SRT:
        return this.exportToSRT(scripts);
      case ExportFormat.FINAL_CUT_PRO:
        return this.exportToFinalCutPro(scripts);
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  /**
   * 导出为纯文本格式
   */
  private exportToPlainText(scripts: ScriptSegment[]): string {
    return scripts.map(script => {
      return `[${this.formatTime(script.startTime)} - ${this.formatTime(script.endTime)}]\n${script.content}\n`;
    }).join('\n');
  }

  /**
   * 导出为剪映格式
   * 生成剪映草稿导入所需的JSON格式
   */
  private exportToJianying(scripts: ScriptSegment[]): string {
    // 剪映草稿文件格式
    const jianyingDraft = {
      "materials": {
        "texts": scripts.map((script, index) => ({
          "id": `text_${index}`,
          "type": "text",
          "content": script.content,
          "font_name": "SourceHanSansCN-Medium",
          "font_size": 54,
          "font_color": "#FFFFFF",
          "background_color": "rgba(0, 0, 0, 0.5)",
          "outline_color": "#000000",
          "outline_width": 4,
          "alignment": "center"
        }))
      },
      "tracks": [
        {
          "type": "text",
          "clips": scripts.map((script, index) => ({
            "material_id": `text_${index}`,
            "start_time": script.startTime * 1000, // 剪映使用毫秒
            "duration": (script.endTime - script.startTime) * 1000, // 时长，毫秒
            "segment": {
              "start_time": 0,
              "duration": (script.endTime - script.startTime) * 1000
            },
            "animation": {
              "in_animation": {
                "type": "fade",
                "duration": 500
              },
              "out_animation": {
                "type": "fade",
                "duration": 500
              }
            },
            "layout": {
              "position": {
                "x": 0.5,
                "y": 0.85
              },
              "width": 0.9,
              "height": 0.2
            }
          }))
        }
      ],
      "canvas": {
        "width": 1080,
        "height": 1920,
        "background_color": "#000000"
      },
      "version": "1.0.0"
    };

    return JSON.stringify(jianyingDraft, null, 2);
  }

  /**
   * 导出为SRT字幕格式
   */
  private exportToSRT(scripts: ScriptSegment[]): string {
    return scripts.map((script, index) => {
      return `${index + 1}\n${this.formatSRTTime(script.startTime)} --> ${this.formatSRTTime(script.endTime)}\n${script.content}\n`;
    }).join('\n');
  }

  /**
   * 导出为Final Cut Pro XML格式
   */
  private exportToFinalCutPro(scripts: ScriptSegment[]): string {
    // FCPXML 头部
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.8">
  <resources>
    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1/30s" width="1920" height="1080"/>
  </resources>
  <library>
    <event name="BlazeCut Generated Script">
      <project name="BlazeCut Script">
        <sequence format="r1" duration="${Math.max(...scripts.map(s => s.endTime))}s">
          <spine>`;

    // 添加每个脚本片段作为字幕
    scripts.forEach((script, index) => {
      xml += `
            <title ref="r1" duration="${script.endTime - script.startTime}s" start="${script.startTime}s" offset="${script.startTime}s">
              <text>
                <text-style ref="ts${index}">${script.content}</text-style>
              </text>
              <text-style-def id="ts${index}">
                <text-style font="Helvetica" fontSize="24" fontFace="Regular" fontColor="1 1 1 1" alignment="center"/>
              </text-style-def>
            </title>`;
    });

    // FCPXML 尾部
    xml += `
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;

    return xml;
  }

  /**
   * 格式化时间为易读格式
   */
  private formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  /**
   * 格式化时间为SRT格式
   */
  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds * 1000) % 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }
}

// 默认导出AIService实例
export default new AIService(); 