"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months");

  // Sample data for charts
  const savingsOverTime = [
    { month: "Jul", amount: 2400, contributions: 500 },
    { month: "Aug", amount: 3200, contributions: 800 },
    { month: "Sep", amount: 4100, contributions: 900 },
    { month: "Oct", amount: 5500, contributions: 1400 },
    { month: "Nov", amount: 6800, contributions: 1300 },
    { month: "Dec", amount: 8200, contributions: 1400 },
  ];

  const categoryBreakdown = [
    { name: "Emergency Fund", value: 3200, color: "#0891B2" },
    { name: "Goals", value: 2800, color: "#22D3EE" },
    { name: "Group Savings", value: 2200, color: "#06B6D4" },
  ];

  const groupPerformance = [
    { name: "University Friends", savings: 24500, members: 12 },
    { name: "Family Circle", savings: 18200, members: 8 },
    { name: "Startup Capital", savings: 12800, members: 5 },
    { name: "Vacation Fund", savings: 8900, members: 6 },
  ];

  const stats = [
    {
      title: "Total Savings",
      value: "GHS 8,200",
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Monthly Growth",
      value: "GHS 1,400",
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Active Groups",
      value: "4",
      change: "+1",
      trend: "up",
      icon: Users,
      color: "text-cyan-600",
    },
    {
      title: "Goals Progress",
      value: "67%",
      change: "+12%",
      trend: "up",
      icon: Target,
      color: "text-cyan-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl mb-1">Analytics</h1>
          <p className="text-muted-foreground">
            Track your savings performance and insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
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
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl mb-1">{stat.value}</div>
              <div className={`flex items-center text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
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
        {/* Savings Over Time */}
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

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Savings Distribution</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((category) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span>{category.name}</span>
                  </div>
                  <span className="font-semibold">GHS {category.value.toLocaleString()}</span>
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
              <Bar dataKey="savings" fill="#0891B2" name="Total Savings (GHS)" />
              <Bar dataKey="members" fill="#22D3EE" name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-500 mt-2" />
              <div>
                <p className="font-semibold">Strong Savings Momentum</p>
                <p className="text-sm text-muted-foreground">
                  You've increased your savings by 15.3% in the last 6 months
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-500 mt-2" />
              <div>
                <p className="font-semibold">Consistent Contributions</p>
                <p className="text-sm text-muted-foreground">
                  Your monthly contributions average GHS 1,283
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-cyan-500 mt-2" />
              <div>
                <p className="font-semibold">Top Performing Group</p>
                <p className="text-sm text-muted-foreground">
                  "University Friends" has the highest total savings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
              <div>
                <p className="font-semibold">Boost Emergency Fund</p>
                <p className="text-sm text-muted-foreground">
                  Consider increasing your emergency fund to 6 months of expenses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
              <div>
                <p className="font-semibold">Diversify Savings</p>
                <p className="text-sm text-muted-foreground">
                  Join more groups to diversify your savings portfolio
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
              <div>
                <p className="font-semibold">Set New Goals</p>
                <p className="text-sm text-muted-foreground">
                  You're on track! Consider setting new financial goals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
