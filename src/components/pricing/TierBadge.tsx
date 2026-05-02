/**
 * Tier Badge Component
 * Displays the user's current pricing tier
 */

"use client";

import React from "react";
import { Check, Crown, Rocket, Star } from "lucide-react";
import { UserTier } from "@/types/pricing";
import { PRICING_TIERS } from "@/lib/constants";

interface TierBadgeProps {
  tier: UserTier;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

const tierColors = {
  basic: "bg-blue-100 text-blue-800 border-blue-300",
  intermediate: "bg-purple-100 text-purple-800 border-purple-300",
  enterprise: "bg-amber-100 text-amber-800 border-amber-300",
};

const tierIcons = {
  basic: Rocket,
  intermediate: Star,
  enterprise: Crown,
};

export function TierBadge({
  tier,
  showName = true,
  size = "md",
  className = "",
}: TierBadgeProps) {
  const tierInfo = PRICING_TIERS[tier];
  const Icon = tierIcons[tier];

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-semibold ${sizeClasses[size]} ${tierColors[tier]} ${className}`}
      aria-label={`${tierInfo.name} plan`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {showName ? tierInfo.badge : tier}
    </span>
  );
}

/**
 * Tier Card Component
 * Displays a pricing tier with features and CTA
 */

interface TierCardProps {
  tier: UserTier;
  isCurrentTier?: boolean;
  onSelect?: (tier: UserTier) => void;
  priceLabel?: string;
}

export function TierCard({
  tier,
  isCurrentTier = false,
  onSelect,
  priceLabel,
}: TierCardProps) {
  const tierInfo = PRICING_TIERS[tier];
  const Icon = tierIcons[tier];

  return (
    <div
      className={`border-2 rounded-lg p-6 ${
        isCurrentTier
          ? "border-green-500 bg-green-50"
          : "border-gray-200 hover:border-gray-300"
      } ${tierInfo.color}`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">{tierInfo.name}</h3>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-sm text-gray-600">{tierInfo.description}</p>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-900">
          {priceLabel || (tier === "basic" ? "Free" : "Contact us")}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
          Features
        </p>
        <ul className="space-y-2">
          {tierInfo.features.map((feature) => (
            <li key={feature} className="text-sm flex items-start gap-2">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                aria-hidden="true"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {isCurrentTier && (
        <button
          disabled
          className="w-full py-2 bg-green-600 text-white rounded font-semibold"
        >
          Current Plan
        </button>
      )}
      {!isCurrentTier && onSelect && (
        <button
          onClick={() => onSelect(tier)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
        >
          {tier === "basic" ? "Downgrade" : "Upgrade"}
        </button>
      )}
    </div>
  );
}
