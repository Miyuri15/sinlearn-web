"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Database,
  Edit3,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Users,
  X,
  Zap,
  CheckCircle,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { fetchAdminUsers, updatePricingPlan, updateUserTier } from "@/lib/api";
import {
  useCurrentUser,
  useAdminPricingPlans,
  useUserUsage,
  useAdminApiUsageSummary,
} from "@/hooks/usePricing";

import { TierBadge } from "@/components/pricing/TierBadge";
import {
  PricingPlan,
  PricingPlanUpdate,
  UserProfile,
  UserTier,
} from "@/types/pricing";

const USER_PAGE_SIZE = 10;

// --- Helper Functions ---
function userDisplayName(user: UserProfile): string {
  return user.full_name?.trim() || user.email;
}

type UsageData = NonNullable<ReturnType<typeof useUserUsage>["usage"]>;

type PlanEditorForm = {
  tier: UserTier;
  name: string;
  priceLabel: string;
  description: string;
  badge: string;
  featuresText: string;
  cta: string;
  note: string;
  learningRequestsPerHour: string;
  evaluationSessionsPerDay: string;
  evaluationsPerSession: string;
  allowEvaluationOverage: boolean;
  isPopular: boolean;
  isActive: boolean;
};

function getUsageLabel(
  usage: UsageData | null,
  loading: boolean,
  valueSelector: (currentUsage: UsageData) => string,
): string {
  if (usage) return valueSelector(usage);
  return loading ? "Loading" : "Unavailable";
}

function toPlanEditorForm(plan: PricingPlan): PlanEditorForm {
  return {
    tier: plan.tier,
    name: plan.name,
    priceLabel: plan.priceLabel,
    description: plan.description,
    badge: plan.badge,
    featuresText: plan.features.join("\n"),
    cta: plan.cta,
    note: plan.note,
    learningRequestsPerHour: String(plan.limits.learningRequestsPerHour),
    evaluationSessionsPerDay: String(plan.limits.evaluationSessionsPerDay),
    evaluationsPerSession:
      plan.limits.evaluationsPerSession === null
        ? ""
        : String(plan.limits.evaluationsPerSession),
    allowEvaluationOverage: plan.limits.allowEvaluationOverage,
    isPopular: plan.isPopular,
    isActive: plan.isActive,
  };
}

function toPricingPlanUpdate(form: PlanEditorForm): PricingPlanUpdate {
  const evaluationsPerSession = form.evaluationsPerSession.trim();

  return {
    name: form.name.trim(),
    priceLabel: form.priceLabel.trim(),
    description: form.description.trim(),
    badge: form.badge.trim(),
    features: form.featuresText
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean),
    cta: form.cta.trim(),
    note: form.note.trim(),
    limits: {
      learningRequestsPerHour: Number(form.learningRequestsPerHour),
      evaluationSessionsPerDay: Number(form.evaluationSessionsPerDay),
      evaluationsPerSession:
        evaluationsPerSession === "" ? null : Number(evaluationsPerSession),
      allowEvaluationOverage: form.allowEvaluationOverage,
    },
    isPopular: form.isPopular,
    isActive: form.isActive,
  };
}

function PlanEditModal({
  open,
  plans,
  form,
  saving,
  error,
  onClose,
  onSelectPlan,
  onChange,
  onSubmit,
}: Readonly<{
  open: boolean;
  plans: PricingPlan[];
  form: PlanEditorForm | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSelectPlan: (tier: UserTier) => void;
  onChange: (patch: Partial<PlanEditorForm>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}>) {
  if (!open || !form) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close plan editor"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                Admin Pricing
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                Edit Pricing Plan
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Changes are saved through the admin plan PATCH endpoint.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5 p-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Plan to edit
              </span>
              <select
                value={form.tier}
                onChange={(event) =>
                  onSelectPlan(event.target.value as UserTier)
                }
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                {plans.map((plan) => (
                  <option key={plan.tier} value={plan.tier}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Name"
                value={form.name}
                onChange={(name) => onChange({ name })}
              />
              <TextField
                label="Price label"
                value={form.priceLabel}
                onChange={(priceLabel) => onChange({ priceLabel })}
              />
              <TextField
                label="Badge"
                value={form.badge}
                onChange={(badge) => onChange({ badge })}
              />
              <TextField
                label="CTA"
                value={form.cta}
                onChange={(cta) => onChange({ cta })}
              />
            </div>

            <TextAreaField
              label="Description"
              value={form.description}
              rows={3}
              onChange={(description) => onChange({ description })}
            />

            <TextAreaField
              label="Features"
              helper="One feature per line."
              value={form.featuresText}
              rows={5}
              onChange={(featuresText) => onChange({ featuresText })}
            />

            <TextField
              label="Note"
              value={form.note}
              onChange={(note) => onChange({ note })}
            />

            <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
                Plan Limits
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <TextField
                  label="Learning req/hour"
                  type="number"
                  min={0}
                  value={form.learningRequestsPerHour}
                  onChange={(learningRequestsPerHour) =>
                    onChange({ learningRequestsPerHour })
                  }
                />
                <TextField
                  label="Eval sessions/day"
                  type="number"
                  min={0}
                  value={form.evaluationSessionsPerDay}
                  onChange={(evaluationSessionsPerDay) =>
                    onChange({ evaluationSessionsPerDay })
                  }
                />
                <TextField
                  label="Evaluations/session"
                  type="number"
                  min={0}
                  placeholder="Blank = unlimited"
                  value={form.evaluationsPerSession}
                  onChange={(evaluationsPerSession) =>
                    onChange({ evaluationsPerSession })
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <CheckboxField
                label="Allow overage"
                checked={form.allowEvaluationOverage}
                onChange={(allowEvaluationOverage) =>
                  onChange({ allowEvaluationOverage })
                }
              />
              <CheckboxField
                label="Mark popular"
                checked={form.isPopular}
                onChange={(isPopular) => onChange({ isPopular })}
              />
              <CheckboxField
                label="Active plan"
                checked={form.isActive}
                onChange={(isActive) => onChange({ isActive })}
              />
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  min,
  placeholder,
}: Readonly<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: number;
  placeholder?: string;
}>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>
      <input
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
      />
    </label>
  );
}

function TextAreaField({
  label,
  helper,
  value,
  rows,
  onChange,
}: Readonly<{
  label: string;
  helper?: string;
  value: string;
  rows: number;
  onChange: (value: string) => void;
}>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </span>
      {helper && <span className="ml-2 text-xs text-gray-500">{helper}</span>}
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
      />
    </label>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: Readonly<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}>) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600"
      />
      {label}
    </label>
  );
}

// --- Sub-components ---

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  color = "blue",
}: Readonly<{
  label: string;
  value: string;
  helper: string;
  icon: typeof Shield;
  color?: "blue" | "emerald" | "amber" | "purple" | "rose";
}>) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-blue-500/10",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 shadow-emerald-500/10",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 shadow-amber-500/10",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 shadow-purple-500/10",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 shadow-rose-500/10",
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-3 shadow-inner ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">{helper}</p>
      
      {/* Decorative background element */}
      <div className={`absolute -right-4 -bottom-4 h-16 w-16 opacity-[0.03] transition-transform group-hover:scale-150 ${color === 'blue' ? 'text-blue-600' : 'text-gray-600'}`}>
        <Icon className="h-full w-full" />
      </div>
    </div>
  );
}

function AdminUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [reloadTick, setReloadTick] = useState(0);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [draftTiers, setDraftTiers] = useState<
    Record<string, UserProfile["tier"]>
  >({});

  useEffect(() => {
    let isActive = true;
    async function loadUsers() {
      setUsersLoading(true);
      setUsersError(null);
      try {
        const response = await fetchAdminUsers({
          q: searchQuery || undefined,
          limit: USER_PAGE_SIZE,
          offset: page * USER_PAGE_SIZE,
        });
        if (!isActive) return;
        const nextDraftTiers: Record<string, UserProfile["tier"]> = {};
        response.items.forEach((u) => {
          nextDraftTiers[u.id] = u.tier;
        });
        setUsers(response.items);
        setTotalUsers(response.total);
        setDraftTiers(nextDraftTiers);
      } catch (error) {
        if (!isActive) return;
        setUsers([]);
        setUsersError(
          error instanceof Error ? error.message : "Failed to load users",
        );
      } finally {
        if (isActive) setUsersLoading(false);
      }
    }
    loadUsers();
    return () => {
      isActive = false;
    };
  }, [page, reloadTick, searchQuery]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearchQuery(searchInput.trim());
  }

  async function handleTierSave(userId: string) {
    const nextTier = draftTiers[userId];
    if (!nextTier) return;
    setSavingUserId(userId);
    try {
      const updatedUser = await updateUserTier(userId, nextTier);
      setUsers((current) =>
        current.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
    } catch (error) {
      setUsersError(
        error instanceof Error ? error.message : "Failed to update tier",
      );
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 inline-flex rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300">
            <Users className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            User Management
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage global user access, search accounts, and update subscription
            tiers.
          </p>
        </div>
        <button
          onClick={() => setReloadTick((c) => c + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
        >
          Search
        </button>
      </form>

      {usersError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {usersError}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900/40">
            <tr>
              <th className="px-4 py-4 font-semibold">User Details</th>
              <th className="px-4 py-4 font-semibold">Role</th>
              <th className="px-4 py-4 font-semibold">Current Tier</th>
              <th className="px-4 py-4 font-semibold">Update Tier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {usersLoading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const selectedTier = draftTiers[u.id] ?? u.tier;
                const hasChanges = selectedTier !== u.tier;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {userDisplayName(u)}
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400 capitalize">
                      {u.role ?? "user"}
                    </td>
                    <td className="px-4 py-4">
                      <TierBadge tier={u.tier} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTier}
                          onChange={(e) =>
                            setDraftTiers({
                              ...draftTiers,
                              [u.id]: e.target.value as any,
                            })
                          }
                          className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900"
                        >
                          <option value="basic">Basic</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                        <button
                          disabled={!hasChanges || savingUserId === u.id}
                          onClick={() => handleTierSave(u.id)}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                        >
                          {savingUserId === u.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing {totalUsers} results</p>
        <div className="flex gap-2">
          <button
            disabled={page === 0 || usersLoading}
            onClick={() => setPage((p) => p - 1)}
            className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            disabled={users.length < USER_PAGE_SIZE || usersLoading}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Dashboard Page ---

export default function AdminDashboard() {
  const { user, isLoading: userLoading, error: userError } = useCurrentUser();
  const {
    plans,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useAdminPricingPlans();
  const {
    summary: apiUsageSummary,
    isLoading: apiUsageLoading,
    error: apiUsageError,
  } = useAdminApiUsageSummary();
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [planEditorForm, setPlanEditorForm] = useState<PlanEditorForm | null>(
    null,
  );
  const [planEditorSaving, setPlanEditorSaving] = useState(false);
  const [planEditorError, setPlanEditorError] = useState<string | null>(null);

  if (userLoading || (!user && !userError)) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (userError || user?.role !== "admin") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        {userError
          ? "Error loading admin data."
          : "Access Denied: Admin role required."}
      </div>
    );
  }

  const availablePlans = plans?.plans ?? [];

  function openPlanEditor(plan?: PricingPlan) {
    const planToEdit = plan ?? availablePlans[0];
    if (!planToEdit) return;

    setPlanEditorForm(toPlanEditorForm(planToEdit));
    setPlanEditorError(null);
    setPlanEditorOpen(true);
  }

  function handlePlanEditorSelect(tier: UserTier) {
    const selectedPlan = availablePlans.find((plan) => plan.tier === tier);
    if (!selectedPlan) return;

    setPlanEditorForm(toPlanEditorForm(selectedPlan));
    setPlanEditorError(null);
  }

  function handlePlanEditorChange(patch: Partial<PlanEditorForm>) {
    setPlanEditorForm((current) =>
      current ? { ...current, ...patch } : current,
    );
  }

  async function handlePlanEditorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!planEditorForm) return;

    setPlanEditorSaving(true);
    setPlanEditorError(null);
    try {
      await updatePricingPlan(
        planEditorForm.tier,
        toPricingPlanUpdate(planEditorForm),
      );
      await refetchPlans({ force: true });
      setPlanEditorOpen(false);
      setPlanEditorForm(null);
    } catch (error) {
      setPlanEditorError(
        error instanceof Error
          ? error.message
          : "Failed to update pricing plan",
      );
    } finally {
      setPlanEditorSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PlanEditModal
        open={planEditorOpen}
        plans={availablePlans}
        form={planEditorForm}
        saving={planEditorSaving}
        error={planEditorError}
        onClose={() => setPlanEditorOpen(false)}
        onSelectPlan={handlePlanEditorSelect}
        onChange={handlePlanEditorChange}
        onSubmit={handlePlanEditorSubmit}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-900/40 dark:bg-blue-900/20">
        {/* Background Glow */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-400/5" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl dark:bg-blue-600/5" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-gray-900">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Authorized Access
              </p>
              <h1 className="text-2xl font-black text-blue-950 dark:text-blue-100">
                Administrator Console
              </h1>
              <p className="mt-1 text-sm font-medium text-blue-800/60 dark:text-blue-200/60">
                Management hub for {user.email}
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <TierBadge tier={user.tier} size="md" />
          </div>
        </div>
      </div>

      {/* Stats Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          System Metrics
        </h3>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View Detailed Analytics
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="API Requests"
          value={
            apiUsageLoading
              ? "..."
              : (apiUsageSummary?.total_requests ?? 0).toLocaleString()
          }
          helper="Total platform API calls"
          icon={Activity}
          color="blue"
        />

        <MetricCard
          label="Success Rate"
          value={
            apiUsageLoading ? "..." : `${apiUsageSummary?.success_rate ?? 0}%`
          }
          helper="Request success percentage"
          icon={CheckCircle}
          color="emerald"
        />

        <MetricCard
          label="Failed Requests"
          value={
            apiUsageLoading
              ? "..."
              : (apiUsageSummary?.failed_requests ?? 0).toLocaleString()
          }
          helper="API errors encountered"
          icon={AlertCircle}
          color="rose"
        />

        <MetricCard
          label="Total Tokens"
          value={
            apiUsageLoading 
              ? "..." 
              : (apiUsageSummary?.total_tokens ?? 0).toLocaleString()
          }
          helper="LLM token consumption"
          icon={Zap}
          color="amber"
        />
      </div>

      {/* Main Grid: User List (Primary) | Pricing/Info (Secondary) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Column: Primary Content */}
        <div className="space-y-6">
          <AdminUserManagement />
        </div>

        {/* Right Column: Secondary Content */}
        <div className="space-y-6">
          {/* Simplified Pricing Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-black text-gray-950 dark:text-white">
                Plan Reference
              </h3>
              <button
                type="button"
                onClick={() => openPlanEditor()}
                disabled={availablePlans.length === 0}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 disabled:text-gray-400"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Configure
              </button>
            </div>

            {plansError ? (
              <p className="text-xs text-red-500">Failed to fetch plans.</p>
            ) : (
              <div className="space-y-4">
                {plans?.plans.map((p) => (
                  <div
                    key={p.tier}
                    className="flex items-center justify-between gap-3 border-b border-gray-50 pb-3 last:border-0 dark:border-gray-700"
                  >
                    <div>
                      <p className="text-sm font-medium dark:text-white">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.limits.learningRequestsPerHour} req/hr
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TierBadge tier={p.tier} size="sm" />
                      <button
                        type="button"
                        onClick={() => openPlanEditor(p)}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tasks / Status */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 font-black text-gray-950 dark:text-white">
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-gray-600 dark:text-gray-400">
                  User API connection active
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-gray-600 dark:text-gray-400">
                  3 users pending verification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
