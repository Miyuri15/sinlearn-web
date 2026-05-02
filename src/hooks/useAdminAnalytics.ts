import { useState, useEffect, useCallback } from "react";
import {
  ApiUsageFilters,
  ApiUsageLogsResponse,
  ApiUsageTrendPoint,
  ApiUsageByService,
  ApiUsageByProvider,
  ApiUsageTrendGroup,
} from "@/types/admin";
import {
  fetchAdminApiUsageLogs,
  fetchAdminApiUsageTrend,
  fetchAdminApiUsageByService,
  fetchAdminApiUsageByProvider,
} from "@/lib/api";

export function useAdminApiUsageLogs(filters: ApiUsageFilters & { page?: number; page_size?: number } = {}) {
  const [data, setData] = useState<ApiUsageLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminApiUsageLogs(filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch logs"));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useAdminApiUsageTrend(filters: ApiUsageFilters & { group_by?: ApiUsageTrendGroup } = {}) {
  const [data, setData] = useState<ApiUsageTrendPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminApiUsageTrend(filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch trend"));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useAdminApiUsageByService(filters: Pick<ApiUsageFilters, "from_date" | "to_date" | "provider" | "model_name"> = {}) {
  const [data, setData] = useState<ApiUsageByService[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminApiUsageByService(filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch service usage"));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useAdminApiUsageByProvider(filters: Pick<ApiUsageFilters, "from_date" | "to_date" | "service_name" | "model_name"> = {}) {
  const [data, setData] = useState<ApiUsageByProvider[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminApiUsageByProvider(filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch provider usage"));
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
