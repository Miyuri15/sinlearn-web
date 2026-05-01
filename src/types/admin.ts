export interface ApiUsageSummary {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  retry_requests: number;
  success_rate: number;
  failure_rate: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_chars: number;
  response_chars: number;
  avg_duration_ms: number;
  max_duration_ms: number;
}

export type ApiUsageStatus = "success" | "failed" | "retry";
export type ApiUsageTrendGroup = "day" | "hour" | "month";

export interface ApiUsageFilters {
  from_date?: string;
  to_date?: string;
  provider?: string;
  service_name?: string;
  model_name?: string;
  status?: ApiUsageStatus | "";
  user_id?: string;
  session_id?: string;
}

export interface ApiUsageLog {
  id: string;
  request_id: string | null;
  provider: string | null;
  service_name: string | null;
  model_name: string | null;
  user_id: string | null;
  session_id: string | null;
  message_id: string | null;
  prompt_chars: number | null;
  response_chars: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  attempt_number: number | null;
  max_retries: number | null;
  is_retry: boolean;
  status: ApiUsageStatus | string;
  error_type: string | null;
  error_message: string | null;
  duration_ms: number | null;
  metadata_json: unknown;
  created_at: string | null;
}

export interface ApiUsageLogsResponse {
  items: ApiUsageLog[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ApiUsageGroupRow {
  request_count: number;
  success_count: number;
  failed_count: number;
  retry_count: number;
  total_tokens: number;
  avg_duration_ms: number;
}

export interface ApiUsageByService extends ApiUsageGroupRow {
  service_name: string | null;
}

export interface ApiUsageByProvider extends ApiUsageGroupRow {
  provider: string | null;
}

export interface ApiUsageTrendPoint extends ApiUsageGroupRow {
  period: string | null;
}
