"use client";

import React from "react";
import {
  Layers,
  ChevronRight,
  Filter,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import { CategoryNode } from "@/lib/api/deviceApi";


interface CatalogSidebarProps {
  categories: CategoryNode[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  status: string;
  setStatus: (status: string) => void;
  minPrice: string;
  setMinPrice: (price: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  setPage: (page: number) => void;
  fetchDevices: () => void;
  resetFilters: () => void;
}

export default function CatalogSidebar({
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  status,
  setStatus,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  setPage,
  fetchDevices,
  resetFilters,
}: CatalogSidebarProps) {
  const renderCategoryNode = (node: CategoryNode, depth = 0) => {
    const isSelected = selectedCategoryId === node.id;
    return (
      <div key={node.id} style={{ paddingLeft: `${depth * 12}px` }}>
        <button
          onClick={() => {
            setSelectedCategoryId(node.id);
            setPage(1);
          }}
          className={`flex items-center space-x-2 w-full text-left py-1.5 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            isSelected
              ? "bg-brand-500 text-surface-0"
              : "text-text-secondary hover:bg-surface-200/50 hover:text-text-primary"
          }`}
        >
          <ChevronRight
            className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`}
          />
          <span className="truncate">{node.name}</span>
        </button>
        {node.subCategories && node.subCategories.length > 0 && (
          <div className="mt-1 space-y-1">
            {node.subCategories.map((sub) =>
              renderCategoryNode(sub, depth + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6 mb-6 lg:mb-0">
      {/* Categories Panel */}
      <div className="bg-surface-0 border border-surface-300 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-black text-text-primary uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-500" />
          <span>Asset Categories</span>
        </h3>

        <div className="space-y-1.5 max-h-72 lg:max-h-none overflow-y-auto pr-1">
          <button
            onClick={() => {
              setSelectedCategoryId("");
              setPage(1);
            }}
            className={`flex items-center space-x-2 w-full text-left py-1.5 px-3 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategoryId === ""
                ? "bg-brand-500 text-surface-0"
                : "text-text-secondary hover:bg-surface-200/50 hover:text-text-primary"
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>

          {categories.map((node) => renderCategoryNode(node, 0))}
        </div>
      </div>

      {/* Quick Controls Ledger */}
      <div className="bg-surface-0 border border-surface-300 rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center space-x-2">
            <Filter className="w-4 h-4 text-accent-500" />
            <span>Filter Parameters</span>
          </h3>
          <button
            onClick={resetFilters}
            className="text-[10px] font-bold text-brand-500 hover:text-brand-600 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Ledger</span>
          </button>
        </div>

        {/* Operational Status */}
        <div className="space-y-1.5">
          <label className="text-xxs font-bold uppercase tracking-wider text-text-secondary">
            Operational Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          >
            <option value="">Any Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_MAINTENANCE">In Maintenance</option>
            <option value="DEPLOYED">Deployed</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>

        {/* Valuation Range */}
        <div className="space-y-2">
          <label className="text-xxs font-bold uppercase tracking-wider text-text-secondary flex items-center space-x-1">
            <DollarSign className="w-3.5 h-3.5 text-accent-500" />
            <span>Valuation Limits</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min ($)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <input
              type="number"
              placeholder="Max ($)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-surface-300 bg-surface-50 text-text-primary outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          <button
            onClick={() => {
              setPage(1);
              fetchDevices();
            }}
            className="w-full bg-brand-50 text-brand-600 border border-brand-100 text-xs font-bold py-2 rounded-lg hover:bg-brand-500 hover:text-surface-0 transition-all cursor-pointer"
          >
            Apply Valuation
          </button>
        </div>
      </div>
    </aside>
  );
}
