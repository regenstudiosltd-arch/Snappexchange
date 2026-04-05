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
import { AnalyticsPageError } from '../ErrorStates';

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

const emptyStats: AnalyticsStats = {
  total_savings: 0,
  monthly_growth: 0,
  monthly_growth_percentage: 0,
  active_groups: 0,
  goals_progress: 0,
};

const emptySavingsOverTime: SavingsOverTimeItem[] = [];
const emptySavingsDistribution: SavingsDistributionItem[] = [];
const emptyGroupPerformance: GroupPerformanceItem[] = [];
const emptyKeyInsights: InsightOrRecommendation[] = [];
const emptyRecommendations: InsightOrRecommendation[] = [];

// Skeleton primitives

function ChartBars({ count = 6 }: { count?: number }) {
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

function ChartAxisLabels({ count = 6 }: { count?: number }) {
  return (
    <div className="flex justify-around w-full px-2 mt-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-6 rounded" />
      ))}
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <Skeleton className="h-9 w-36 rounded" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>
      <Skeleton className="h-10 w-44 rounded-md" />
    </div>
  );
}

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
            <Skeleton className="h-8 w-28 rounded mb-2" />
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

function SavingsGrowthChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32 rounded mb-1" />
        <Skeleton className="h-4 w-48 rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-75 flex flex-col">
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

function SavingsDistributionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36 rounded mb-1" />
        <Skeleton className="h-4 w-40 rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-75 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <Skeleton className="absolute inset-0 rounded-full" />
            <div className="absolute inset-6 rounded-full bg-card" />
          </div>
        </div>
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
          <div className="flex justify-around px-10 mt-2">
            {[52, 36, 44, 40].map((w, i) => (
              <Skeleton
                key={i}
                className={`h-3 w-${w === 52 ? '14' : w === 36 ? '10' : w === 44 ? '12' : '10'} rounded`}
              />
            ))}
          </div>
        </div>
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

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timeRange],
    queryFn: () => authService.analytics(timeRange),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Distinguish between a real fetch error and genuinely empty data.
  // On error → show error state (don't mislead with zeroes).
  // On success with no data → show zeroed values (accurate for new users).
  const stats = analytics?.stats ?? emptyStats;
  const savingsOverTime = analytics?.savings_over_time ?? emptySavingsOverTime;
  const savingsDistribution =
    analytics?.savings_distribution ?? emptySavingsDistribution;
  const groupPerformance =
    analytics?.group_performance ?? emptyGroupPerformance;
  const keyInsights = analytics?.key_insights ?? emptyKeyInsights;
  const recommendations = analytics?.recommendations ?? emptyRecommendations;

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
        change: '+0',
        trend: 'up' as const,
        icon: Users,
        color: 'text-cyan-600',
      },
      {
        title: 'Goals Progress',
        value: `${stats.goals_progress}%`,
        change: '+0%',
        trend: 'up' as const,
        icon: Target,
        color: 'text-cyan-600',
      },
    ],
    [stats],
  );

  if (isLoading) return <AnalyticsSkeleton />;

  // Network/server failure — show error state, not misleading zeroes
  if (error) {
    return (
      <div className="space-y-6 mb-20 md:mb-0">
        {/* Keep the header + time range selector visible so the page feels alive */}
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
        <AnalyticsPageError onRetry={() => refetch()} />
      </div>
    );
  }

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
