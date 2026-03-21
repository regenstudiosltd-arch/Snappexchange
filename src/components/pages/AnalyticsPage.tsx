'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authService } from '@/src/services/auth.service';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
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

// TypeScript Interfaces

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

// Fallback data

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

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');

  // Fetch real analytics data
  const { data: analytics } = useQuery<AnalyticsData>({
    queryKey: ['analytics', timeRange],
    queryFn: () => authService.analytics(timeRange),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Fallback values
  const stats: AnalyticsStats = analytics?.stats ?? {
    total_savings: 8200,
    monthly_growth: 1400,
    monthly_growth_percentage: 8.2,
    active_groups: 4,
    goals_progress: 67,
  };

  const savingsOverTime: SavingsOverTimeItem[] =
    analytics?.savings_over_time ?? fallbackSavingsOverTime;

  const savingsDistribution: SavingsDistributionItem[] =
    analytics?.savings_distribution ?? fallbackSavingsDistribution;

  const groupPerformance: GroupPerformanceItem[] =
    analytics?.group_performance ?? fallbackGroupPerformance;

  const keyInsights: InsightOrRecommendation[] =
    analytics?.key_insights ?? fallbackKeyInsights;

  const recommendations: InsightOrRecommendation[] =
    analytics?.recommendations ?? fallbackRecommendations;

  // Add colors for pie chart & legend
  const distributionWithColors = savingsDistribution.map(
    (item: SavingsDistributionItem, index: number) => ({
      ...item,
      color: ['#0891B2', '#22D3EE', '#06B6D4'][index % 3],
    }),
  );

  // Stats cards (dynamic values)
  const statsCards = [
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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Analytics</h1>
          <p className="text-muted-foreground">
            Track your savings performance and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-45">
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
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl mb-1">{stat.value}</div>
              <div
                className={`flex items-center text-xs ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {stat.change} from last period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Savings Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Growth</CardTitle>
            <CardDescription>Your total savings over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsOverTime}>
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

        {/* Savings Distribution (Pie) */}
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
                  fill="#8884d8"
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
      </div>

      {/* Group Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Group Performance</CardTitle>
          <CardDescription>Savings by group</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="savings"
                fill="#0891B2"
                name="Total Savings (GHS)"
              />
              <Bar dataKey="members" fill="#22D3EE" name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dynamic Insights & Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-muted/30 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {keyInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">
                    {insight.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{rec.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
