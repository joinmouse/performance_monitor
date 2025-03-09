import { PerformanceMetrics, PerformanceConfig } from "./types";

export class PerformanceReporter {
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  async report(metrics: PerformanceMetrics): Promise<void> {
    const data = {
      common: {
        appId: this.config.appId,
        pageUrl: window.location.href,
        timestamp: Date.now(),
      },
      metrics,
    };

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.config.reportUrl, JSON.stringify(data));
      } else {
        await fetch(this.config.reportUrl, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Performance data report failed:", error);
    }
  }
}
