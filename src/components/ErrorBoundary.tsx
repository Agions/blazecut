import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';
import { handleErrorBoundaryFallback } from '@/utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * 错误边界组件
 * 捕获子组件树中的JavaScript错误，记录并显示备用UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新状态，以便下一次渲染显示备用UI
    return { 
      hasError: true, 
      error,
      errorInfo: error.message
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null
    });
    
    // 使用错误处理工具
    handleErrorBoundaryFallback(error);
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义的fallback，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 默认的错误UI
      return (
        <Result
          status="error"
          title="应用发生了错误"
          subTitle={this.state.error?.message || '未知错误'}
          extra={[
            <Button type="primary" key="retry" onClick={this.resetErrorBoundary}>
              重试
            </Button>,
            <Button key="refresh" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
          ]}
        >
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: 20, textAlign: 'left', overflow: 'auto', maxHeight: 300 }}>
              <details>
                <summary>错误详情</summary>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.errorInfo}</pre>
              </details>
            </div>
          )}
        </Result>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 