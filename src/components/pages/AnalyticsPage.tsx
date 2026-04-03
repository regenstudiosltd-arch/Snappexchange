// src/app/components/pages/AnalyticsPage.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Skeleton } from '../ui/skeleton';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { authService } from '@/src/services/auth.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsStats {
  total_savings: number;
  monthly_growth: number;
  monthly_growth_percentage: number;
  active_groups: number;
  goals_progress: number;
}

interface SavingsOverTimeItem {
  month: string;
  amount: number;
  contributions: number;
}

interface SavingsDistributionItem {
  name: string;
  value: number;
}

interface GroupPerformanceItem {
  name: string;
  savings: number;
  members: number;
}

interface InsightOrRecommendation {
  title: string;
  description: string;
}

interface AnalyticsData {
  stats: AnalyticsStats;
  savings_over_time: SavingsOverTimeItem[];
  savings_distribution: SavingsDistributionItem[];
  group_performance: GroupPerformanceItem[];
  key_insights: InsightOrRecommendation[];
  recommendations: InsightOrRecommendation[];
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const fallbackSavingsOverTime: SavingsOverTimeItem[] = [
  { month: 'Jul', amount: 2400, contributions: 500 },
  { month: 'Aug', amount: 3200, contributions: 800 },
  { month: 'Sep', amount: 4100, contributions: 900 },
  { month: 'Oct', amount: 5500, contributions: 1400 },
  { month: 'Nov', amount: 6800, contributions: 1300 },
  { month: 'Dec', amount: 8200, contributions: 1400 },
];

const fallbackSavingsDistribution: SavingsDistributionItem[] = [
  { name: 'Emergency Fund', value: 3200 },
  { name: 'Goals', value: 2800 },
  { name: 'Group Savings', value: 2200 },
];

const fallbackGroupPerformance: GroupPerformanceItem[] = [
  { name: 'University Friends', savings: 24500, members: 12 },
  { name: 'Family Circle', savings: 18200, members: 8 },
  { name: 'Startup Capital', savings: 12800, members: 5 },
  { name: 'Vacation Fund', savings: 8900, members: 6 },
];

const fallbackKeyInsights: InsightOrRecommendation[] = [
  {
    title: 'Strong Savings Momentum',
    description: "You've increased your savings by 15.3% in the last 6 months",
  },
  {
    title: 'Consistent Contributions',
    description: 'Your monthly contributions average GHS 1,283',
  },
  {
    title: 'Top Performing Group',
    description: '"University Friends" has the highest total savings',
  },
];

const fallbackRecommendations: InsightOrRecommendation[] = [
  {
    title: 'Boost Emergency Fund',
    description:
      'Consider increasing your emergency fund to 6 months of expenses',
  },
  {
    title: 'Diversify Savings',
    description: 'Join more groups to diversify your savings portfolio',
  },
  {
    title: 'Set New Goals',
    description: "You're on track! Consider setting new financial goals",
  },
];

// ─── Skeleton primitives ──────────────────────────────────────────────────────

/**
 * Simulates a chart area: a set of vertical bars of varying heights sitting on
 * a baseline, giving the silhouette of a real bar / line chart.
 */
function ChartBars({ count = 6 }: { count?: number }) {
  // Pre-defined heights so the skeleton looks natural, not uniform
  const heights = [40, 65, 55, 80, 70, 90, 60, 75];
  return (
    <div className="flex items-end justify-around w-full h-full gap-1 px-2 pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-sm"
          style={{ height: `${heights[i % heights.length]}%` }}
        />
      ))}
    </div>
  );
}

/** Fake axis labels row — sits below ChartBars. */
function ChartAxisLabels({ count = 6 }: { count?: number }) {
  return (
    <div className="flex justify-around w-full px-2 mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-6 rounded" />
      ))}
    </div>
  );
}

// ─── Per-section skeletons ────────────────────────────────────────────────────

/**
 * Page header skeleton.
 * Matches: title + description on the left, Select trigger on the right.
 */
function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <Skeleton className="h-9 w-36 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>
      {/* Select trigger — fixed width w-44 in the real component */}
      <Skeleton className="h-10 w-44 rounded-md" />
    </div>
  );
}

/**
 * Stats grid skeleton (4 cards).
 * Matches StatsCard: title row with icon → large value → arrow + change text.
 */
function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            {/* Large value */}
            <Skeleton className="h-8 w-28 rounded mb-2" />
            {/* Arrow + change text */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * SavingsGrowthChart skeleton.
 * Matches: card → header (title + description) → 300px chart area with a
 * simulated line chart (rising bars) → XAxis labels.
 */
function SavingsGrowthChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 rounded mb-1" />
        <Skeleton className="h-4 w-48 rounded" />
      </CardHeader>
      <CardContent>
        {/* Chart area — same h-[300px] as ResponsiveContainer */}
        <div className="h-75 flex flex-col">
          {/* Y-axis labels on the left */}
          <div className="flex flex-1 gap-2">
            <div className="flex flex-col justify-between py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-8 rounded" />
              ))}
            </div>
            <div className="flex-1 flex flex-col">
              <ChartBars count={6} />
            </div>
          </div>
          <ChartAxisLabels count={6} />
        </div>
        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-28 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SavingsDistributionChart skeleton.
 * Matches: card → header → 300px donut placeholder → 3-row legend list.
 */
function SavingsDistributionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36 rounded mb-1" />
        <Skeleton className="h-4 w-40 rounded" />
      </CardHeader>
      <CardContent>
        {/* Donut / pie placeholder */}
        <div className="h-75 flex items-center justify-center">
          <div className="relative w-40 h-40">
            {/* Outer ring */}
            <Skeleton className="absolute inset-0 rounded-full" />
            {/* Inner cutout to simulate donut */}
            <div className="absolute inset-6 rounded-full bg-card" />
          </div>
        </div>
        {/* Legend list — 3 rows matching fallbackSavingsDistribution */}
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * GroupPerformanceChart skeleton (full-width).
 * Matches: card → header → 300px bar chart with 4 groups → XAxis labels.
 */
function GroupPerformanceChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36 rounded mb-1" />
        <Skeleton className="h-4 w-28 rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-75 flex flex-col">
          <div className="flex flex-1 gap-2">
            <div className="flex flex-col justify-between py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-8 rounded" />
              ))}
            </div>
            {/* 4 group pairs of bars */}
            <div className="flex-1 flex items-end justify-around gap-3 pb-2">
              {Array.from({ length: 4 }).map((_, i) => {
                const heights = [90, 68, 48, 34];
                return (
                  <div
                    key={i}
                    className="flex-1 flex items-end gap-1"
                    style={{ height: '100%' }}
                  >
                    <Skeleton
                      className="flex-1 rounded-sm"
                      style={{ height: `${heights[i]}%` }}
                    />
                    <Skeleton
                      className="flex-1 rounded-sm"
                      style={{ height: `${heights[i] * 0.3}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {/* X-axis group labels */}
          <div className="flex justify-around px-10 mt-2">
            {[52, 36, 44, 40].map((w, i) => (
              <Skeleton
                key={i}
                className={`h-3 w-${w === 52 ? '14' : w === 36 ? '10' : w === 44 ? '12' : '10'} rounded`}
              />
            ))}
          </div>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightsCardSkeleton() {
  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-28 rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            {/* Bullet dot */}
            <Skeleton className="mt-1.5 h-2 w-2 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Full-page composed skeleton */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 mb-20 md:mb-0 animate-pulse">
      <HeaderSkeleton />
      <StatsGridSkeleton />
      <div className="grid gap-4 md:grid-cols-2">
        <SavingsGrowthChartSkeleton />
        <SavingsDistributionChartSkeleton />
      </div>
      <GroupPerformanceChartSkeleton />
      <div className="grid gap-6 md:grid-cols-2">
        <InsightsCardSkeleton />
        <InsightsCardSkeleton />
      </div>
    </div>
  );
}

// ─── Sub-components

function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: 'up';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl mb-1">{value}</div>
        <div className="flex items-center text-xs text-green-600">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          {change} from last period
        </div>
      </CardContent>
    </Card>
  );
}

function SavingsGrowthChart({ data }: { data: SavingsOverTimeItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Growth</CardTitle>
        <CardDescription>Your total savings over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#0891B2"
              strokeWidth={2}
              name="Total Savings"
            />
            <Line
              type="monotone"
              dataKey="contributions"
              stroke="#22D3EE"
              strokeWidth={2}
              name="Monthly Contribution"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function SavingsDistributionChart({
  data,
}: {
  data: SavingsDistributionItem[];
}) {
  const distributionWithColors = useMemo(() => {
    const colors = ['#0891B2', '#22D3EE', '#06B6D4'];
    return data.map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Distribution</CardTitle>
        <CardDescription>Breakdown by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={distributionWithColors}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent = 0 }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              dataKey="value"
            >
              {distributionWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          {distributionWithColors.map((category) => (
            <div
              key={category.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
              </div>
              <span className="font-semibold">
                GHS {category.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GroupPerformanceChart({ data }: { data: GroupPerformanceItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Performance</CardTitle>
        <CardDescription>Savings by group</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="savings" fill="#0891B2" name="Total Savings (GHS)" />
            <Bar dataKey="members" fill="#22D3EE" name="Members" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function InsightsCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: InsightOrRecommendation[];
}) {
  return (
    <Card className="bg-muted/30 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main component

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timeRange],
    queryFn: () => authService.analytics(timeRange),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const stats: AnalyticsStats = useMemo(
    () =>
      analytics?.stats ?? {
        total_savings: 8200,
        monthly_growth: 1400,
        monthly_growth_percentage: 8.2,
        active_groups: 4,
        goals_progress: 67,
      },
    [analytics],
  );

  const savingsOverTime = useMemo(
    () => analytics?.savings_over_time ?? fallbackSavingsOverTime,
    [analytics],
  );

  const savingsDistribution = useMemo(
    () => analytics?.savings_distribution ?? fallbackSavingsDistribution,
    [analytics],
  );

  const groupPerformance = useMemo(
    () => analytics?.group_performance ?? fallbackGroupPerformance,
    [analytics],
  );

  const keyInsights = useMemo(
    () => analytics?.key_insights ?? fallbackKeyInsights,
    [analytics],
  );

  const recommendations = useMemo(
    () => analytics?.recommendations ?? fallbackRecommendations,
    [analytics],
  );

  const statsCards = useMemo(
    () => [
      {
        title: 'Total Savings',
        value: `GHS ${Number(stats.total_savings).toLocaleString()}`,
        change: `+${stats.monthly_growth_percentage}%`,
        trend: 'up' as const,
        icon: DollarSign,
        color: 'text-green-600',
      },
      {
        title: 'Monthly Growth',
        value: `GHS ${Number(stats.monthly_growth).toLocaleString()}`,
        change: `+${stats.monthly_growth_percentage}%`,
        trend: 'up' as const,
        icon: TrendingUp,
        color: 'text-green-600',
      },
      {
        title: 'Active Groups',
        value: stats.active_groups.toString(),
        change: '+1',
        trend: 'up' as const,
        icon: Users,
        color: 'text-cyan-600',
      },
      {
        title: 'Goals Progress',
        value: `${stats.goals_progress}%`,
        change: '+12%',
        trend: 'up' as const,
        icon: Target,
        color: 'text-cyan-600',
      },
    ],
    [stats],
  );

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6 mb-20 md:mb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Analytics</h1>
          <p className="text-muted-foreground">
            Track your savings performance and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <SavingsGrowthChart data={savingsOverTime} />
        <SavingsDistributionChart data={savingsDistribution} />
      </div>

      {/* Group Performance */}
      <GroupPerformanceChart data={groupPerformance} />

      {/* Insights & Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <InsightsCard
          title="Key Insights"
          icon={TrendingUp}
          items={keyInsights}
        />
        <InsightsCard
          title="Recommendations"
          icon={Target}
          items={recommendations}
        />
      </div>
    </div>
  );
}

// // src/app/components/pages/AnalyticsPage.tsx
// 'use client';

// import { useState, useMemo } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import {
//   TrendingUp,
//   DollarSign,
//   Users,
//   Target,
//   ArrowUpRight,
// } from 'lucide-react';

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../ui/select';

// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';

// import { authService } from '@/src/services/auth.service';

// // -----------------------------------------------------------------------------
// // Types (extracted & reusable)
// interface AnalyticsStats {
//   total_savings: number;
//   monthly_growth: number;
//   monthly_growth_percentage: number;
//   active_groups: number;
//   goals_progress: number;
// }

// interface SavingsOverTimeItem {
//   month: string;
//   amount: number;
//   contributions: number;
// }

// interface SavingsDistributionItem {
//   name: string;
//   value: number;
// }

// interface GroupPerformanceItem {
//   name: string;
//   savings: number;
//   members: number;
// }

// interface InsightOrRecommendation {
//   title: string;
//   description: string;
// }

// interface AnalyticsData {
//   stats: AnalyticsStats;
//   savings_over_time: SavingsOverTimeItem[];
//   savings_distribution: SavingsDistributionItem[];
//   group_performance: GroupPerformanceItem[];
//   key_insights: InsightOrRecommendation[];
//   recommendations: InsightOrRecommendation[];
// }

// // -----------------------------------------------------------------------------
// // Fallback data (unchanged)
// const fallbackSavingsOverTime: SavingsOverTimeItem[] = [
//   { month: 'Jul', amount: 2400, contributions: 500 },
//   { month: 'Aug', amount: 3200, contributions: 800 },
//   { month: 'Sep', amount: 4100, contributions: 900 },
//   { month: 'Oct', amount: 5500, contributions: 1400 },
//   { month: 'Nov', amount: 6800, contributions: 1300 },
//   { month: 'Dec', amount: 8200, contributions: 1400 },
// ];

// const fallbackSavingsDistribution: SavingsDistributionItem[] = [
//   { name: 'Emergency Fund', value: 3200 },
//   { name: 'Goals', value: 2800 },
//   { name: 'Group Savings', value: 2200 },
// ];

// const fallbackGroupPerformance: GroupPerformanceItem[] = [
//   { name: 'University Friends', savings: 24500, members: 12 },
//   { name: 'Family Circle', savings: 18200, members: 8 },
//   { name: 'Startup Capital', savings: 12800, members: 5 },
//   { name: 'Vacation Fund', savings: 8900, members: 6 },
// ];

// const fallbackKeyInsights: InsightOrRecommendation[] = [
//   {
//     title: 'Strong Savings Momentum',
//     description: "You've increased your savings by 15.3% in the last 6 months",
//   },
//   {
//     title: 'Consistent Contributions',
//     description: 'Your monthly contributions average GHS 1,283',
//   },
//   {
//     title: 'Top Performing Group',
//     description: '"University Friends" has the highest total savings',
//   },
// ];

// const fallbackRecommendations: InsightOrRecommendation[] = [
//   {
//     title: 'Boost Emergency Fund',
//     description:
//       'Consider increasing your emergency fund to 6 months of expenses',
//   },
//   {
//     title: 'Diversify Savings',
//     description: 'Join more groups to diversify your savings portfolio',
//   },
//   {
//     title: 'Set New Goals',
//     description: "You're on track! Consider setting new financial goals",
//   },
// ];

// // -----------------------------------------------------------------------------
// // Reusable sub-components (unchanged from previous version)

// function StatsCard({
//   title,
//   value,
//   change,
//   icon: Icon,
//   color,
// }: {
//   title: string;
//   value: string;
//   change: string;
//   trend: 'up';
//   icon: React.ComponentType<{ className?: string }>;
//   color: string;
// }) {
//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm">{title}</CardTitle>
//         <Icon className={`h-4 w-4 ${color}`} />
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl mb-1">{value}</div>
//         <div className="flex items-center text-xs text-green-600">
//           <ArrowUpRight className="h-3 w-3 mr-1" />
//           {change} from last period
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function SavingsGrowthChart({ data }: { data: SavingsOverTimeItem[] }) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Savings Growth</CardTitle>
//         <CardDescription>Your total savings over time</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Line
//               type="monotone"
//               dataKey="amount"
//               stroke="#0891B2"
//               strokeWidth={2}
//               name="Total Savings"
//             />
//             <Line
//               type="monotone"
//               dataKey="contributions"
//               stroke="#22D3EE"
//               strokeWidth={2}
//               name="Monthly Contribution"
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }

// function SavingsDistributionChart({
//   data,
// }: {
//   data: SavingsDistributionItem[];
// }) {
//   const distributionWithColors = useMemo(() => {
//     const colors = ['#0891B2', '#22D3EE', '#06B6D4'];
//     return data.map((item, index) => ({
//       ...item,
//       color: colors[index % colors.length],
//     }));
//   }, [data]);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Savings Distribution</CardTitle>
//         <CardDescription>Breakdown by category</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ResponsiveContainer width="100%" height={300}>
//           <PieChart>
//             <Pie
//               data={distributionWithColors}
//               cx="50%"
//               cy="50%"
//               labelLine={false}
//               label={({ name, percent = 0 }) =>
//                 `${name}: ${(percent * 100).toFixed(0)}%`
//               }
//               outerRadius={80}
//               dataKey="value"
//             >
//               {distributionWithColors.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={entry.color} />
//               ))}
//             </Pie>
//             <Tooltip />
//           </PieChart>
//         </ResponsiveContainer>

//         <div className="mt-4 space-y-2">
//           {distributionWithColors.map((category) => (
//             <div
//               key={category.name}
//               className="flex items-center justify-between text-sm"
//             >
//               <div className="flex items-center gap-2">
//                 <div
//                   className="w-3 h-3 rounded-full"
//                   style={{ backgroundColor: category.color }}
//                 />
//                 <span>{category.name}</span>
//               </div>
//               <span className="font-semibold">
//                 GHS {category.value.toLocaleString()}
//               </span>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// function GroupPerformanceChart({ data }: { data: GroupPerformanceItem[] }) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Group Performance</CardTitle>
//         <CardDescription>Savings by group</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ResponsiveContainer width="100%" height={300}>
//           <BarChart data={data}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="savings" fill="#0891B2" name="Total Savings (GHS)" />
//             <Bar dataKey="members" fill="#22D3EE" name="Members" />
//           </BarChart>
//         </ResponsiveContainer>
//       </CardContent>
//     </Card>
//   );
// }

// function InsightsCard({
//   title,
//   icon: Icon,
//   items,
// }: {
//   title: string;
//   icon: React.ComponentType<{ className?: string }>;
//   items: InsightOrRecommendation[];
// }) {
//   return (
//     <Card className="bg-muted/30 border-border">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Icon className="h-5 w-5 text-primary" />
//           {title}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {items.map((item, i) => (
//           <div key={i} className="flex items-start gap-3">
//             <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
//             <div>
//               <p className="font-semibold text-foreground">{item.title}</p>
//               <p className="text-sm text-muted-foreground mt-0.5">
//                 {item.description}
//               </p>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

// // -----------------------------------------------------------------------------
// // Main component

// export function AnalyticsPage() {
//   const [timeRange, setTimeRange] = useState('6months');

//   const { data: analytics, isLoading } = useQuery<AnalyticsData>({
//     queryKey: ['analytics', timeRange],
//     queryFn: () => authService.analytics(timeRange),
//     staleTime: 1000 * 60 * 5,
//     retry: 1,
//   });

//   // Memoized derived values
//   const stats: AnalyticsStats = useMemo(
//     () =>
//       analytics?.stats ?? {
//         total_savings: 8200,
//         monthly_growth: 1400,
//         monthly_growth_percentage: 8.2,
//         active_groups: 4,
//         goals_progress: 67,
//       },
//     [analytics],
//   );

//   const savingsOverTime: SavingsOverTimeItem[] = useMemo(
//     () => analytics?.savings_over_time ?? fallbackSavingsOverTime,
//     [analytics],
//   );

//   const savingsDistribution: SavingsDistributionItem[] = useMemo(
//     () => analytics?.savings_distribution ?? fallbackSavingsDistribution,
//     [analytics],
//   );

//   const groupPerformance: GroupPerformanceItem[] = useMemo(
//     () => analytics?.group_performance ?? fallbackGroupPerformance,
//     [analytics],
//   );

//   const keyInsights: InsightOrRecommendation[] = useMemo(
//     () => analytics?.key_insights ?? fallbackKeyInsights,
//     [analytics],
//   );

//   const recommendations: InsightOrRecommendation[] = useMemo(
//     () => analytics?.recommendations ?? fallbackRecommendations,
//     [analytics],
//   );

//   const statsCards = useMemo(
//     () => [
//       {
//         title: 'Total Savings',
//         value: `GHS ${Number(stats.total_savings).toLocaleString()}`,
//         change: `+${stats.monthly_growth_percentage}%`,
//         trend: 'up' as const,
//         icon: DollarSign,
//         color: 'text-green-600',
//       },
//       {
//         title: 'Monthly Growth',
//         value: `GHS ${Number(stats.monthly_growth).toLocaleString()}`,
//         change: `+${stats.monthly_growth_percentage}%`,
//         trend: 'up' as const,
//         icon: TrendingUp,
//         color: 'text-green-600',
//       },
//       {
//         title: 'Active Groups',
//         value: stats.active_groups.toString(),
//         change: '+1',
//         trend: 'up' as const,
//         icon: Users,
//         color: 'text-cyan-600',
//       },
//       {
//         title: 'Goals Progress',
//         value: `${stats.goals_progress}%`,
//         change: '+12%',
//         trend: 'up' as const,
//         icon: Target,
//         color: 'text-cyan-600',
//       },
//     ],
//     [stats],
//   );

//   // ✅ Comprehensive loading skeleton – exactly matching style of GroupsPage, GoalsPage, RequestsPage, etc.
//   if (isLoading) {
//     return (
//       <div className="space-y-6 mb-20 md:mb-0">
//         {/* Header skeleton */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div className="h-9 w-64 bg-muted animate-pulse rounded-lg" />
//           <div className="h-10 w-44 bg-muted animate-pulse rounded-xl" />
//         </div>

//         {/* Stats grid skeleton */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <div key={i} className="h-28 bg-muted animate-pulse rounded-2xl" />
//           ))}
//         </div>

//         {/* Charts row 1 skeleton */}
//         <div className="grid gap-4 md:grid-cols-2">
//           <div className="h-96 bg-muted animate-pulse rounded-2xl" />
//           <div className="h-96 bg-muted animate-pulse rounded-2xl" />
//         </div>

//         {/* Group performance skeleton */}
//         <div className="h-96 bg-muted animate-pulse rounded-2xl" />

//         {/* Insights & recommendations skeleton */}
//         <div className="grid gap-6 md:grid-cols-2">
//           {Array.from({ length: 2 }).map((_, i) => (
//             <div key={i} className="h-80 bg-muted animate-pulse rounded-2xl" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 mb-20 md:mb-0">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold mb-1">Analytics</h1>
//           <p className="text-muted-foreground">
//             Track your savings performance and insights
//           </p>
//         </div>
//         <Select value={timeRange} onValueChange={setTimeRange}>
//           <SelectTrigger className="w-44">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="1month">Last Month</SelectItem>
//             <SelectItem value="3months">Last 3 Months</SelectItem>
//             <SelectItem value="6months">Last 6 Months</SelectItem>
//             <SelectItem value="1year">Last Year</SelectItem>
//             <SelectItem value="all">All Time</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {statsCards.map((stat) => (
//           <StatsCard key={stat.title} {...stat} />
//         ))}
//       </div>

//       {/* Charts Row 1 */}
//       <div className="grid gap-4 md:grid-cols-2">
//         <SavingsGrowthChart data={savingsOverTime} />
//         <SavingsDistributionChart data={savingsDistribution} />
//       </div>

//       {/* Group Performance */}
//       <GroupPerformanceChart data={groupPerformance} />

//       {/* Insights & Recommendations */}
//       <div className="grid gap-6 md:grid-cols-2">
//         <InsightsCard
//           title="Key Insights"
//           icon={TrendingUp}
//           items={keyInsights}
//         />
//         <InsightsCard
//           title="Recommendations"
//           icon={Target}
//           items={recommendations}
//         />
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { authService } from '@/src/services/auth.service';
// import {
//   TrendingUp,
//   DollarSign,
//   Users,
//   Target,
//   ArrowUpRight,
//   ArrowDownRight,
// } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '../ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../ui/select';
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';

// // TypeScript Interfaces

// interface AnalyticsStats {
//   total_savings: number;
//   monthly_growth: number;
//   monthly_growth_percentage: number;
//   active_groups: number;
//   goals_progress: number;
// }

// interface SavingsOverTimeItem {
//   month: string;
//   amount: number;
//   contributions: number;
// }

// interface SavingsDistributionItem {
//   name: string;
//   value: number;
// }

// interface GroupPerformanceItem {
//   name: string;
//   savings: number;
//   members: number;
// }

// interface InsightOrRecommendation {
//   title: string;
//   description: string;
// }

// interface AnalyticsData {
//   stats: AnalyticsStats;
//   savings_over_time: SavingsOverTimeItem[];
//   savings_distribution: SavingsDistributionItem[];
//   group_performance: GroupPerformanceItem[];
//   key_insights: InsightOrRecommendation[];
//   recommendations: InsightOrRecommendation[];
// }

// // Fallback data

// const fallbackSavingsOverTime: SavingsOverTimeItem[] = [
//   { month: 'Jul', amount: 2400, contributions: 500 },
//   { month: 'Aug', amount: 3200, contributions: 800 },
//   { month: 'Sep', amount: 4100, contributions: 900 },
//   { month: 'Oct', amount: 5500, contributions: 1400 },
//   { month: 'Nov', amount: 6800, contributions: 1300 },
//   { month: 'Dec', amount: 8200, contributions: 1400 },
// ];

// const fallbackSavingsDistribution: SavingsDistributionItem[] = [
//   { name: 'Emergency Fund', value: 3200 },
//   { name: 'Goals', value: 2800 },
//   { name: 'Group Savings', value: 2200 },
// ];

// const fallbackGroupPerformance: GroupPerformanceItem[] = [
//   { name: 'University Friends', savings: 24500, members: 12 },
//   { name: 'Family Circle', savings: 18200, members: 8 },
//   { name: 'Startup Capital', savings: 12800, members: 5 },
//   { name: 'Vacation Fund', savings: 8900, members: 6 },
// ];

// const fallbackKeyInsights: InsightOrRecommendation[] = [
//   {
//     title: 'Strong Savings Momentum',
//     description: "You've increased your savings by 15.3% in the last 6 months",
//   },
//   {
//     title: 'Consistent Contributions',
//     description: 'Your monthly contributions average GHS 1,283',
//   },
//   {
//     title: 'Top Performing Group',
//     description: '"University Friends" has the highest total savings',
//   },
// ];

// const fallbackRecommendations: InsightOrRecommendation[] = [
//   {
//     title: 'Boost Emergency Fund',
//     description:
//       'Consider increasing your emergency fund to 6 months of expenses',
//   },
//   {
//     title: 'Diversify Savings',
//     description: 'Join more groups to diversify your savings portfolio',
//   },
//   {
//     title: 'Set New Goals',
//     description: "You're on track! Consider setting new financial goals",
//   },
// ];

// export function AnalyticsPage() {
//   const [timeRange, setTimeRange] = useState('6months');

//   // Fetch real analytics data
//   const { data: analytics } = useQuery<AnalyticsData>({
//     queryKey: ['analytics', timeRange],
//     queryFn: () => authService.analytics(timeRange),
//     staleTime: 1000 * 60 * 5,
//     retry: 1,
//   });

//   // Fallback values
//   const stats: AnalyticsStats = analytics?.stats ?? {
//     total_savings: 8200,
//     monthly_growth: 1400,
//     monthly_growth_percentage: 8.2,
//     active_groups: 4,
//     goals_progress: 67,
//   };

//   const savingsOverTime: SavingsOverTimeItem[] =
//     analytics?.savings_over_time ?? fallbackSavingsOverTime;

//   const savingsDistribution: SavingsDistributionItem[] =
//     analytics?.savings_distribution ?? fallbackSavingsDistribution;

//   const groupPerformance: GroupPerformanceItem[] =
//     analytics?.group_performance ?? fallbackGroupPerformance;

//   const keyInsights: InsightOrRecommendation[] =
//     analytics?.key_insights ?? fallbackKeyInsights;

//   const recommendations: InsightOrRecommendation[] =
//     analytics?.recommendations ?? fallbackRecommendations;

//   // Add colors for pie chart & legend
//   const distributionWithColors = savingsDistribution.map(
//     (item: SavingsDistributionItem, index: number) => ({
//       ...item,
//       color: ['#0891B2', '#22D3EE', '#06B6D4'][index % 3],
//     }),
//   );

//   // Stats cards (dynamic values)
//   const statsCards = [
//     {
//       title: 'Total Savings',
//       value: `GHS ${Number(stats.total_savings).toLocaleString()}`,
//       change: `+${stats.monthly_growth_percentage}%`,
//       trend: 'up' as const,
//       icon: DollarSign,
//       color: 'text-green-600',
//     },
//     {
//       title: 'Monthly Growth',
//       value: `GHS ${Number(stats.monthly_growth).toLocaleString()}`,
//       change: `+${stats.monthly_growth_percentage}%`,
//       trend: 'up' as const,
//       icon: TrendingUp,
//       color: 'text-green-600',
//     },
//     {
//       title: 'Active Groups',
//       value: stats.active_groups.toString(),
//       change: '+1',
//       trend: 'up' as const,
//       icon: Users,
//       color: 'text-cyan-600',
//     },
//     {
//       title: 'Goals Progress',
//       value: `${stats.goals_progress}%`,
//       change: '+12%',
//       trend: 'up' as const,
//       icon: Target,
//       color: 'text-cyan-600',
//     },
//   ];

//   return (
//     <div className="space-y-6 mb-20 md:mb-0">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-bold mb-1">Analytics</h1>
//           <p className="text-muted-foreground">
//             Track your savings performance and insights
//           </p>
//         </div>
//         <Select value={timeRange} onValueChange={setTimeRange}>
//           <SelectTrigger className="w-45">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="1month">Last Month</SelectItem>
//             <SelectItem value="3months">Last 3 Months</SelectItem>
//             <SelectItem value="6months">Last 6 Months</SelectItem>
//             <SelectItem value="1year">Last Year</SelectItem>
//             <SelectItem value="all">All Time</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {statsCards.map((stat) => (
//           <Card key={stat.title}>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm">{stat.title}</CardTitle>
//               <stat.icon className={`h-4 w-4 ${stat.color}`} />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl mb-1">{stat.value}</div>
//               <div
//                 className={`flex items-center text-xs ${
//                   stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
//                 }`}
//               >
//                 {stat.trend === 'up' ? (
//                   <ArrowUpRight className="h-3 w-3 mr-1" />
//                 ) : (
//                   <ArrowDownRight className="h-3 w-3 mr-1" />
//                 )}
//                 {stat.change} from last period
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Charts Row 1 */}
//       <div className="grid gap-4 md:grid-cols-2">
//         {/* Savings Growth */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Savings Growth</CardTitle>
//             <CardDescription>Your total savings over time</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={savingsOverTime}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="amount"
//                   stroke="#0891B2"
//                   strokeWidth={2}
//                   name="Total Savings"
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="contributions"
//                   stroke="#22D3EE"
//                   strokeWidth={2}
//                   name="Monthly Contribution"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Savings Distribution (Pie) */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Savings Distribution</CardTitle>
//             <CardDescription>Breakdown by category</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={distributionWithColors}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent = 0 }) =>
//                     `${name}: ${(percent * 100).toFixed(0)}%`
//                   }
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {distributionWithColors.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>

//             <div className="mt-4 space-y-2">
//               {distributionWithColors.map((category) => (
//                 <div
//                   key={category.name}
//                   className="flex items-center justify-between text-sm"
//                 >
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="w-3 h-3 rounded-full"
//                       style={{ backgroundColor: category.color }}
//                     />
//                     <span>{category.name}</span>
//                   </div>
//                   <span className="font-semibold">
//                     GHS {category.value.toLocaleString()}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Group Performance */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Group Performance</CardTitle>
//           <CardDescription>Savings by group</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={groupPerformance}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar
//                 dataKey="savings"
//                 fill="#0891B2"
//                 name="Total Savings (GHS)"
//               />
//               <Bar dataKey="members" fill="#22D3EE" name="Members" />
//             </BarChart>
//           </ResponsiveContainer>
//         </CardContent>
//       </Card>

//       {/* Dynamic Insights & Recommendations */}
//       <div className="grid gap-6 md:grid-cols-2">
//         <Card className="bg-muted/30 border-border">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <TrendingUp className="h-5 w-5 text-primary" />
//               Key Insights
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {keyInsights.map((insight, i) => (
//               <div key={i} className="flex items-start gap-3">
//                 <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
//                 <div>
//                   <p className="font-semibold text-foreground">
//                     {insight.title}
//                   </p>
//                   <p className="text-sm text-muted-foreground mt-0.5">
//                     {insight.description}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>

//         <Card className="bg-muted/30 border-border">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Target className="h-5 w-5 text-primary" />
//               Recommendations
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {recommendations.map((rec, i) => (
//               <div key={i} className="flex items-start gap-3">
//                 <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
//                 <div>
//                   <p className="font-semibold text-foreground">{rec.title}</p>
//                   <p className="text-sm text-muted-foreground mt-0.5">
//                     {rec.description}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
