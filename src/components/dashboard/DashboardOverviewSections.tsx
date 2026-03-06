import { useMemo } from "react";
import type {
  DashboardToday,
  DashboardFinancial,
  DashboardInventory,
  DashboardTrends,
} from "../../redux/services/dashboard";
import OverviewMetricCard from "./OverviewMetricCard";
import LineChartOne from "../charts/line/LineChartOne";
import BarChartOne from "../charts/bar/BarChartOne";
import { formatAmount, formatCount } from "../../helper/formatNumber";
import { formatChartDate } from "../../helper/formatDate";
import {
  TrendingUp,
  Wallet,
  Wrench,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  AlertTriangle,
  PackageX,
} from "lucide-react";

function getSortedDates(trends: DashboardTrends): string[] {
  const set = new Set<string>();
  trends.sales.forEach((p) => set.add(p.date));
  trends.purchases.forEach((p) => set.add(p.date));
  trends.repairs.forEach((p) => set.add(p.date));
  return Array.from(set).sort();
}

function DashboardTrendsChartsSection({ trends }: { trends: DashboardTrends }) {
  const { categories, lineSeries, barSeries } = useMemo(() => {
    const dates = getSortedDates(trends);
    const categories = dates.map(formatChartDate);
    const salesMap = new Map(trends.sales.map((p) => [p.date, p.amount ?? 0]));
    const purchasesMap = new Map(trends.purchases.map((p) => [p.date, p.amount ?? 0]));
    const repairsMap = new Map(trends.repairs.map((p) => [p.date, p.count ?? 0]));
    const lineSeries = [
      { name: "Sales", data: dates.map((d) => salesMap.get(d) ?? 0) },
      { name: "Purchases", data: dates.map((d) => purchasesMap.get(d) ?? 0) },
    ];
    const barSeries = [{ name: "Repairs", data: dates.map((d) => repairsMap.get(d) ?? 0) }];
    return { categories, lineSeries, barSeries };
  }, [trends]);

  const hasData = categories.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No trend data for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 max-w-full overflow-x-auto custom-scrollbar">
        <div id="chartDashboardLine" className="min-w-[320px] xl:min-w-full">
          <LineChartOne categories={categories} series={lineSeries} />
        </div>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div id="chartDashboardBar" className="min-w-[320px] xl:min-w-full">
          <BarChartOne categories={categories} series={barSeries} />
        </div>
      </div>
    </div>
  );
}

interface DashboardOverviewSectionsProps {
  today: DashboardToday;
  financial: DashboardFinancial;
  inventory: DashboardInventory;
  trends: DashboardTrends;
  /** Number of days used for trends (for heading). */
  trendsDays?: number;
}

export default function DashboardOverviewSections({
  today,
  financial,
  inventory,
  trends,
  trendsDays,
}: DashboardOverviewSectionsProps) {
  return (
    <div className="grid grid-cols-12 gap-6 md:gap-8">
      {/* Today */}
      <section
        className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm md:p-6"
        aria-labelledby="today-heading"
      >
        <h2 id="today-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <OverviewMetricCard
            title="Sales"
            value={formatAmount(today.sales.amount)}
            subtitle={`${formatCount(today.sales.count)} transactions`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="success"
          />
          <OverviewMetricCard
            title="Cash collected"
            value={formatAmount(today.cashCollected.amount)}
            icon={<Wallet className="w-5 h-5" />}
            variant="default"
          />
          <OverviewMetricCard
            title="Repairs completed"
            value={formatCount(today.repairsCompleted.count)}
            icon={<Wrench className="w-5 h-5" />}
            variant="muted"
          />
        </div>
      </section>

      {/* Financial */}
      <section
        className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm md:p-6"
        aria-labelledby="financial-heading"
      >
        <h2 id="financial-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Financial
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <OverviewMetricCard
            title="Cash in hand"
            value={formatAmount(financial.cashInHand.amount)}
            subtitle={
              financial.cashInHand.accounts.length > 0
                ? `${financial.cashInHand.accounts.length} account(s)`
                : undefined
            }
            icon={<Wallet className="w-5 h-5" />}
            variant="success"
          />
          <OverviewMetricCard
            title="Bank balance"
            value={formatAmount(financial.bankBalance.amount)}
            icon={<Banknote className="w-5 h-5" />}
            variant="default"
          />
          <OverviewMetricCard
            title="Receivable"
            value={formatAmount(financial.receivable.amount)}
            subtitle={
              financial.receivable.customerCount > 0
                ? `${formatCount(financial.receivable.customerCount)} customer(s)`
                : undefined
            }
            icon={<ArrowUpRight className="w-5 h-5" />}
            variant="warning"
          />
          <OverviewMetricCard
            title="Payable"
            value={formatAmount(financial.payable.amount)}
            subtitle={
              financial.payable.supplierCount > 0
                ? `${formatCount(financial.payable.supplierCount)} supplier(s)`
                : undefined
            }
            icon={<ArrowDownRight className="w-5 h-5" />}
            variant="error"
          />
          <OverviewMetricCard
            title="Net position"
            value={formatAmount(financial.netPosition.amount)}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="success"
          />
        </div>
      </section>

      {/* Inventory */}
      <section
        className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm md:p-6"
        aria-labelledby="inventory-heading"
      >
        <h2 id="inventory-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Inventory
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewMetricCard
            title="Total value"
            value={formatAmount(inventory.totalValue.amount)}
            icon={<Package className="w-5 h-5" />}
            variant="default"
          />
          <OverviewMetricCard
            title="Low stock"
            value={formatCount(inventory.lowStock.count)}
            subtitle={
              inventory.lowStock.items.length > 0
                ? inventory.lowStock.items.slice(0, 2).map((i) => i.name).join(", ")
                : undefined
            }
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="warning"
          />
          <OverviewMetricCard
            title="Out of stock"
            value={formatCount(inventory.outOfStock.count)}
            subtitle={
              inventory.outOfStock.items.length > 0
                ? inventory.outOfStock.items.slice(0, 2).map((i) => i.name).join(", ")
                : undefined
            }
            icon={<PackageX className="w-5 h-5" />}
            variant="error"
          />
          <OverviewMetricCard
            title="In production"
            value={`${formatCount(inventory.inProduction.batchCount)} batch(es), ${formatCount(inventory.inProduction.unitCount)} unit(s)`}
            icon={<Wrench className="w-5 h-5" />}
            variant="muted"
          />
        </div>
      </section>

      {/* Trends – using project LineChartOne & BarChartOne */}
      <section
        className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm md:p-6"
        aria-labelledby="trends-heading"
      >
        <h2 id="trends-heading" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Trends{trendsDays != null ? ` (last ${trendsDays} days)` : ""}
        </h2>
        <DashboardTrendsChartsSection trends={trends} />
      </section>
    </div>
  );
}
