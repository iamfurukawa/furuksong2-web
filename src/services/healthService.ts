import { request } from './api';

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime?: number;
  version?: string;
  database?: {
    status: string;
    connected: boolean;
  };
}

export const healthService = {
  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const response = await request.get<HealthStatus>('/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching health status:', error);
      throw error;
    }
  }
};
