import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

export type ScenarioType =
  | "success"
  | "validation_error"
  | "system_error"
  | "slow_request"
  | "teapot";

export interface RunScenarioPayload {
  type: ScenarioType;
  name?: string;
}

export interface ScenarioRun {
  id: string;
  type: string;
  status: string;
  duration: number | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RunScenarioResult {
  id: string;
  status: string;
  duration: number;
  signal?: number;
  message?: string;
}

export const scenariosApi = {
  run: async (payload: RunScenarioPayload): Promise<RunScenarioResult> => {
    const response = await api.post<RunScenarioResult>("/scenarios/run", payload);
    return response.data;
  },

  getRecent: async (limit = 20): Promise<ScenarioRun[]> => {
    const response = await api.get<ScenarioRun[]>(`/scenarios?limit=${limit}`);
    return response.data;
  },

  getHealth: async () => {
    const response = await api.get("/health");
    return response.data;
  },
};
