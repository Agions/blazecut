# BlazeCut 示例代码库

本文档提供了BlazeCut项目中常见功能的示例代码，帮助开发者快速理解和实现各种功能。

## 目录

- [视频剪辑](#视频剪辑)
- [脚本生成](#脚本生成)
- [项目管理](#项目管理)
- [导出功能](#导出功能)
- [UI组件使用](#UI组件使用)

## 视频剪辑

### 基本视频剪辑

以下示例展示了如何使用BlazeCut的API进行基本的视频剪辑操作：

```typescript
import { editVideo, ScriptSegment, EditOptions } from '../services/videoService';

// 定义视频片段
const segments: ScriptSegment[] = [
  {
    id: '1',
    startTime: 10.5,  // 开始时间（秒）
    endTime: 25.2,    // 结束时间（秒）
    content: '这是第一个片段的解说文本',
    type: 'main'
  },
  {
    id: '2',
    startTime: 45.0,
    endTime: 55.8,
    content: '这是第二个片段的解说文本',
    type: 'main'
  }
];

// 定义编辑选项
const options: EditOptions = {
  transitionType: 'fade',      // 转场类型
  transitionDuration: 0.8,     // 转场时长（秒）
  audioVolume: 80,            // 音量（0-100）
  useSubtitles: true          // 是否使用字幕
};

// 执行视频编辑
async function performVideoEdit() {
  try {
    const videoPath = '/path/to/your/video.mp4';
    const outputPath = await editVideo(videoPath, segments, options);
    console.log('视频编辑完成，输出路径:', outputPath);
    return outputPath;
  } catch (error) {
    console.error('视频编辑失败:', error);
    throw error;
  }
}
```

### 添加转场效果

以下示例展示了如何在视频片段之间添加不同类型的转场效果：

```typescript
import { editVideo, ScriptSegment, EditOptions } from '../services/videoService';

// 定义带有不同转场效果的片段
async function addTransitions() {
  const segments: ScriptSegment[] = [
    {
      id: '1',
      startTime: 0,
      endTime: 15.5,
      content: '开场白',
      type: 'intro',
      transition: {
        type: 'fade',
        duration: 1.0
      }
    },
    {
      id: '2',
      startTime: 20.0,
      endTime: 35.5,
      content: '主要内容',
      type: 'main',
      transition: {
        type: 'wipe',
        duration: 1.2
      }
    },
    {
      id: '3',
      startTime: 40.0,
      endTime: 50.0,
      content: '结束语',
      type: 'conclusion',
      transition: {
        type: 'dissolve',
        duration: 1.5
      }
    }
  ];
  
  const options: EditOptions = {
    transitionType: 'auto',  // 使用每个片段自定义的转场
    transitionDuration: 1.0, // 默认转场时长
    audioVolume: 85,
    useSubtitles: true
  };
  
  try {
    const videoPath = '/path/to/your/video.mp4';
    return await editVideo(videoPath, segments, options);
  } catch (error) {
    console.error('添加转场效果失败:', error);
    throw error;
  }
}
```

### 调整视频音量

以下示例展示了如何调整视频的音量：

```typescript
import { editVideo, EditOptions } from '../services/videoService';

async function adjustVideoVolume(videoPath: string, volume: number) {
  // 确保音量在0-100范围内
  const safeVolume = Math.max(0, Math.min(100, volume));
  
  const options: EditOptions = {
    transitionType: 'none',
    transitionDuration: 0,
    audioVolume: safeVolume,
    useSubtitles: false
  };
  
  // 创建一个包含整个视频的片段
  const segments = [
    {
      id: '1',
      startTime: 0,
      endTime: -1,  // -1表示视频结束
      content: '',
      type: 'main'
    }
  ];
  
  try {
    return await editVideo(videoPath, segments, options);
  } catch (error) {
    console.error('调整音量失败:', error);
    throw error;
  }
}
```

## 脚本生成

### 基于视频分析生成脚本

以下示例展示了如何基于视频分析结果生成解说脚本：

```typescript
import { analyzeVideo } from '../services/videoService';
import { generateScript, ScriptOptions } from '../services/aiService';

async function generateVideoScript(videoPath: string) {
  try {
    // 第一步：分析视频
    console.log('开始分析视频...');
    const videoAnalysis = await analyzeVideo(videoPath);
    
    // 第二步：生成脚本
    console.log('开始生成脚本...');
    const scriptOptions: ScriptOptions = {
      style: '幽默',           // 脚本风格
      tone: '轻松',           // 语气
      targetLength: 120,      // 目标时长（秒）
      language: 'zh-CN',      // 语言
      creativity: 0.7         // 创造力（0-1）
    };
    
    const scriptResult = await generateScript(videoAnalysis, scriptOptions);
    
    console.log('脚本生成完成！');
    console.log(`- 字数: ${scriptResult.wordCount}`);
    console.log(`- 估计时长: ${scriptResult.estimatedDuration}秒`);
    
    return scriptResult;
  } catch (error) {
    console.error('脚本生成失败:', error);
    throw error;
  }
}
```

### 优化现有脚本

以下示例展示了如何优化现有脚本：

```typescript
import { optimizeScript, OptimizeOptions } from '../services/aiService';

async function improveScript(originalScript: string) {
  const optimizeOptions: OptimizeOptions = {
    instructions: '使脚本更加生动有趣，增加一些修辞手法，并确保语言流畅自然。',
    creativity: 0.8
  };
  
  try {
    console.log('开始优化脚本...');
    const improvedScript = await optimizeScript(originalScript, optimizeOptions);
    console.log('脚本优化完成！');
    return improvedScript;
  } catch (error) {
    console.error('脚本优化失败:', error);
    throw error;
  }
}
```

## 项目管理

### 创建新项目

以下示例展示了如何创建新项目：

```typescript
import { createProject, Project, ProjectStatus } from '../services/projectService';

async function createNewProject(name: string, description: string, videoPath: string) {
  const newProject: Project = {
    id: '',  // ID将由createProject函数生成
    name,
    description,
    videoPath,
    createdAt: '',  // 创建时间将由createProject函数设置
    status: ProjectStatus.DRAFT
  };
  
  try {
    const projectId = await createProject(newProject);
    console.log('项目创建成功，ID:', projectId);
    return projectId;
  } catch (error) {
    console.error('项目创建失败:', error);
    throw error;
  }
}
```

### 获取和更新项目

以下示例展示了如何获取和更新项目：

```typescript
import { getProjectById, updateProject, ProjectStatus } from '../services/projectService';

async function updateProjectStatus(projectId: string, newStatus: ProjectStatus) {
  try {
    // 获取项目
    const project = await getProjectById(projectId);
    
    // 更新项目状态
    project.status = newStatus;
    project.updatedAt = new Date().toISOString();
    
    // 保存更新
    const success = await updateProject(project);
    
    if (success) {
      console.log(`项目 ${projectId} 状态已更新为 ${newStatus}`);
    } else {
      console.warn('项目更新失败');
    }
    
    return success;
  } catch (error) {
    console.error('项目更新失败:', error);
    throw error;
  }
}
```

## 导出功能

### 导出视频

以下示例展示了如何导出编辑后的视频，并显示进度：

```typescript
import { exportVideo, ExportOptions } from '../services/videoService';
import { message } from 'antd';

async function exportEditedVideo(videoPath: string, segments: ScriptSegment[]) {
  const exportOptions: ExportOptions = {
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    transitionType: 'fade',
    transitionDuration: 0.8,
    audioVolume: 90,
    useSubtitles: true
  };
  
  // 创建进度提示
  const key = 'exportProgress';
  message.loading({ content: '准备导出...', key });
  
  try {
    const outputPath = await exportVideo(
      videoPath,
      segments,
      exportOptions,
      (progress) => {
        // 更新进度提示
        message.loading({ content: `导出中: ${Math.round(progress)}%`, key });
      }
    );
    
    message.success({ content: '导出完成！', key });
    return outputPath;
  } catch (error) {
    message.error({ content: '导出失败', key });
    console.error('视频导出失败:', error);
    throw error;
  }
}
```

### 导出脚本为PDF

以下示例展示了如何将脚本导出为PDF文件：

```typescript
import { exportScriptToPdf, PdfExportOptions } from '../services/exportService';

async function exportToPdf(script: string, title: string, author: string) {
  const options: PdfExportOptions = {
    title,
    author,
    fontSize: 12,
    includeTimestamps: true,
    template: 'professional'
  };
  
  try {
    const pdfPath = await exportScriptToPdf(script, options);
    console.log('PDF导出成功，路径:', pdfPath);
    return pdfPath;
  } catch (error) {
    console.error('PDF导出失败:', error);
    throw error;
  }
}
```

## UI组件使用

### 视频编辑器组件

以下示例展示了如何使用VideoEditor组件：

```tsx
import React, { useState } from 'react';
import { VideoEditor } from '../components/VideoEditor';
import { ScriptSegment } from '../services/videoService';

const VideoEditorExample: React.FC = () => {
  const [videoPath, setVideoPath] = useState<string>('');
  const [segments, setSegments] = useState<ScriptSegment[]>([]);
  
  // 处理片段更新
  const handleSegmentsChange = (newSegments: ScriptSegment[]) => {
    setSegments(newSegments);
    console.log('片段已更新:', newSegments);
  };
  
  // 处理视频选择
  const handleVideoSelect = (path: string) => {
    setVideoPath(path);
    console.log('已选择视频:', path);
  };
  
  return (
    <div className="editor-container">
      <h2>视频编辑器示例</h2>
      
      {!videoPath && (
        <div className="video-selector">
          <button onClick={() => handleVideoSelect('/path/to/sample.mp4')}>
            选择示例视频
          </button>
        </div>
      )}
      
      {videoPath && (
        <VideoEditor
          videoPath={videoPath}
          segments={segments}
          onSegmentsChange={handleSegmentsChange}
          allowTransitions={true}
          showTimeline={true}
          showControls={true}
        />
      )}
    </div>
  );
};

export default VideoEditorExample;
```

### AI助手组件

以下示例展示了如何使用AIAssistant组件：

```tsx
import React, { useState } from 'react';
import { AIAssistant } from '../components/AIAssistant';

const AIAssistantExample: React.FC = () => {
  const [videoContext, setVideoContext] = useState(null);
  
  // 模拟视频上下文更新
  const updateVideoContext = (newContext) => {
    setVideoContext(newContext);
  };
  
  return (
    <div className="assistant-container">
      <h2>AI助手示例</h2>
      
      <AIAssistant
        videoContext={videoContext}
        onSuggestionApply={(suggestion) => {
          console.log('应用建议:', suggestion);
          // 在这里实现应用建议的逻辑
        }}
        onScriptGenerate={(script) => {
          console.log('生成脚本:', script);
          // 在这里实现脚本生成后的处理逻辑
        }}
      />
      
      {/* 模拟更新视频上下文的按钮 */}
      <button
        onClick={() => updateVideoContext({
          duration: 120,
          currentTime: 45,
          scenes: [
            { startTime: 0, endTime: 30, description: '开场场景' },
            { startTime: 30, endTime: 60, description: '主要内容场景' },
            { startTime: 60, endTime: 120, description: '结束场景' }
          ]
        })}
      >
        更新视频上下文
      </button>
    </div>
  );
};

export default AIAssistantExample;
```

### 脚本编辑器组件

以下示例展示了如何使用ScriptEditor组件：

```tsx
import React, { useState } from 'react';
import { ScriptEditor } from '../components/ScriptEditor';
import { ScriptSegment } from '../types';

const ScriptEditorExample: React.FC = () => {
  const [script, setScript] = useState<ScriptSegment[]>([
    {
      id: '1',
      startTime: 0,
      endTime: 15,
      content: '这是开场白内容',
      type: 'intro'
    },
    {
      id: '2',
      startTime: 15,
      endTime: 45,
      content: '这是主要内容',
      type: 'main'
    }
  ]);
  
  const handleScriptChange = (newScript: ScriptSegment[]) => {
    setScript(newScript);
    console.log('脚本已更新:', newScript);
  };
  
  return (
    <div className="script-editor-container">
      <h2>脚本编辑器示例</h2>
      
      <ScriptEditor
        segments={script}
        onChange={handleScriptChange}
        videoDuration={60}
        showTimestamps={true}
        allowReordering={true}
      />
      
      <div className="script-preview">
        <h3>当前脚本预览</h3>
        <pre>{JSON.stringify(script, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ScriptEditorExample;
```

这些示例代码提供了BlazeCut项目中常见功能的实现方法，开发者可以参考这些示例快速上手项目开发。每个示例都包含了完整的代码和注释，方便理解和使用。