# BlazeCut 文档自动化更新机制

## 简介

本文档描述了 BlazeCut 项目的文档自动化更新机制，旨在确保项目文档与代码库保持同步，减少手动维护文档的工作量，提高文档的准确性和时效性。

## 目录

1. [文档自动化的重要性](#文档自动化的重要性)
2. [自动化文档更新工具](#自动化文档更新工具)
3. [文档生成流程](#文档生成流程)
4. [集成到开发流程](#集成到开发流程)
5. [文档模板](#文档模板)
6. [最佳实践](#最佳实践)

## 文档自动化的重要性

在快速迭代的软件开发过程中，文档往往难以跟上代码的变化速度，导致文档过时或不准确。BlazeCut 项目采用文档自动化更新机制，解决以下问题：

- **减少手动维护负担**：自动从代码中提取信息，减少开发者手动更新文档的工作量
- **保持文档与代码同步**：确保文档反映最新的代码状态和功能
- **提高文档质量**：通过标准化模板和自动检查，提高文档的一致性和完整性
- **加速新成员上手**：提供准确、最新的文档，帮助新团队成员快速理解项目

## 自动化文档更新工具

### TypeDoc

BlazeCut 项目使用 TypeDoc 从 TypeScript 源代码中生成 API 文档。

```json
// package.json 配置示例
{
  "scripts": {
    "docs:api": "typedoc --out docs/api src/"
  },
  "devDependencies": {
    "typedoc": "^0.24.0"
  }
}
```

### JSDoc 注释规范

为了生成高质量的 API 文档，所有代码都应遵循 JSDoc 注释规范：

```typescript
/**
 * 视频编辑器组件
 * 
 * @component
 * @example
 * ```tsx
 * <VideoEditor
 *   videoSrc="/path/to/video.mp4"
 *   onSave={(editedVideo) => console.log(editedVideo)}
 * />
 * ```
 */
export const VideoEditor: React.FC<VideoEditorProps> = (props) => {
  // 组件实现
};

/**
 * 视频编辑器属性
 * 
 * @interface
 */
export interface VideoEditorProps {
  /**
   * 视频源文件路径
   */
  videoSrc: string;
  
  /**
   * 保存编辑后视频的回调函数
   * @param editedVideo - 编辑后的视频数据
   */
  onSave: (editedVideo: EditedVideo) => void;
  
  /**
   * 可选的初始编辑状态
   * @default {}
   */
  initialEditState?: EditState;
}
```

### Markdown 文档生成

对于非 API 文档（如教程、指南等），使用自定义脚本从模板和代码示例中生成 Markdown 文档：

```typescript
// scripts/generate-docs.ts
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// 从代码示例目录生成文档
function generateExampleDocs() {
  const examplesDir = path.join(__dirname, '../examples');
  const docsDir = path.join(__dirname, '../docs/examples');
  
  // 确保文档目录存在
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  // 读取所有示例
  const examples = fs.readdirSync(examplesDir);
  
  // 生成示例文档索引
  let indexContent = '# 代码示例索引\n\n';
  
  for (const example of examples) {
    const examplePath = path.join(examplesDir, example);
    const stat = fs.statSync(examplePath);
    
    if (stat.isDirectory()) {
      // 读取示例的 README.md（如果存在）
      const readmePath = path.join(examplePath, 'README.md');
      let description = '';
      
      if (fs.existsSync(readmePath)) {
        const readmeContent = fs.readFileSync(readmePath, 'utf-8');
        // 提取第一行作为描述
        description = readmeContent.split('\n')[0].replace('# ', '');
      }
      
      // 添加到索引
      indexContent += `- [${example}](${example}.md) - ${description}\n`;
      
      // 生成示例文档
      generateExampleDoc(example, examplePath, docsDir);
    }
  }
  
  // 写入索引文件
  fs.writeFileSync(path.join(docsDir, 'index.md'), indexContent);
}

// 为单个示例生成文档
function generateExampleDoc(name: string, examplePath: string, docsDir: string) {
  // 读取示例的 README.md
  const readmePath = path.join(examplePath, 'README.md');
  let content = '';
  
  if (fs.existsSync(readmePath)) {
    content = fs.readFileSync(readmePath, 'utf-8');
  } else {
    content = `# ${name}\n\n`;
  }
  
  // 添加代码示例
  content += '\n## 代码\n\n';
  
  // 查找主要源文件
  const srcFiles = findSourceFiles(examplePath);
  
  for (const file of srcFiles) {
    const relativePath = path.relative(examplePath, file);
    const fileContent = fs.readFileSync(file, 'utf-8');
    const extension = path.extname(file).substring(1);
    
    content += `### ${relativePath}\n\n`;
    content += '```' + extension + '\n';
    content += fileContent;
    content += '\n```\n\n';
  }
  
  // 添加运行说明
  content += '## 运行方法\n\n';
  content += '```bash\n';
  content += `cd examples/${name}\n`;
  content += 'npm install\n';
  content += 'npm start\n';
  content += '```\n';
  
  // 写入文档文件
  fs.writeFileSync(path.join(docsDir, `${name}.md`), content);
}

// 查找源文件
function findSourceFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 忽略 node_modules 和 .git 目录
        if (entry !== 'node_modules' && entry !== '.git') {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        // 只包含 .ts, .tsx, .js, .jsx 文件
        const ext = path.extname(entry);
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

// 主函数
function main() {
  console.log('生成 API 文档...');
  execSync('npm run docs:api', { stdio: 'inherit' });
  
  console.log('生成示例文档...');
  generateExampleDocs();
  
  console.log('文档生成完成！');
}

main();
```

### 自动检查文档完整性

使用自定义脚本检查文档的完整性，确保所有公共 API 都有文档：

```typescript
// scripts/check-docs.ts
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface DocIssue {
  file: string;
  line: number;
  name: string;
  type: 'missing' | 'incomplete';
  message: string;
}

// 检查源代码中的文档问题
function checkDocs(srcDir: string): DocIssue[] {
  const issues: DocIssue[] = [];
  const program = ts.createProgram(
    findSourceFiles(srcDir),
    {}
  );
  
  const checker = program.getTypeChecker();
  
  // 遍历所有源文件
  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile && sourceFile.fileName.startsWith(srcDir)) {
      ts.forEachChild(sourceFile, (node) => {
        checkNode(node, sourceFile, checker, issues);
      });
    }
  }
  
  return issues;
}

// 检查单个节点的文档
function checkNode(node: ts.Node, sourceFile: ts.SourceFile, checker: ts.TypeChecker, issues: DocIssue[]) {
  // 只检查导出的声明
  if (
    (ts.isClassDeclaration(node) ||
     ts.isFunctionDeclaration(node) ||
     ts.isInterfaceDeclaration(node) ||
     ts.isTypeAliasDeclaration(node) ||
     ts.isEnumDeclaration(node)) &&
    isNodeExported(node)
  ) {
    const symbol = checker.getSymbolAtLocation(node.name!);
    if (symbol) {
      const docs = ts.displayPartsToString(symbol.getDocumentationComment(checker));
      const name = symbol.getName();
      
      // 检查是否缺少文档
      if (!docs) {
        issues.push({
          file: sourceFile.fileName,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          name,
          type: 'missing',
          message: `缺少文档注释: ${name}`
        });
      } 
      // 检查文档是否不完整（太短或缺少示例）
      else if (docs.length < 20 || !docs.includes('@example')) {
        issues.push({
          file: sourceFile.fileName,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          name,
          type: 'incomplete',
          message: `文档不完整: ${name} - ${docs.length < 20 ? '描述太短' : '缺少示例'}`
        });
      }
    }
  }
  
  // 递归检查子节点
  ts.forEachChild(node, (child) => {
    checkNode(child, sourceFile, checker, issues);
  });
}

// 检查节点是否被导出
function isNodeExported(node: ts.Declaration): boolean {
  return (
    (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}

// 查找源文件
function findSourceFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 忽略 node_modules 和 .git 目录
        if (entry !== 'node_modules' && entry !== '.git') {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        // 只包含 .ts, .tsx 文件
        const ext = path.extname(entry);
        if (['.ts', '.tsx'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

// 主函数
function main() {
  const srcDir = path.join(__dirname, '../src');
  const issues = checkDocs(srcDir);
  
  if (issues.length > 0) {
    console.error('发现文档问题:');
    
    for (const issue of issues) {
      console.error(
        `${issue.file}:${issue.line} - ${issue.message}`
      );
    }
    
    process.exit(1);
  } else {
    console.log('文档检查通过！');
  }
}

main();
```

## 文档生成流程

### 自动文档生成流程

1. **代码提交前检查**：在提交代码前，运行文档检查脚本，确保所有新代码都有适当的文档
2. **持续集成中生成**：在 CI 流程中自动生成文档，确保文档与最新代码同步
3. **版本发布时更新**：在每次版本发布时，自动更新项目文档网站

### 文档生成命令

```bash
# 生成所有文档
npm run docs

# 只生成 API 文档
npm run docs:api

# 检查文档完整性
npm run docs:check

# 启动文档开发服务器（实时预览）
npm run docs:dev
```

## 集成到开发流程

### Git Hooks

使用 Husky 在提交代码前自动检查文档：

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run docs:check"
    }
  }
}
```

### GitHub Actions

使用 GitHub Actions 自动生成和部署文档：

```yaml
# .github/workflows/docs.yml
name: Generate and Deploy Docs

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Check docs
        run: npm run docs:check
        
      - name: Generate docs
        run: npm run docs
        
      - name: Deploy to GitHub Pages
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: JamesIves/github-pages-deploy-action@4.1.4
        with:
          branch: gh-pages
          folder: docs
```

## 文档模板

### 组件文档模板

```typescript
/**
 * @componentName - 组件名称
 * 
 * @description
 * 详细描述组件的功能和用途。
 * 
 * @component
 * 
 * @example
 * ```tsx
 * // 基本用法
 * <ComponentName prop1="value1" prop2={value2} />
 * 
 * // 高级用法
 * <ComponentName
 *   prop1="value1"
 *   prop2={value2}
 *   onEvent={(data) => handleEvent(data)}
 * />
 * ```
 * 
 * @see RelatedComponent - 相关组件的链接
 * @see {@link https://example.com|外部文档链接}
 */
```

### API 文档模板

```typescript
/**
 * @functionName - 函数名称
 * 
 * @description
 * 详细描述函数的功能和用途。
 * 
 * @param {Type} paramName - 参数描述
 * @param {Type} [optionalParam] - 可选参数描述
 * @param {Object} objectParam - 对象参数
 * @param {Type} objectParam.property - 对象属性描述
 * 
 * @returns {ReturnType} 返回值描述
 * 
 * @throws {ErrorType} 可能抛出的错误
 * 
 * @example
 * ```typescript
 * // 基本用法
 * const result = functionName(param1, param2);
 * 
 * // 高级用法
 * try {
 *   const result = functionName({
 *     property: value
 *   });
 * } catch (error) {
 *   handleError(error);
 * }
 * ```
 */
```

### 教程文档模板

```markdown
# 教程标题

## 简介

简要描述本教程的目标和内容。

## 前提条件

- 需要的知识背景
- 需要安装的软件和工具
- 其他准备工作

## 步骤 1: 第一步标题

详细说明第一步的操作。

```typescript
// 代码示例
```

## 步骤 2: 第二步标题

详细说明第二步的操作。

```typescript
// 代码示例
```

## 常见问题

### 问题 1

回答问题 1。

### 问题 2

回答问题 2。

## 下一步

- 相关教程链接
- 进阶学习资源
```

## 最佳实践

### 文档编写指南

1. **保持简洁明了**：使用简洁、直接的语言描述功能和用法
2. **提供完整示例**：每个 API 和组件都应有完整的使用示例
3. **包含错误处理**：说明可能的错误情况和处理方法
4. **保持一致性**：使用统一的术语和格式
5. **定期更新**：随着代码变化及时更新文档

### 代码注释最佳实践

1. **注释公共 API**：所有公共 API 都应有完整的 JSDoc 注释
2. **解释复杂逻辑**：对复杂的算法或业务逻辑添加详细注释
3. **避免注释过时**：修改代码时同步更新相关注释
4. **使用标准标签**：使用标准的 JSDoc 标签（@param, @returns 等）
5. **链接相关资源**：使用 @see 标签链接到相关文档或代码

### 文档维护流程

1. **定期审查**：每个迭代结束时审查文档的准确性和完整性
2. **收集反馈**：建立机制收集用户对文档的反馈
3. **文档测试**：通过文档中的示例代码进行测试，确保示例可用
4. **版本控制**：将文档与代码一起纳入版本控制
5. **责任分配**：明确团队成员的文档维护责任

## 结论

通过实施本文档中描述的自动化文档更新机制，BlazeCut 项目可以确保文档与代码保持同步，提高文档质量，减少手动维护工作，为开发者和用户提供更好的体验。文档自动化是一个持续改进的过程，建议定期评估和优化文档生成流程，以适应项目的发展需求。

## 参考资源

- [TypeDoc 官方文档](https://typedoc.org/)
- [JSDoc 官方文档](https://jsdoc.app/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Markdown 指南](https://www.markdownguide.org/)
- [技术文档写作最佳实践](https://developers.google.com/tech-writing)