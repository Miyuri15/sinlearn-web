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
