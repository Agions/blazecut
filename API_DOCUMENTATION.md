# BlazeCut API 文档

## 简介

本文档详细介绍了BlazeCut应用中的各种API接口，包括前端服务API和Tauri后端命令。这些API为应用的核心功能提供支持，如视频处理、脚本生成和项目管理等。

## 前端服务API

### 视频服务 (videoService)

视频服务提供视频处理和分析相关的功能。

#### 视频分析

```typescript
/**
 * 分析视频内容，识别关键时刻和情感变化
 * @param videoPath 视频文件路径
 * @returns 视频分析结果
 */
export const analyzeVideo = async (videoPath: string): Promise<VideoAnalysisResult> => {
  try {
    const result = await invoke('analyze_video', { videoPath });
    return result as VideoAnalysisResult;
  } catch (error) {
    console.error('视频分析失败:', error);
    throw error;
  }
};
```

#### 视频编辑

```typescript
/**
 * 根据脚本片段编辑视频
 * @param videoPath 原始视频路径
 * @param segments 脚本片段数组
 * @param options 编辑选项
 * @returns 输出视频路径
 */
export const editVideo = async (
  videoPath: string,
  segments: ScriptSegment[],
  options: EditOptions
): Promise<string> => {
  try {
    const outputPath = await invoke('edit_video', {
      videoPath,
      segments,
      options
    });
    return outputPath as string;
  } catch (error) {
    console.error('视频编辑失败:', error);
    throw error;
  }
};
```

#### 视频预览

```typescript
/**
 * 生成视频片段预览
 * @param videoPath 视频路径
 * @param segment 片段信息
 * @returns 预览视频路径
 */
export const generatePreview = async (
  videoPath: string,
  segment: ScriptSegment
): Promise<string> => {
  try {
    const previewPath = await invoke('generate_preview', {
      videoPath,
      segment
    });
    return previewPath as string;
  } catch (error) {
    console.error('预览生成失败:', error);
    throw error;
  }
};
```

#### 视频导出

```typescript
/**
 * 导出编辑后的视频
 * @param videoPath 原始视频路径
 * @param segments 脚本片段数组
 * @param options 导出选项
 * @param progressCallback 进度回调函数
 * @returns 导出视频路径
 */
export const exportVideo = async (
  videoPath: string,
  segments: ScriptSegment[],
  options: ExportOptions,
  progressCallback?: (progress: number) => void
): Promise<string> => {
  try {
    // 注册进度监听器
    if (progressCallback) {
      const unlistenFn = await listen('export-progress', (event: any) => {
        progressCallback(event.payload as number);
      });
      
      // 导出完成后取消监听
      setTimeout(() => unlistenFn(), 1000 * 60 * 10); // 10分钟超时
    }
    
    const outputPath = await invoke('export_video', {
      videoPath,
      segments,
      options
    });
    
    return outputPath as string;
  } catch (error) {
    console.error('视频导出失败:', error);
    throw error;
  }
};
```

### AI服务 (aiService)

AI服务提供与AI模型交互的功能，用于脚本生成和内容分析。

#### 脚本生成

```typescript
/**
 * 基于视频分析结果生成解说脚本
 * @param videoAnalysis 视频分析结果
 * @param options 脚本选项
 * @returns 生成的脚本结果
 */
export const generateScript = async (
  videoAnalysis: VideoAnalysisResult,
  options: ScriptOptions
): Promise<ScriptResult> => {
  try {
    const apiKey = options.apiKey || await getApiKey();
    const modelType = options.modelType || 'gpt-3.5-turbo';
    
    const response = await axios.post(
      getModelEndpoint(modelType),
      {
        model: modelType,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的视频解说脚本撰写专家。'
          },
          {
            role: 'user',
            content: generatePrompt(videoAnalysis, options)
          }
        ],
        temperature: options.creativity || 0.7,
        max_tokens: options.maxLength || 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    return processScriptResponse(response.data, videoAnalysis);
  } catch (error) {
    console.error('脚本生成失败:', error);
    throw error;
  }
};
```

#### 脚本优化

```typescript
/**
 * 优化现有脚本
 * @param script 原始脚本
 * @param options 优化选项
 * @returns 优化后的脚本
 */
export const optimizeScript = async (
  script: string,
  options: OptimizeOptions
): Promise<string> => {
  try {
    const apiKey = options.apiKey || await getApiKey();
    const modelType = options.modelType || 'gpt-3.5-turbo';
    
    const response = await axios.post(
      getModelEndpoint(modelType),
      {
        model: modelType,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的脚本编辑专家。'
          },
          {
            role: 'user',
            content: `请根据以下要求优化脚本：\n\n${options.instructions}\n\n原始脚本：\n${script}`
          }
        ],
        temperature: options.creativity || 0.5,
        max_tokens: script.length * 1.2
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('脚本优化失败:', error);
    throw error;
  }
};
```

### 项目服务 (projectService)

项目服务提供项目管理相关功能。

#### 创建项目

```typescript
/**
 * 创建新项目
 * @param project 项目信息
 * @returns 创建的项目ID
 */
export const createProject = async (project: Project): Promise<string> => {
  try {
    // 生成唯一ID
    const projectId = crypto.randomUUID();
    const projectWithId = { ...project, id: projectId, createdAt: new Date().toISOString() };
    
    // 保存项目信息
    await invoke('save_project', { project: projectWithId });
    
    return projectId;
  } catch (error) {
    console.error('项目创建失败:', error);
    throw error;
  }
};
```

#### 获取项目列表

```typescript
/**
 * 获取所有项目
 * @returns 项目列表
 */
export const getProjects = async (): Promise<Project[]> => {
  try {
    const projects = await invoke('get_projects');
    return projects as Project[];
  } catch (error) {
    console.error('获取项目列表失败:', error);
    throw error;
  }
};
```

#### 获取项目详情

```typescript
/**
 * 获取项目详情
 * @param projectId 项目ID
 * @returns 项目详情
 */
export const getProjectById = async (projectId: string): Promise<Project> => {
  try {
    const project = await invoke('get_project_by_id', { projectId });
    return project as Project;
  } catch (error) {
    console.error('获取项目详情失败:', error);
    throw error;
  }
};
```

#### 更新项目

```typescript
/**
 * 更新项目信息
 * @param project 项目信息
 * @returns 更新结果
 */
export const updateProject = async (project: Project): Promise<boolean> => {
  try {
    const result = await invoke('update_project', { project });
    return result as boolean;
  } catch (error) {
    console.error('项目更新失败:', error);
    throw error;
  }
};
```

#### 删除项目

```typescript
/**
 * 删除项目
 * @param projectId 项目ID
 * @returns 删除结果
 */
export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const result = await invoke('delete_project', { projectId });
    return result as boolean;
  } catch (error) {
    console.error('项目删除失败:', error);
    throw error;
  }
};
```

### 导出服务 (exportService)

导出服务提供内容导出相关功能。

#### 导出脚本为PDF

```typescript
/**
 * 导出脚本为PDF文件
 * @param script 脚本内容
 * @param options 导出选项
 * @returns 导出文件路径
 */
export const exportScriptToPdf = async (
  script: string,
  options: PdfExportOptions
): Promise<string> => {
  try {
    const outputPath = await invoke('export_script_to_pdf', {
      script,
      options
    });
    return outputPath as string;
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw error;
  }
};
```

#### 导出脚本为Word

```typescript
/**
 * 导出脚本为Word文件
 * @param script 脚本内容
 * @param options 导出选项
 * @returns 导出文件路径
 */
export const exportScriptToWord = async (
  script: string,
  options: WordExportOptions
): Promise<string> => {
  try {
    const outputPath = await invoke('export_script_to_word', {
      script,
      options
    });
    return outputPath as string;
  } catch (error) {
    console.error('Word导出失败:', error);
    throw error;
  }
};
```

## Tauri后端命令

### 视频处理命令

#### analyze_video

分析视频内容，识别关键时刻和情感变化。

```rust
#[tauri::command]
fn analyze_video(video_path: String) -> Result<VideoAnalysis, String> {
    // 实现视频分析逻辑
    match video_analyzer::analyze(&video_path) {
        Ok(analysis) => Ok(analysis),
        Err(e) => Err(e.to_string())
    }
}
```

#### edit_video

根据脚本片段编辑视频。

```rust
#[tauri::command]
fn edit_video(
    video_path: String,
    segments: Vec<Segment>,
    options: EditOptions
) -> Result<String, String> {
    // 实现视频编辑逻辑
    match video_editor::edit(&video_path, &segments, &options) {
        Ok(output_path) => Ok(output_path),
        Err(e) => Err(e.to_string())
    }
}
```

#### generate_preview

生成视频片段预览。

```rust
#[tauri::command]
fn generate_preview(
    video_path: String,
    segment: Segment
) -> Result<String, String> {
    // 实现预览生成逻辑
    match video_editor::generate_preview(&video_path, &segment) {
        Ok(preview_path) => Ok(preview_path),
        Err(e) => Err(e.to_string())
    }
}
```

#### export_video

导出编辑后的视频。

```rust
#[tauri::command]
fn export_video(
    video_path: String,
    segments: Vec<Segment>,
    options: ExportOptions,
    window: Window
) -> Result<String, String> {
    // 创建进度报告闭包
    let progress_reporter = move |progress: f32| {
        window.emit("export-progress", progress).unwrap();
    };
    
    // 实现视频导出逻辑
    match video_editor::export(&video_path, &segments, &options, progress_reporter) {
        Ok(output_path) => Ok(output_path),
        Err(e) => Err(e.to_string())
    }
}
```

### 项目管理命令

#### save_project

保存项目信息。

```rust
#[tauri::command]
fn save_project(project: Project) -> Result<(), String> {
    // 实现项目保存逻辑
    match project_manager::save(&project) {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string())
    }
}
```

#### get_projects

获取所有项目。

```rust
#[tauri::command]
fn get_projects() -> Result<Vec<Project>, String> {
    // 实现获取项目列表逻辑
    match project_manager::get_all() {
        Ok(projects) => Ok(projects),
        Err(e) => Err(e.to_string())
    }
}
```

#### get_project_by_id

获取项目详情。

```rust
#[tauri::command]
fn get_project_by_id(project_id: String) -> Result<Project, String> {
    // 实现获取项目详情逻辑
    match project_manager::get_by_id(&project_id) {
        Ok(project) => Ok(project),
        Err(e) => Err(e.to_string())
    }
}
```

#### update_project

更新项目信息。

```rust
#[tauri::command]
fn update_project(project: Project) -> Result<bool, String> {
    // 实现项目更新逻辑
    match project_manager::update(&project) {
        Ok(_) => Ok(true),
        Err(e) => Err(e.to_string())
    }
}
```

#### delete_project

删除项目。

```rust
#[tauri::command]
fn delete_project(project_id: String) -> Result<bool, String> {
    // 实现项目删除逻辑
    match project_manager::delete(&project_id) {
        Ok(_) => Ok(true),
        Err(e) => Err(e.to_string())
    }
}
```

### 文件操作命令

#### export_script_to_pdf

导出脚本为PDF文件。

```rust
#[tauri::command]
fn export_script_to_pdf(
    script: String,
    options: PdfExportOptions
) -> Result<String, String> {
    // 实现PDF导出逻辑
    match export_manager::to_pdf(&script, &options) {
        Ok(output_path) => Ok(output_path),
        Err(e) => Err(e.to_string())
    }
}
```

#### export_script_to_word

导出脚本为Word文件。

```rust
#[tauri::command]
fn export_script_to_word(
    script: String,
    options: WordExportOptions
) -> Result<String, String> {
    // 实现Word导出逻辑
    match export_manager::to_word(&script, &options) {
        Ok(output_path) => Ok(output_path),
        Err(e) => Err(e.to_string())
    }
}
```

## 数据类型

### 视频相关类型

```typescript
// 视频分析结果
interface VideoAnalysisResult {
  duration: number;           // 视频时长（秒）
  keyFrames: KeyFrame[];      // 关键帧信息
  scenes: Scene[];           // 场景信息
  emotions: EmotionMarker[]; // 情感标记
  transcript?: string;       // 视频转写文本（如有）
}

// 关键帧
interface KeyFrame {
  timestamp: number;  // 时间戳（秒）
  importance: number; // 重要性评分（0-1）
  description: string; // 帧内容描述
}

// 场景
interface Scene {
  startTime: number;  // 开始时间（秒）
  endTime: number;    // 结束时间（秒）
  description: string; // 场景描述
}

// 情感标记
interface EmotionMarker {
  timestamp: number;  // 时间戳（秒）
  emotion: string;    // 情感类型
  intensity: number;  // 强度（0-1）
}

// 脚本片段
interface ScriptSegment {
  id: string;         // 唯一标识
  startTime: number;  // 开始时间（秒）
  endTime: number;    // 结束时间（秒）
  content: string;    // 脚本内容
  type: SegmentType;  // 片段类型
}

// 片段类型
enum SegmentType {
  INTRO = 'intro',     // 开场白
  MAIN = 'main',       // 主体内容
  TRANSITION = 'transition', // 过渡
  CONCLUSION = 'conclusion'  // 结束语
}

// 编辑选项
interface EditOptions {
  transitionType: string;    // 转场类型
  transitionDuration: number; // 转场时长（秒）
  audioVolume: number;       // 音量（0-100）
  useSubtitles: boolean;     // 是否使用字幕
}

// 导出选项
interface ExportOptions extends EditOptions {
  format: string;      // 导出格式
  quality: string;     // 视频质量
  resolution?: string; // 分辨率
  outputPath?: string; // 输出路径
}
```

### 项目相关类型

```typescript
// 项目信息
interface Project {
  id: string;           // 项目ID
  name: string;         // 项目名称
  description: string;  // 项目描述
  videoPath: string;    // 视频路径
  scriptPath?: string;  // 脚本路径
  segments?: ScriptSegment[]; // 脚本片段
  createdAt: string;    // 创建时间
  updatedAt?: string;   // 更新时间
  thumbnailPath?: string; // 缩略图路径
  duration?: number;    // 视频时长
  status: ProjectStatus; // 项目状态
}

// 项目状态
enum ProjectStatus {
  DRAFT = 'draft',       // 草稿
  IN_PROGRESS = 'in_progress', // 进行中
  COMPLETED = 'completed'      // 已完成
}
```

### AI相关类型

```typescript
// 脚本选项
interface ScriptOptions {
  style: string;        // 脚本风格
  tone: string;         // 语气
  targetLength: number; // 目标长度（秒）
  language: string;     // 语言
  creativity: number;   // 创造力（0-1）
  maxLength?: number;   // 最大长度（字符）
  apiKey?: string;      // API密钥
  modelType?: string;   // 模型类型
}

// 脚本结果
interface ScriptResult {
  script: string;              // 完整脚本
  segments: ScriptSegment[];   // 分段脚本
  estimatedDuration: number;   // 估计时长（秒）
  wordCount: number;           // 字数
}

// 优化选项
interface OptimizeOptions {
  instructions: string;  // 优化指令
  creativity: number;    // 创造力（0-1）
  apiKey?: string;       // API密钥
  modelType?: string;    // 模型类型
}
```

### 导出相关类型

```typescript
// PDF导出选项
interface PdfExportOptions {
  title: string;         // 文档标题
  author: string;        // 作者
  fontSize: number;      // 字体大小
  includeTimestamps: boolean; // 是否包含时间戳
  template?: string;     // 模板
  outputPath?: string;   // 输出路径
}

// Word导出选项
interface WordExportOptions {
  title: string;         // 文档标题
  author: string;        // 作者
  fontSize: number;      // 字体大小
  includeTimestamps: boolean; // 是否包含时间戳
  template?: string;     // 模板
  outputPath?: string;   // 输出路径
}
```

## 错误处理

所有API都采用try-catch进行错误处理，并将错误信息记录到控制台。在生产环境中，应考虑将错误信息发送到日志服务或显示用户友好的错误消息。

```typescript
try {
  // API调用
} catch (error) {
  // 错误处理
  console.error('操作失败:', error);
  
  // 用户友好的错误提示
  if (error instanceof ApiError) {
    message.error(error.userMessage || '操作失败，请重试');
  } else {
    message.error('发生未知错误，请联系支持团队');
  }
  
  // 可选：错误上报
  reportError(error);
  
  throw error; // 或者返回默认值
}
```

## 最佳实践

### API调用

1. **使用异步/等待**：所有API调用都应使用async/await语法，使代码更易读。

2. **错误处理**：始终使用try-catch捕获可能的错误。

3. **加载状态**：在UI中显示加载状态，提高用户体验。

```typescript
const MyComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await someApiCall();
      setData(result);
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <Button onClick={fetchData} loading={loading}>获取数据</Button>
      {data && <DataDisplay data={data} />}
    </div>
  );
};
```

### 性能优化

1. **缓存结果**：对于频繁调用但结果变化不大的API，考虑缓存结果。

2. **防抖和节流**：对于用户输入触发的API调用，使用防抖或节流技术。

```typescript
import { debounce } from 'lodash';

const debouncedApiCall = debounce(async (query) => {
  try {
    const result = await searchApi(query);
    setResults(result);
  } catch (error) {
    console.error('搜索失败:', error);
  }
}, 300); // 300ms延迟
```

3. **批量处理**：当需要多次调用API时，考虑批量处理。

```typescript
// 不好的做法：循环中多次调用API
for (const item of items) {
  await processItem(item);
}

// 好的做法：批量处理
await processItems(items);
```

## 版本控制

API版本控制遵循语义化版本规范：

- **主版本号**：不兼容的API变更
- **次版本号**：向后兼容的功能性新增
- **修订号**：向后兼容的问题修正

当API发生变化时，应在文档中明确标注变更内容和兼容性信息。