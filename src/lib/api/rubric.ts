import { apiFetch } from "./client";
import { API_BASE_URL } from "../config";

export type RubricCriterion = {
  id: string;
  rubric_id: string;
  criterion: string;
  weight_percentage: number;
  created_at: string;
};

export type Rubric = {
  id: string;
  name: string;
  description: string;
  rubric_type: "system" | "custom";
  created_by: string | null;
  created_at: string;
  criteria: RubricCriterion[];
};

export type CreateRubricPayload = {
  name: string;
  description?: string;
  criteria: Array<{
    criterion: string;
    weight_percentage: number;
  }>;
};

export const listRubricsWithCriteria = () => {
  return apiFetch<Rubric[]>(`${API_BASE_URL}/api/v1/rubrics/with-criteria`);
};

export const createCustomRubric = (payload: CreateRubricPayload) => {
  return apiFetch<Rubric>(`${API_BASE_URL}/api/v1/rubrics/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
