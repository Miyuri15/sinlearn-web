// src/lib/models/xai.ts

export interface ChunkContribution {
  rank: number;
  chunk_id: string;
  similarity_score: number;
  contribution_score: number;
  preview: string;
  key_terms: string[];
}

export interface SafetyDetail {
  type: "flagged_sentence" | "missing_concepts" | "extra_concepts";
  sentence?: string;
  severity?: "low" | "medium" | "high";
  unseen_ratio?: number;
  concepts?: string[];
  explanation: string;
}

export interface SafetyExplanation {
  has_issues: boolean;
  flagged_count: number;
  missing_concepts_count: number;
  extra_concepts_count: number;
  details: SafetyDetail[];
}

export interface ConfidenceComponent {
  name: string;
  score: number;
  weight: number;
}

export interface ConfidenceBreakdown {
  overall: number;
  components: ConfidenceComponent[];
}

export interface SourcePreview {
  chunk_rank: number;
  preview: string;
}

export interface ConceptDetail {
  concept: string;
  found_in_sources: boolean;
  source_count: number;
  sources: SourcePreview[];
}

export interface ConceptTracing {
  total_concepts: number;
  concepts_with_sources: number;
  concept_details: ConceptDetail[];
}

export interface RetrievalStats {
  bm25_k?: number;
  final_k?: number;
  used_chunks?: number;
  [key: string]: any;
}

export interface XAIExplanation {
  chunk_contributions: ChunkContribution[];
  safety_explanation?: SafetyExplanation;
  confidence_breakdown: ConfidenceBreakdown;
  concept_tracing: ConceptTracing;
  retrieval_stats: RetrievalStats;
  explanation_summary: string;
}
