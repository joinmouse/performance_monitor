/**
 * SDK配置接口
 */
export interface PerformanceConfig {
  /** 应用唯一标识 */
  appId: string;
  /** 性能数据上报地址 */
  reportUrl: string;
  /** 采样率 0-1之间的数值，1表示100%采集 */
  sampling?: number;
  /** Web Vitals核心指标阈值配置 */
  webVitals?: {
    /** 最大内容绘制时间阈值(ms) */
    LCP?: number;
    /** 首次输入延迟阈值(ms) */
    FID?: number;
    /** 累积布局偏移阈值 */
    CLS?: number;
  };
  /** 不需要采集的资源类型列表 */
  ignoreResources?: string[];
  /** 是否启用资源加载性能采集 */
  enableResourceTiming?: boolean;
  /** 资源计时缓冲区大小 */
  resourceTimingBufferSize?: number;
  /** 是否自动清理资源计时数据 */
  clearResourceTimings?: boolean;
}

/**
 * 导航计时指标接口
 * 包含从页面开始加载到加载完成各个阶段的时间指标
 */
export interface NavigationMetrics {
  /** DNS解析耗时 */
  dnsTime: number;
  /** TCP连接耗时 */
  tcpTime: number;
  /** 首字节时间(Time to First Byte) */
  ttfb: number;
  /** DOM解析耗时 */
  domParseTime: number;
  /** 页面完全加载耗时 */
  loadTime: number;
  /** 重定向耗时 */
  redirectTime: number;
  /** SSL安全连接耗时 */
  sslTime: number;
  /** 响应下载耗时 */
  responseTime: number;
  /** DOM内容加载耗时 */
  domContentLoaded: number;
  /** 首字节时间 */
  firstByte: number;
  /** 可交互时间 */
  interactive: number;
}

/**
 * 资源加载计时接口
 * 记录单个资源加载过程中各个阶段的耗时
 */
export interface ResourceTiming {
  /** DNS解析耗时 */
  dns: number;
  /** TCP连接耗时 */
  tcp: number;
  /** 首字节时间 */
  ttfb: number;
  /** 资源下载耗时 */
  download: number;
}

/**
 * 资源加载性能指标接口
 */
export interface ResourceMetric {
  /** 资源名称/地址 */
  name: string;
  /** 资源类型(script/css/img等) */
  type: string;
  /** 资源加载总耗时 */
  duration: number;
  /** 资源大小(单位:byte) */
  size: number;
  /** 资源加载各阶段计时信息 */
  timing: ResourceTiming;
}

/**
 * Web Vitals核心性能指标接口
 */
export interface WebVitalsMetric {
  /** 首次内容绘制时间(ms) */
  fcp: number;
  /** 最大内容绘制时间(ms) */
  lcp: number;
  /** 首次输入延迟时间(ms) */
  fid: number;
  /** 累积布局偏移分数 */
  cls: number;
}

/**
 * 性能指标数据集合接口
 */
export interface PerformanceMetrics {
  /** 导航计时指标 */
  navigation: NavigationMetrics;
  /** Web Vitals指标 */
  webVitals: WebVitalsMetric;
  /** 资源加载性能指标列表 */
  resources: ResourceMetric[];
}
