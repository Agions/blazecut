import React, { useState } from 'react';
import { 
  Typography, Table, Button, Space, Card, Input, 
  Modal, Form, Select, Tag, Tooltip, Empty, 
  Dropdown, Menu, Tabs, Row, Col, Statistic, Badge,
  Divider, Avatar, List} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExportOutlined, 
  EyeOutlined,
  CopyOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  DownOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FolderOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

interface Project {
  id: string;
  name: string;
  createTime: string;
  updateTime: string;
  status: 'draft' | 'completed' | 'in_progress';
  duration: string;
  type: string;
  thumbnail?: string;
  videoCount?: number;
  scriptCount?: number;
  lastEditor?: string;
  tags?: string[];
}

const ProjectManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [sortField, setSortField] = useState<string>('updateTime');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: '短剧《乡村振兴》解说',
      createTime: '2023-08-15 14:30',
      updateTime: '2023-08-16 09:45',
      status: 'completed',
      duration: '05:30',
      type: '剧情',
      thumbnail: 'https://picsum.photos/seed/project1/100/56',
      videoCount: 3,
      scriptCount: 5,
      lastEditor: '张三',
      tags: ['短剧', '乡村']
    },
    {
      id: '2',
      name: '产品演示视频配音',
      createTime: '2023-08-10 11:20',
      updateTime: '2023-08-10 16:15',
      status: 'draft',
      duration: '03:15',
      type: '产品',
      thumbnail: 'https://picsum.photos/seed/project2/100/56',
      videoCount: 1,
      scriptCount: 2,
      lastEditor: '李四',
      tags: ['产品', '演示']
    },
    {
      id: '3',
      name: '旅游vlog解说',
      createTime: '2023-07-28 09:00',
      updateTime: '2023-08-05 10:30',
      status: 'completed',
      duration: '08:45',
      type: '旅游',
      thumbnail: 'https://picsum.photos/seed/project3/100/56',
      videoCount: 5,
      scriptCount: 8,
      lastEditor: '王五',
      tags: ['旅游', 'vlog']
    },
    {
      id: '4',
      name: '教育课程讲解',
      createTime: '2023-08-20 08:30',
      updateTime: '2023-08-21 15:45',
      status: 'in_progress',
      duration: '12:20',
      type: '教育',
      thumbnail: 'https://picsum.photos/seed/project4/100/56',
      videoCount: 8,
      scriptCount: 12,
      lastEditor: '赵六',
      tags: ['教育', '课程']
    },
    {
      id: '5',
      name: '游戏实况解说',
      createTime: '2023-08-18 16:00',
      updateTime: '2023-08-19 10:15',
      status: 'in_progress',
      duration: '25:45',
      type: '游戏',
      thumbnail: 'https://picsum.photos/seed/project5/100/56',
      videoCount: 2,
      scriptCount: 4,
      lastEditor: '张三',
      tags: ['游戏', '实况']
    }
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectTypes, setProjectTypes] = useState(['剧情', '产品', '旅游', '教育', '游戏', '纪录片', '其他']);

  // 统计信息
  const projectStats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    draft: projects.filter(p => p.status === 'draft').length
  };

  // 最近活动的项目
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())
    .slice(0, 3);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // 处理表格选择
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // 批量删除
  const handleBatchDelete = () => {
    Modal.confirm({
      title: '批量删除项目',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个项目吗？此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        setProjects(projects.filter(p => !selectedRowKeys.includes(p.id)));
        setSelectedRowKeys([]);
      }
    });
  };

  // 批量导出
  const handleBatchExport = () => {
    Modal.success({
      title: '批量导出',
      content: `已开始导出 ${selectedRowKeys.length} 个项目，导出完成后将通知您。`,
      okText: '确定'
    });
  };

  // 处理排序
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
    } else {
      setSortField(field);
      setSortOrder('descend');
    }
  };

  // 过滤和排序后的项目列表
  const filteredProjects = projects
    .filter(project => 
      (activeTab === 'all' || 
       (activeTab === 'completed' && project.status === 'completed') ||
       (activeTab === 'in_progress' && project.status === 'in_progress') ||
       (activeTab === 'draft' && project.status === 'draft')) &&
      (project.name.toLowerCase().includes(searchText.toLowerCase()) ||
       project.type.toLowerCase().includes(searchText.toLowerCase()) ||
       (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))))
    )
    .sort((a, b) => {
      if (sortField === 'updateTime') {
        return sortOrder === 'ascend' 
          ? new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime()
          : new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime();
      } else if (sortField === 'createTime') {
        return sortOrder === 'ascend' 
          ? new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
          : new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
      } else if (sortField === 'name') {
        return sortOrder === 'ascend'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return 0;
      }
    });

  // 打开创建/编辑模态框
  const showModal = (project?: Project) => {
    if (project) {
      setCurrentProject(project);
      form.setFieldsValue({
        name: project.name,
        type: project.type,
        status: project.status,
        tags: project.tags || []
      });
    } else {
      setCurrentProject(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  // 处理模态框确认
  const handleOk = () => {
    form.validateFields().then(values => {
      if (currentProject) {
        // 更新项目
        const updatedProjects = projects.map(p => 
          p.id === currentProject.id 
            ? { 
                ...p, 
                name: values.name, 
                type: values.type, 
                status: values.status,
                tags: values.tags,
                updateTime: new Date().toLocaleString('zh-CN', { hour12: false }) 
              } 
            : p
        );
        setProjects(updatedProjects);
      } else {
        // 创建新项目
        const newProject: Project = {
          id: Date.now().toString(),
          name: values.name,
          type: values.type,
          status: values.status || 'draft',
          tags: values.tags || [],
          createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
          updateTime: new Date().toLocaleString('zh-CN', { hour12: false }),
          duration: '00:00',
          videoCount: 0,
          scriptCount: 0,
          lastEditor: '当前用户',
          thumbnail: 'https://picsum.photos/seed/' + Date.now() + '/100/56'
        };
        setProjects([...projects, newProject]);
      }
      setIsModalVisible(false);
    });
  };

  // 删除项目
  const handleDelete = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // 复制项目
  const handleDuplicate = (project: Project) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (副本)`,
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      updateTime: new Date().toLocaleString('zh-CN', { hour12: false }),
      status: 'draft'
    };
    setProjects([...projects, newProject]);
  };

  // 查看项目
  const handleView = (id: string) => {
    navigate(`/script-editor?project=${id}`);
  };

  // 新建类型
  const handleAddType = (newType: string) => {
    if (newType && !projectTypes.includes(newType)) {
      setProjectTypes([...projectTypes, newType]);
    }
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // 表格列定义
  const columns = [
    {
      title: '项目信息',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <div style={{ display: 'flex' }}>
          {record.thumbnail && (
            <div style={{ marginRight: 12 }}>
              <img 
                src={record.thumbnail} 
                alt={text} 
                style={{ width: 100, height: 56, borderRadius: 4, objectFit: 'cover' }} 
              />
            </div>
          )}
          <div>
            <Text strong style={{ cursor: 'pointer', fontSize: 16 }} onClick={() => handleView(record.id)}>
              {text}
            </Text>
            <div style={{ marginTop: 4 }}>
              <Space size={12}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {record.duration}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <VideoCameraOutlined style={{ marginRight: 4 }} />
                  {record.videoCount} 个视频
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <FileTextOutlined style={{ marginRight: 4 }} />
                  {record.scriptCount} 个脚本
                </Text>
              </Space>
            </div>
            <div style={{ marginTop: 6 }}>
              {record.tags && record.tags.map(tag => (
                <Tag key={tag} style={{ marginRight: 4 }}>{tag}</Tag>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        let color = '';
        let text = '';
        
        switch(status) {
          case 'completed':
            color = 'success';
            text = '已完成';
            break;
          case 'in_progress':
            color = 'processing';
            text = '进行中';
            break;
          case 'draft':
            color = 'warning';
            text = '草稿';
            break;
          default:
            color = 'default';
            text = '未知';
        }
        
        return <Badge status={color as any} text={text} />;
      },
    },
    {
      title: (
        <div 
          onClick={() => handleSortChange('updateTime')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          最后更新
          <SortAscendingOutlined 
            style={{ 
              marginLeft: 4, 
              transform: sortField === 'updateTime' && sortOrder === 'descend' ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s'
            }} 
          />
        </div>
      ),
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (time: string, record: Project) => (
        <div>
          <div>{time}</div>
          <div style={{ fontSize: 12, color: '#999' }}>由 {record.lastEditor} 更新</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 170,
      render: (_: any, record: Project) => (
        <Space size="middle">
          <Tooltip title="查看">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record.id)} 
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showModal(record)} 
            />
          </Tooltip>
          <Dropdown 
            overlay={
              <Menu>
                <Menu.Item 
                  key="duplicate" 
                  icon={<CopyOutlined />} 
                  onClick={() => handleDuplicate(record)}
                >
                  复制项目
                </Menu.Item>
                <Menu.Item 
                  key="export" 
                  icon={<ExportOutlined />}
                >
                  导出项目
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  key="delete" 
                  icon={<DeleteOutlined />} 
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: '确定要删除此项目吗？',
                      content: '删除后将无法恢复，所有相关的视频和脚本都将被删除。',
                      onOk: () => handleDelete(record.id),
                      okText: "确定",
                      cancelText: "取消"
                    });
                  }}
                >
                  删除项目
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="text" icon={<DownOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="app-container">
      <Title level={3} className="page-title">项目管理</Title>
      <Paragraph>管理所有的解说项目，包括创建新项目、编辑、导出和删除</Paragraph>
      
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="全部项目" 
              value={projectStats.total} 
              prefix={<FolderOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="已完成项目" 
              value={projectStats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="进行中项目" 
              value={projectStats.inProgress}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ClockCircleOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="草稿项目" 
              value={projectStats.draft}
              valueStyle={{ color: '#faad14' }}
              prefix={<FileTextOutlined />} 
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={18}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab={`全部项目 (${projectStats.total})`} key="all" />
              <TabPane tab={`已完成 (${projectStats.completed})`} key="completed" />
              <TabPane tab={`进行中 (${projectStats.inProgress})`} key="in_progress" />
              <TabPane tab={`草稿 (${projectStats.draft})`} key="draft" />
            </Tabs>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Space>
                <Search
                  placeholder="搜索项目名称、类型或标签"
                  onSearch={handleSearch}
                  style={{ width: 300 }}
                  allowClear
                />
                <Dropdown 
                  overlay={
                    <Menu>
                      <Menu.ItemGroup title="排序方式">
                        <Menu.Item 
                          key="sort-update" 
                          onClick={() => handleSortChange('updateTime')}
                          icon={sortField === 'updateTime' ? <CheckCircleOutlined /> : null}
                        >
                          最后更新时间
                        </Menu.Item>
                        <Menu.Item 
                          key="sort-create" 
                          onClick={() => handleSortChange('createTime')}
                          icon={sortField === 'createTime' ? <CheckCircleOutlined /> : null}
                        >
                          创建时间
                        </Menu.Item>
                        <Menu.Item 
                          key="sort-name" 
                          onClick={() => handleSortChange('name')}
                          icon={sortField === 'name' ? <CheckCircleOutlined /> : null}
                        >
                          项目名称
                        </Menu.Item>
                      </Menu.ItemGroup>
                      <Menu.Divider />
                      <Menu.Item key="sort-order" onClick={() => setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend')}>
                        {sortOrder === 'ascend' ? '降序排列' : '升序排列'}
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Button icon={<FilterOutlined />}>
                    筛选排序 <DownOutlined />
                  </Button>
                </Dropdown>
              </Space>
              
              <Space>
                {selectedRowKeys.length > 0 && (
                  <>
                    <Text type="secondary">已选择 {selectedRowKeys.length} 项</Text>
                    <Button 
                      icon={<ExportOutlined />}
                      onClick={handleBatchExport}
                    >
                      批量导出
                    </Button>
                    <Button 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleBatchDelete}
                    >
                      批量删除
                    </Button>
                    <Divider type="vertical" />
                  </>
                )}
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                >
                  新建项目
                </Button>
              </Space>
            </div>
            
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredProjects}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{ 
                defaultPageSize: 5, 
                showSizeChanger: true, 
                pageSizeOptions: ['5', '10', '20'],
                showTotal: (total) => `共 ${total} 个项目`
              }}
              locale={{
                emptyText: (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="暂无项目，点击右上角新建按钮创建项目"
                  />
                )
              }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="最近活动" style={{ marginBottom: 24 }}>
            <List
              itemLayout="horizontal"
              dataSource={recentProjects}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.thumbnail} shape="square" />}
                    title={<a onClick={() => handleView(item.id)}>{item.name}</a>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.updateTime} 更新
                        </Text>
                        <Badge 
                          status={
                            item.status === 'completed' ? 'success' :
                            item.status === 'in_progress' ? 'processing' : 'warning'
                          } 
                          text={
                            item.status === 'completed' ? '已完成' :
                            item.status === 'in_progress' ? '进行中' : '草稿'
                          } 
                          style={{ fontSize: 12 }}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
          
          <Card title="快速操作">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button 
                icon={<VideoCameraOutlined />}
                onClick={() => navigate('/video-analysis')}
              >
                上传新视频
              </Button>
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/script-editor')}
              >
                新建解说文案
              </Button>
              <Button 
                icon={<TeamOutlined />}
              >
                团队协作
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Modal
        title={currentProject ? "编辑项目" : "创建新项目"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'draft' }}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="项目类型"
            rules={[{ required: true, message: '请选择项目类型' }]}
          >
            <Select 
              placeholder="请选择项目类型"
              dropdownRender={menu => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <div style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="添加新类型"
                      onPressEnter={(e) => {
                        handleAddType((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }}
                    />
                  </div>
                </>
              )}
            >
              {projectTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="项目状态"
          >
            <Select placeholder="请选择项目状态">
              <Option value="draft">草稿</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="项目标签"
          >
            <Select 
              mode="tags" 
              placeholder="输入标签后按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement; 