"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Database,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { fetchAdminUsers, updateUserTier } from "@/lib/api";
import {
  useCurrentUser,
  usePricingPlans,
  useUserUsage,
} from "@/hooks/usePricing";
import { TierBadge } from "@/components/pricing/TierBadge";
import { UserProfile } from "@/types/pricing";

const USER_PAGE_SIZE = 10;

// --- Helper Functions ---
function userDisplayName(user: UserProfile): string {
  return user.full_name?.trim() || user.email;
}

type UsageData = NonNullable<ReturnType<typeof useUserUsage>["usage"]>;

function getUsageLabel(
  usage: UsageData | null,
  loading: boolean,
  valueSelector: (currentUsage: UsageData) => string,
): string {
  if (usage) return valueSelector(usage);
  return loading ? "Loading" : "Unavailable";
}

// --- Sub-components ---

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: Readonly<{
  label: string;
  value: string;
  helper: string;
  icon: typeof Shield;
}>) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{helper}</p>
    </div>
  );
}

function AdminUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
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
        response.forEach((u) => {
          nextDraftTiers[u.id] = u.tier;
        });
        setUsers(response);
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
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

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
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
        <p className="text-sm text-gray-500">Showing {users.length} results</p>
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
  } = usePricingPlans();
  const { usage, isLoading: usageLoading } = useUserUsage();

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

  const currentUsageLabel = getUsageLabel(
    usage,
    usageLoading,
    (u) => `${u.currentHour.learningRequests}/${u.currentHour.limit}`,
  );
  const evaluationUsageLabel = getUsageLabel(
    usage,
    usageLoading,
    (u) => `${u.today.evaluationSessions}/${u.today.limit}`,
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="font-bold text-blue-950 dark:text-blue-100">
                Administrator Console
              </h1>
              <p className="text-sm text-blue-800/80 dark:text-blue-200/80">
                Logged in as {user.email}
              </p>
            </div>
          </div>
          <TierBadge tier={user.tier} size="md" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="System Plans"
          value={plansLoading ? "..." : String(plans?.plans.length ?? 0)}
          helper="Configured tiers in backend"
          icon={Database}
        />
        <MetricCard
          label="Admin Learning"
          value={currentUsageLabel}
          helper="Requests used this hour"
          icon={BarChart3}
        />
        <MetricCard
          label="Admin Sessions"
          value={evaluationUsageLabel}
          helper="Sessions used today"
          icon={Clock}
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
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Plan Reference
              </h3>
              <Link
                href="/settings/plan"
                className="text-xs text-blue-600 hover:underline"
              >
                Edit Plans
              </Link>
            </div>

            {plansError ? (
              <p className="text-xs text-red-500">Failed to fetch plans.</p>
            ) : (
              <div className="space-y-4">
                {plans?.plans.map((p) => (
                  <div
                    key={p.tier}
                    className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 dark:border-gray-700"
                  >
                    <div>
                      <p className="text-sm font-medium dark:text-white">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.limits.learningRequestsPerHour} req/hr
                      </p>
                    </div>
                    <TierBadge tier={p.tier} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tasks / Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 font-bold text-gray-900 dark:text-white">
              System Logs
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
