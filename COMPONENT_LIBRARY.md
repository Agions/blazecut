# BlazeCut 组件库文档

## 简介

本文档详细介绍了BlazeCut视频编辑器中使用的各种组件，包括其功能、属性、使用方法和最佳实践。组件库基于Ant Design进行了定制化开发，以满足视频编辑工具的特定需求。

## 基础组件

### 按钮 (Button)

按钮组件用于触发操作，在BlazeCut中有多种变体。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| type | 'primary' \| 'default' \| 'dashed' \| 'link' \| 'text' \| 'danger' | 'default' | 按钮类型 |
| size | 'large' \| 'middle' \| 'small' | 'middle' | 按钮大小 |
| icon | ReactNode | - | 按钮图标 |
| loading | boolean | false | 加载状态 |
| disabled | boolean | false | 禁用状态 |

#### 使用示例

```tsx
// 主要操作按钮
<Button type="primary" icon={<PlayCircleOutlined />}>
  播放
</Button>

// 次要操作按钮
<Button icon={<ScissorOutlined />}>
  剪辑
</Button>

// 危险操作按钮
<Button type="danger" icon={<DeleteOutlined />}>
  删除片段
</Button>
```

### 输入框 (Input)

输入框组件用于文本输入，支持多种变体。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| placeholder | string | - | 占位文本 |
| disabled | boolean | false | 禁用状态 |
| allowClear | boolean | false | 是否显示清除按钮 |
| prefix | ReactNode | - | 前缀图标 |
| suffix | ReactNode | - | 后缀图标 |

#### 使用示例

```tsx
// 基础输入框
<Input placeholder="请输入标题" />

// 带前缀图标的输入框
<Input prefix={<SearchOutlined />} placeholder="搜索项目" />

// 文本域
<Input.TextArea rows={4} placeholder="请输入脚本内容" />
```

### 选择器 (Select)

选择器组件用于从预定义选项中选择一个或多个值。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| mode | 'multiple' \| 'tags' | - | 选择模式 |
| placeholder | string | - | 占位文本 |
| disabled | boolean | false | 禁用状态 |
| allowClear | boolean | false | 是否显示清除按钮 |
| showSearch | boolean | false | 是否支持搜索 |

#### 使用示例

```tsx
// 基础选择器
<Select placeholder="选择导出格式">
  <Option value="mp4">MP4</Option>
  <Option value="mov">MOV</Option>
  <Option value="webm">WebM</Option>
</Select>

// 多选选择器
<Select mode="multiple" placeholder="选择应用效果">
  <Option value="fade">淡入淡出</Option>
  <Option value="dissolve">交叉溶解</Option>
  <Option value="wipe">擦除效果</Option>
</Select>
```

## 布局组件

### 卡片 (Card)

卡片组件用于信息分组和展示。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| title | ReactNode | - | 卡片标题 |
| bordered | boolean | true | 是否有边框 |
| hoverable | boolean | false | 鼠标悬停时是否显示阴影 |
| cover | ReactNode | - | 卡片封面 |
| actions | ReactNode[] | - | 卡片操作组 |

#### 使用示例

```tsx
<Card 
  title="项目信息" 
  bordered={true}
  hoverable
  actions={[
    <EditOutlined key="edit" />,
    <DeleteOutlined key="delete" />,
    <EllipsisOutlined key="more" />
  ]}
>
  <p>项目名称：短视频混剪</p>
  <p>创建时间：2023-10-15</p>
  <p>时长：03:45</p>
</Card>
```

### 栅格 (Grid)

栅格系统用于页面布局，由Row和Col组件组成。

#### Row属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| gutter | number \| object \| array | 0 | 栅格间隔 |
| justify | 'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' | 'start' | 水平排列方式 |
| align | 'top' \| 'middle' \| 'bottom' | 'top' | 垂直对齐方式 |

#### Col属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| span | number | - | 栅格占位格数 |
| offset | number | 0 | 栅格左侧的间隔格数 |
| xs/sm/md/lg/xl/xxl | number \| object | - | 响应式栅格 |

#### 使用示例

```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8} lg={6}>
    <Card title="项目1">内容</Card>
  </Col>
  <Col xs={24} sm={12} md={8} lg={6}>
    <Card title="项目2">内容</Card>
  </Col>
  <Col xs={24} sm={12} md={8} lg={6}>
    <Card title="项目3">内容</Card>
  </Col>
</Row>
```

## 导航组件

### 标签页 (Tabs)

标签页组件用于内容分类和切换。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| defaultActiveKey | string | 第一个面板的key | 初始选中的标签页 |
| type | 'line' \| 'card' \| 'editable-card' | 'line' | 页签的基本样式 |
| size | 'large' \| 'default' \| 'small' | 'default' | 大小 |
| tabPosition | 'top' \| 'right' \| 'bottom' \| 'left' | 'top' | 页签位置 |

#### 使用示例

```tsx
<Tabs defaultActiveKey="1">
  <TabPane tab="视频编辑" key="1">
    视频编辑内容
  </TabPane>
  <TabPane tab="脚本生成" key="2">
    脚本生成内容
  </TabPane>
  <TabPane tab="导出设置" key="3">
    导出设置内容
  </TabPane>
</Tabs>
```

## 数据展示组件

### 列表 (List)

列表组件用于数据的展示和操作。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| dataSource | any[] | - | 数据源 |
| renderItem | (item, index) => ReactNode | - | 渲染列表项的函数 |
| bordered | boolean | false | 是否有边框 |
| size | 'large' \| 'default' \| 'small' | 'default' | 列表大小 |
| pagination | boolean \| object | false | 分页设置 |

#### 使用示例

```tsx
<List
  bordered
  dataSource={projects}
  renderItem={item => (
    <List.Item
      actions={[
        <Button key="edit" icon={<EditOutlined />}>编辑</Button>,
        <Button key="delete" danger icon={<DeleteOutlined />}>删除</Button>
      ]}
    >
      <List.Item.Meta
        avatar={<Avatar src={item.avatar} />}
        title={item.title}
        description={item.description}
      />
    </List.Item>
  )}
/>
```

## 专用组件

### 视频播放器 (VideoPlayer)

视频播放器组件用于视频预览和播放控制。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| src | string | - | 视频源URL |
| autoPlay | boolean | false | 是否自动播放 |
| controls | boolean | true | 是否显示控制栏 |
| loop | boolean | false | 是否循环播放 |
| width | string \| number | '100%' | 播放器宽度 |
| height | string \| number | 'auto' | 播放器高度 |
| onTimeUpdate | function | - | 播放时间更新回调 |
| onEnded | function | - | 播放结束回调 |

#### 使用示例

```tsx
<VideoPlayer
  src={convertFileSrc(videoPath)}
  width="100%"
  height={400}
  controls
  onTimeUpdate={handleTimeUpdate}
  onEnded={handleVideoEnded}
/>
```

### 时间轴 (Timeline)

时间轴组件用于视频编辑中的时间点标记和片段选择。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| duration | number | 0 | 视频总时长(秒) |
| currentTime | number | 0 | 当前播放时间(秒) |
| segments | Segment[] | [] | 视频片段数组 |
| onSegmentSelect | function | - | 片段选择回调 |
| onTimeChange | function | - | 时间变化回调 |
| onSegmentChange | function | - | 片段修改回调 |

#### 使用示例

```tsx
<Timeline
  duration={videoDuration}
  currentTime={currentTime}
  segments={editedSegments}
  onSegmentSelect={handleSegmentSelect}
  onTimeChange={handleTimeChange}
  onSegmentChange={handleSegmentChange}
/>
```

### 脚本编辑器 (ScriptEditor)

脚本编辑器组件用于编辑和管理视频解说脚本。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | string | '' | 脚本内容 |
| onChange | function | - | 内容变化回调 |
| segments | Segment[] | [] | 视频片段数组 |
| onSegmentChange | function | - | 片段修改回调 |
| readOnly | boolean | false | 是否只读 |
| highlightSegment | string | - | 高亮片段ID |

#### 使用示例

```tsx
<ScriptEditor
  value={scriptContent}
  onChange={handleScriptChange}
  segments={segments}
  onSegmentChange={handleSegmentChange}
  highlightSegment={selectedSegment?.id}
/>
```

### AI助手 (AIAssistant)

AI助手组件用于提供智能编辑建议和脚本生成。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| videoInfo | VideoInfo | - | 视频信息 |
| onSuggestionApply | function | - | 应用建议回调 |
| onScriptGenerate | function | - | 脚本生成回调 |
| apiKey | string | - | AI API密钥 |
| modelType | string | 'gpt-3.5-turbo' | AI模型类型 |

#### 使用示例

```tsx
<AIAssistant
  videoInfo={videoInfo}
  onSuggestionApply={handleSuggestionApply}
  onScriptGenerate={handleScriptGenerate}
  apiKey={settings.apiKey}
  modelType={settings.modelType}
/>
```

## 反馈组件

### 进度条 (Progress)

进度条组件用于显示操作进度。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| percent | number | 0 | 进度百分比 |
| status | 'success' \| 'exception' \| 'normal' \| 'active' | 'normal' | 状态 |
| showInfo | boolean | true | 是否显示进度数值或状态图标 |
| strokeColor | string | - | 进度条颜色 |
| type | 'line' \| 'circle' \| 'dashboard' | 'line' | 类型 |

#### 使用示例

```tsx
<Progress 
  percent={processProgress} 
  status={processProgress === 100 ? 'success' : 'active'}
  strokeColor={{
    '0%': '#108ee9',
    '100%': '#87d068',
  }}
/>
```

### 消息提示 (Message)

消息提示组件用于全局反馈。

#### 方法

| 方法 | 参数 | 说明 |
| --- | --- | --- |
| message.success | content, [duration], onClose | 成功提示 |
| message.error | content, [duration], onClose | 错误提示 |
| message.info | content, [duration], onClose | 信息提示 |
| message.warning | content, [duration], onClose | 警告提示 |
| message.loading | content, [duration], onClose | 加载提示 |

#### 使用示例

```tsx
// 成功提示
message.success('视频导出成功！');

// 错误提示
message.error('视频处理失败，请重试');

// 加载提示
const hide = message.loading('正在处理视频...', 0);
// 处理完成后关闭
hide();
```

### 模态框 (Modal)

模态框组件用于需要用户处理事务，又不希望跳转页面的场景。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| visible | boolean | false | 是否可见 |
| title | ReactNode | - | 标题 |
| onOk | function | - | 点击确定回调 |
| onCancel | function | - | 点击取消回调 |
| footer | ReactNode | 确定取消按钮 | 底部内容 |
| width | string \| number | 520 | 宽度 |
| centered | boolean | false | 是否居中显示 |

#### 使用示例

```tsx
<Modal
  title="确认导出"
  visible={showConfirmModal}
  onOk={handleExportConfirm}
  onCancel={() => setShowConfirmModal(false)}
  centered
>
  <p>确定要以当前设置导出视频吗？</p>
  <p>导出格式：{exportFormat}</p>
  <p>视频质量：{videoQuality}</p>
</Modal>
```

## 表单组件

### 滑块 (Slider)

滑块组件用于在特定范围内选择数值。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| min | number | 0 | 最小值 |
| max | number | 100 | 最大值 |
| step | number | 1 | 步长 |
| value | number | - | 当前值 |
| onChange | function | - | 值变化回调 |
| disabled | boolean | false | 禁用状态 |
| marks | object | - | 刻度标记 |

#### 使用示例

```tsx
<Slider
  min={0}
  max={100}
  value={audioVolume}
  onChange={setAudioVolume}
  marks={{
    0: '静音',
    50: '50%',
    100: '100%'
  }}
/>
```

### 开关 (Switch)

开关组件用于切换状态。

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| checked | boolean | false | 是否选中 |
| onChange | function | - | 变化回调 |
| disabled | boolean | false | 禁用状态 |
| checkedChildren | ReactNode | - | 选中时的内容 |
| unCheckedChildren | ReactNode | - | 非选中时的内容 |
| size | 'default' \| 'small' | 'default' | 开关大小 |

#### 使用示例

```tsx
<Switch
  checked={useSubtitles}
  onChange={setUseSubtitles}
  checkedChildren="开启字幕"
  unCheckedChildren="关闭字幕"
/>
```

## 最佳实践

### 组件组合

组件可以组合使用以创建更复杂的界面：

```tsx
<Card title="视频设置">
  <Form layout="vertical">
    <Form.Item label="音量调整">
      <Row align="middle">
        <Col span={18}>
          <Slider
            value={audioVolume}
            onChange={setAudioVolume}
          />
        </Col>
        <Col span={4} offset={2}>
          <InputNumber
            min={0}
            max={100}
            value={audioVolume}
            onChange={setAudioVolume}
          />
        </Col>
      </Row>
    </Form.Item>
    <Form.Item label="转场效果">
      <Select
        value={transitionType}
        onChange={setTransitionType}
        style={{ width: '100%' }}
      >
        {transitionOptions.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item label="字幕设置">
      <Switch
        checked={useSubtitles}
        onChange={setUseSubtitles}
        checkedChildren="开启"
        unCheckedChildren="关闭"
      />
    </Form.Item>
  </Form>
</Card>
```

### 响应式设计

使用栅格系统实现响应式布局：

```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} md={16}>
    <Card title="视频预览">
      <VideoPlayer src={videoSrc} />
    </Card>
  </Col>
  <Col xs={24} md={8}>
    <Card title="编辑工具">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button type="primary" block icon={<ScissorOutlined />}>
          剪辑片段
        </Button>
        <Button block icon={<SoundOutlined />}>
          调整音量
        </Button>
        <Button block icon={<TransactionOutlined />}>
          添加转场
        </Button>
      </Space>
    </Card>
  </Col>
</Row>
```

### 主题适配

组件支持亮色和暗色主题，通过ThemeContext进行控制：

```tsx
// 在应用顶层提供主题上下文
const App = () => {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout className={theme === 'dark' ? 'dark-theme' : ''}>
        {/* 应用内容 */}
      </Layout>
    </ThemeContext.Provider>
  );
};

// 在组件中使用主题
const ThemedComponent = () => {
  const { theme } = useContext(ThemeContext);
  
  return (
    <Card 
      className={`themed-card ${theme === 'dark' ? 'dark-card' : ''}`}
      title="主题适配示例"
    >
      <p>当前主题: {theme}</p>
    </Card>
  );
};
```

## 自定义组件

### 创建自定义组件

当Ant Design提供的组件无法满足特定需求时，可以创建自定义组件：

```tsx
// 自定义时间码组件
interface TimeCodeProps {
  seconds: number;
  showMilliseconds?: boolean;
}

const TimeCode: React.FC<TimeCodeProps> = ({ seconds, showMilliseconds = false }) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return (
    <span className="time-code">
      {String(hours).padStart(2, '0')}:
      {String(minutes).padStart(2, '0')}:
      {String(secs).padStart(2, '0')}
      {showMilliseconds && `.${String(milliseconds).padStart(3, '0')}`}
    </span>
  );
};

// 使用示例
<TimeCode seconds={currentTime} showMilliseconds={true} />
```

## 组件扩展

### 扩展现有组件

可以通过HOC(高阶组件)或自定义Hooks扩展现有组件功能：

```tsx
// 带加载状态的按钮HOC
const withLoadingState = (Component) => {
  return ({ isLoading, ...props }) => (
    <Component
      {...props}
      loading={isLoading}
      disabled={isLoading || props.disabled}
    />
  );
};

const LoadingButton = withLoadingState(Button);

// 使用示例
<LoadingButton 
  isLoading={processing}
  type="primary"
  onClick={handleProcess}
>
  处理视频
</LoadingButton>
```

## 总结

BlazeCut组件库提供了丰富的UI组件，用于构建专业的视频编辑界面。通过合理组合和使用这些组件，可以创建一致、高效且用户友好的视频编辑体验。在开发过程中，应遵循设计规范，保持界面的一致性和专业性。