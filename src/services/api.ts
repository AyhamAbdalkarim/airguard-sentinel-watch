
const API_BASE_URL = 'http://localhost:5000';

export interface SystemStatus {
  is_monitoring: boolean;
  packets_captured: number;
  threat_alerts: number;
  suspicious_ips: number;
  uptime: number;
}

export interface ThreatAlert {
  timestamp: number;
  threat_type: string;
  severity: string;
  source_ip: string;
  description: string;
  confidence: number;
}

export const apiService = {
  async getStatus(): Promise<SystemStatus> {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    if (!response.ok) {
      throw new Error('Failed to fetch status');
    }
    return response.json();
  },

  async getAlerts(): Promise<ThreatAlert[]> {
    const response = await fetch(`${API_BASE_URL}/api/alerts`);
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }
    return response.json();
  },

  async startMonitoring(): Promise<{ status: string; is_monitoring: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/start_monitoring`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to start monitoring');
    }
    return response.json();
  },

  async stopMonitoring(): Promise<{ status: string; is_monitoring: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/stop_monitoring`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to stop monitoring');
    }
    return response.json();
  },
};
