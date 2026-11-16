/**
 * Network Monitoring Middleware
 * Tracks HTTP metrics (latencies, status codes, request counts) for Computer Networks analysis.
 * Avoids logging sensitive payload data (e.g. passwords).
 */

class NetworkStatsManager {
  constructor() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.totalLatencyMs = 0;
    this.statusCodes = {};
    this.recentRequests = []; // max 50 recent requests
    this.startTime = Date.now();
  }

  recordRequest(method, path, statusCode, durationMs) {
    this.totalRequests++;
    this.totalLatencyMs += durationMs;

    if (statusCode >= 200 && statusCode < 400) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }

    this.statusCodes[statusCode] = (this.statusCodes[statusCode] || 0) + 1;

    // Keep last 50 requests
    this.recentRequests.unshift({
      id: this.totalRequests,
      method,
      path,
      statusCode,
      durationMs: parseFloat(durationMs.toFixed(2)),
      timestamp: new Date().toISOString()
    });

    if (this.recentRequests.length > 50) {
      this.recentRequests.pop();
    }
  }

  getMetrics() {
    const avgLatency = this.totalRequests > 0 
      ? parseFloat((this.totalLatencyMs / this.totalRequests).toFixed(2)) 
      : 0;

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      averageLatencyMs: avgLatency,
      statusCodes: this.statusCodes,
      recentRequests: this.recentRequests,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }

  reset() {
    this.totalRequests = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
    this.totalLatencyMs = 0;
    this.statusCodes = {};
    this.recentRequests = [];
  }
}

export const networkStats = new NetworkStatsManager();

export const networkTrackerMiddleware = (req, res, next) => {
  const start = performance.now();

  res.on('finish', () => {
    const duration = performance.now() - start;
    // Don't track static polling excessively if needed, but track all API requests
    if (req.originalUrl.startsWith('/api')) {
      networkStats.recordRequest(req.method, req.originalUrl, res.statusCode, duration);
    }
  });

  next();
};
