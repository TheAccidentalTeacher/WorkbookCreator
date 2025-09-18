/**
 * Comprehensive Debug System for Pedagogical Workbook Generator
 * Provides detailed logging, state tracking, and performance monitoring
 * Access via window.DebugSystem in F12 console
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

export interface DebugConfig {
  enabled: boolean;
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  components: string[];
  showTimestamps: boolean;
  showStackTrace: boolean;
  persistLogs: boolean;
  maxLogSize: number;
}

export interface DebugLog {
  id: string;
  timestamp: number;
  level: string;
  component: string;
  message: string;
  data?: AnyData;
  stackTrace?: string;
  performance?: {
    duration?: number;
    memory?: number;
  };
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Window {
    DebugSystem: DebugSystem;
  }
  interface Performance {
    memory?: MemoryInfo;
  }
}

class DebugSystem {
  private config: DebugConfig = {
    enabled: process.env.NODE_ENV === 'development',
    level: 'debug',
    components: ['*'], // Log all components by default
    showTimestamps: true,
    showStackTrace: false,
    persistLogs: true,
    maxLogSize: 1000
  };

  private logs: DebugLog[] = [];
  private performanceMarks: Map<string, number> = new Map();
  private componentStates: Map<string, AnyData> = new Map();

  constructor() {
    // Make debug system available globally in development
    if (typeof window !== 'undefined' && this.config.enabled) {
      window.DebugSystem = this;
      this.info('DebugSystem', 'Debug system initialized', {
        config: this.config,
        commands: [
          'DebugSystem.getLogs()',
          'DebugSystem.clearLogs()',
          'DebugSystem.setLevel("debug")',
          'DebugSystem.enableComponent("WorkbookGenerator")',
          'DebugSystem.getComponentState("AIService")',
          'DebugSystem.exportLogs()',
          'DebugSystem.showPerformance()'
        ]
      });
    }
  }

  // Configuration methods
  setConfig(updates: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...updates };
    this.info('DebugSystem', 'Configuration updated', updates);
  }

  setLevel(level: DebugConfig['level']): void {
    this.config.level = level;
    this.info('DebugSystem', `Log level set to ${level}`);
  }

  enableComponent(component: string): void {
    if (!this.config.components.includes(component) && !this.config.components.includes('*')) {
      this.config.components.push(component);
    }
    this.info('DebugSystem', `Enabled logging for component: ${component}`);
  }

  disableComponent(component: string): void {
    this.config.components = this.config.components.filter(c => c !== component);
    this.info('DebugSystem', `Disabled logging for component: ${component}`);
  }

  // Logging methods
  error(component: string, message: string, data?: AnyData, error?: Error): void {
    this.log('error', component, message, data, error?.stack);
  }

  warn(component: string, message: string, data?: AnyData): void {
    this.log('warn', component, message, data);
  }

  info(component: string, message: string, data?: AnyData): void {
    this.log('info', component, message, data);
  }

  debug(component: string, message: string, data?: AnyData): void {
    this.log('debug', component, message, data);
  }

  trace(component: string, message: string, data?: AnyData): void {
    this.log('trace', component, message, data, this.config.showStackTrace ? new Error().stack : undefined);
  }

  private log(level: string, component: string, message: string, data?: AnyData, stackTrace?: string): void {
    if (!this.shouldLog(level, component)) return;

    const logEntry: DebugLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      component,
      message,
      data: data ? this.sanitizeData(data) : undefined,
      stackTrace
    };

    // Add to logs array
    this.logs.push(logEntry);
    
    // Maintain max log size
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }

    // Console output with styling
    this.outputToConsole(logEntry);

    // Persist to localStorage if enabled
    if (this.config.persistLogs && typeof window !== 'undefined') {
      try {
        localStorage.setItem('debugLogs', JSON.stringify(this.logs.slice(-100))); // Keep last 100
      } catch {
        // Storage might be full, clear old logs
        localStorage.removeItem('debugLogs');
      }
    }
  }

  // Performance tracking
  startPerformance(label: string): void {
    this.performanceMarks.set(label, performance.now());
    this.debug('Performance', `Started timing: ${label}`);
  }

  endPerformance(label: string, component?: string): number | undefined {
    const startTime = this.performanceMarks.get(label);
    if (!startTime) {
      this.warn('Performance', `No start mark found for: ${label}`);
      return undefined;
    }

    const duration = performance.now() - startTime;
    this.performanceMarks.delete(label);
    
    const perfData = {
      duration: Math.round(duration * 100) / 100,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100
      } : undefined
    };

    this.info(component || 'Performance', `Completed timing: ${label}`, perfData);
    return duration;
  }

  // State tracking
  setState(component: string, state: AnyData): void {
    this.componentStates.set(component, {
      ...state,
      _lastUpdated: Date.now()
    });
    this.debug('StateTracker', `State updated for ${component}`, { 
      stateKeys: Object.keys(state),
      timestamp: new Date().toISOString()
    });
  }

  getState(component: string): AnyData {
    return this.componentStates.get(component);
  }

  // API call tracking
  trackApiCall(method: string, url: string, requestData?: AnyData): string {
    const callId = `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startPerformance(callId);
    this.info('API', `${method} ${url}`, {
      callId,
      requestData: requestData ? this.sanitizeData(requestData) : undefined,
      timestamp: new Date().toISOString()
    });
    return callId;
  }

  trackApiResponse(callId: string, status: number, responseData?: AnyData, error?: Error): void {
    const duration = this.endPerformance(callId);
    this.info('API', `Response for ${callId}`, {
      status,
      duration,
      success: status >= 200 && status < 300,
      responseData: responseData ? this.sanitizeData(responseData) : undefined,
      error: error ? { message: error.message, stack: error.stack } : undefined
    });
  }

  // Utility methods
  getLogs(component?: string, level?: string): DebugLog[] {
    return this.logs.filter(log => {
      const componentMatch = !component || log.component === component;
      const levelMatch = !level || log.level === level;
      return componentMatch && levelMatch;
    });
  }

  clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('debugLogs');
    }
    console.clear();
    this.info('DebugSystem', 'Logs cleared');
  }

  exportLogs(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      config: this.config,
      logs: this.logs,
      componentStates: Object.fromEntries(this.componentStates)
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create download link
    if (typeof window !== 'undefined') {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debug-logs-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    return jsonString;
  }

  showPerformance(): void {
    const perfLogs = this.getLogs().filter(log => 
      log.component === 'Performance' && log.data?.duration
    );
    
    console.table(perfLogs.map(log => ({
      operation: log.message.replace('Completed timing: ', ''),
      duration: `${log.data.duration}ms`,
      memory: log.data.memory ? `${log.data.memory.used}MB` : 'N/A',
      timestamp: new Date(log.timestamp).toISOString()
    })));
  }

  getComponentState(component: string): AnyData {
    const state = this.getState(component);
    if (state) {
      console.log(`State for ${component}:`, state);
      return state;
    } else {
      console.warn(`No state found for component: ${component}`);
      return null;
    }
  }

  // Private helper methods
  private shouldLog(level: string, component: string): boolean {
    if (!this.config.enabled) return false;
    
    const levelPriority = { error: 0, warn: 1, info: 2, debug: 3, trace: 4 };
    const currentPriority = levelPriority[this.config.level as keyof typeof levelPriority] ?? 2;
    const logPriority = levelPriority[level as keyof typeof levelPriority] ?? 2;
    
    if (logPriority > currentPriority) return false;
    
    return this.config.components.includes('*') || this.config.components.includes(component);
  }

  private sanitizeData(data: AnyData): AnyData {
    try {
      // Remove circular references and sensitive data
      return JSON.parse(JSON.stringify(data, (key, value) => {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') || 
            key.toLowerCase().includes('secret')) {
          return '[REDACTED]';
        }
        return value;
      }));
    } catch {
      return '[CIRCULAR_REFERENCE]';
    }
  }

  private outputToConsole(log: DebugLog): void {
    const styles = {
      error: 'color: #ff4444; background: #ffe6e6; padding: 2px 5px; border-radius: 3px;',
      warn: 'color: #ff8800; background: #fff3e0; padding: 2px 5px; border-radius: 3px;',
      info: 'color: #0066cc; background: #e6f3ff; padding: 2px 5px; border-radius: 3px;',
      debug: 'color: #666666; background: #f5f5f5; padding: 2px 5px; border-radius: 3px;',
      trace: 'color: #8600b3; background: #f3e6ff; padding: 2px 5px; border-radius: 3px;'
    };

    const timestamp = this.config.showTimestamps 
      ? `[${new Date(log.timestamp).toLocaleTimeString()}] ` 
      : '';
    
    const style = styles[log.level as keyof typeof styles] || styles.info;
    
    console.log(
      `%c${log.level.toUpperCase()}%c ${timestamp}[${log.component}] ${log.message}`,
      style,
      'color: inherit; background: inherit; padding: inherit;',
      log.data || ''
    );

    if (log.data && Object.keys(log.data).length > 0) {
      console.log('└─ Data:', log.data);
    }

    if (log.stackTrace) {
      console.log('└─ Stack:', log.stackTrace);
    }
  }
}

// Create singleton instance
export const debugSystem = new DebugSystem();

// Export convenience methods
export const debug = {
  error: (component: string, message: string, data?: AnyData, error?: Error) => 
    debugSystem.error(component, message, data, error),
  warn: (component: string, message: string, data?: AnyData) => 
    debugSystem.warn(component, message, data),
  info: (component: string, message: string, data?: AnyData) => 
    debugSystem.info(component, message, data),
  debug: (component: string, message: string, data?: AnyData) => 
    debugSystem.debug(component, message, data),
  trace: (component: string, message: string, data?: AnyData) => 
    debugSystem.trace(component, message, data),
  
  performance: {
    start: (label: string) => debugSystem.startPerformance(label),
    end: (label: string, component?: string) => debugSystem.endPerformance(label, component)
  },
  
  state: {
    set: (component: string, state: AnyData) => debugSystem.setState(component, state),
    get: (component: string) => debugSystem.getState(component)
  },
  
  api: {
    request: (method: string, url: string, data?: AnyData) => 
      debugSystem.trackApiCall(method, url, data),
    response: (callId: string, status: number, data?: AnyData, error?: Error) => 
      debugSystem.trackApiResponse(callId, status, data, error)
  }
};

export default debugSystem;