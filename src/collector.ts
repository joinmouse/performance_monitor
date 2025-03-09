import { NavigationMetrics, ResourceMetric, WebVitalsMetric } from "./types";

/**
 * 性能数据收集器类
 * 负责收集页面各项性能指标
 */
export class PerformanceCollector {
  /** 单例实例 */
  private static instance: PerformanceCollector;
  /** 标记FCP是否已收集 */
  private fcpResolved = false;

  private constructor() {
    this.initObservers();
  }

  /**
   * 获取收集器单例
   * @returns PerformanceCollector实例
   */
  static getInstance(): PerformanceCollector {
    if (!PerformanceCollector.instance) {
      PerformanceCollector.instance = new PerformanceCollector();
    }
    return PerformanceCollector.instance;
  }

  /**
   * 初始化各个性能指标的观察者
   * 使用PerformanceObserver API监听性能事件
   */
  private initObservers(): void {
    // 监听首次内容绘制(FCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        this.webVitals.fcp = entries[0].startTime;
        this.fcpResolved = true;
      }
    }).observe({ entryTypes: ["paint"] });

    // 监听最大内容绘制(LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.webVitals.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // 监听首次输入延迟(FID)
    new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0] as PerformanceEventTiming;
      if (firstInput) {
        this.webVitals.fid = firstInput.processingStart - firstInput.startTime;
      }
    }).observe({ entryTypes: ["first-input"] });

    // 监听累积布局偏移(CLS)
    let clsValue = 0;
    let clsEntries: LayoutShift[] = [];

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShift = entry as LayoutShift;
        if (!layoutShift.hadRecentInput) {
          const firstSessionEntry = clsEntries[0];
          const lastSessionEntry = clsEntries[clsEntries.length - 1];

          // 如果两次偏移间隔超过1秒，重新开始计算
          if (
            firstSessionEntry &&
            entry.startTime - lastSessionEntry.startTime >= 1000
          ) {
            clsValue = 0;
            clsEntries = [layoutShift];
          } else {
            clsEntries.push(layoutShift);
            clsValue += layoutShift.value;
          }
        }
      }
      this.webVitals.cls = clsValue;
    }).observe({ entryTypes: ["layout-shift"] });

    // 监听资源加载性能
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      this.resourceMetrics.push(...this.formatResourceEntries(entries));
    }).observe({ entryTypes: ["resource"] });
  }

  /** Web Vitals指标数据 */
  private webVitals: WebVitalsMetric = {
    fcp: 0,
    lcp: 0,
    fid: 0,
    cls: 0,
  };

  /** 资源加载性能数据 */
  private resourceMetrics: ResourceMetric[] = [];

  /**
   * 格式化资源性能条目
   * @param entries - 性能条目数组
   * @returns 格式化后的资源性能指标数组
   */
  private formatResourceEntries(entries: PerformanceEntry[]): ResourceMetric[] {
    return entries.map((entry: PerformanceResourceTiming) => ({
      name: entry.name,
      type: entry.initiatorType,
      duration: entry.duration,
      size: entry.transferSize,
      timing: {
        dns: entry.domainLookupEnd - entry.domainLookupStart,
        tcp: entry.connectEnd - entry.connectStart,
        ttfb: entry.responseStart - entry.requestStart,
        download: entry.responseEnd - entry.responseStart,
      },
    }));
  }

  /**
   * 收集导航计时指标
   * @returns 导航计时数据
   */
  collectNavigationMetrics(): NavigationMetrics {
    const timing = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (!timing) {
      return {
        dnsTime: 0,
        tcpTime: 0,
        ttfb: 0,
        domParseTime: 0,
        loadTime: 0,
        redirectTime: 0,
        sslTime: 0,
        responseTime: 0,
        domContentLoaded: 0,
        firstByte: 0,
        interactive: 0,
      };
    }

    return {
      dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
      tcpTime: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      domParseTime: timing.domInteractive - timing.responseEnd,
      loadTime: timing.loadEventEnd - timing.fetchStart,
      redirectTime: timing.redirectEnd - timing.redirectStart,
      sslTime: timing.connectEnd - timing.secureConnectionStart,
      responseTime: timing.responseEnd - timing.responseStart,
      domContentLoaded:
        timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      firstByte: timing.responseStart - timing.fetchStart,
      interactive: timing.domInteractive - timing.fetchStart,
    };
  }

  /**
   * 收集资源加载性能指标
   * @returns 资源性能指标数组
   */
  collectResourceMetrics(): ResourceMetric[] {
    return this.resourceMetrics;
  }

  /**
   * 收集Web Vitals指标
   * @returns Web Vitals数据
   */
  collectWebVitals(): WebVitalsMetric {
    return this.webVitals;
  }

  /**
   * 清理资源性能条目
   * 防止内存占用过大
   */
  clearResourceMetrics(): void {
    this.resourceMetrics = [];
    performance.clearResourceTimings();
  }
}
