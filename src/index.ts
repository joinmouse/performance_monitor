import { PerformanceConfig } from "./types";
import { PerformanceCollector } from "./collector";
import { PerformanceReporter } from "./reporter";

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private collector: PerformanceCollector;
  private reporter: PerformanceReporter;
  private config: PerformanceConfig;

  private constructor(config: PerformanceConfig) {
    this.config = config;
    this.collector = PerformanceCollector.getInstance();
    this.reporter = new PerformanceReporter(config);
    this.init();
  }

  static init(config: PerformanceConfig): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  private init(): void {
    // 在页面加载完成后收集并上报性能数据
    window.addEventListener("load", () => {
      // 给页面完全加载完一些额外时间，确保能收集到所有性能数据
      setTimeout(() => {
        this.collect();
      }, 1000);
    });
  }

  private collect(): void {
    // 采样控制
    if (this.config.sampling && Math.random() > this.config.sampling) {
      return;
    }

    const metrics = {
      navigation: this.collector.collectNavigationMetrics(),
      webVitals: this.collector.collectWebVitals(),
      resources: this.collector.collectResourceMetrics(),
    };

    this.reporter.report(metrics);
  }

  // 提供手动打点方法
  static mark(name: string): void {
    performance.mark(name);
  }

  static measure(name: string, startMark: string, endMark: string): void {
    performance.measure(name, startMark, endMark);
  }
}

export default PerformanceMonitor;
