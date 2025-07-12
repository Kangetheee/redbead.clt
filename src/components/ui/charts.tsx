"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  BarChart as ReChartsBarChart,
  LineChart as ReChartsLineChart,
  PieChart as ReChartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartData = Array<Record<string, any>>;

interface ChartProps {
  data: ChartData;
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["#2563eb", "#16a34a", "#d946ef", "#f97316"],
  valueFormatter = (value) => String(value),
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReChartsLineChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        {showXAxis && (
          <XAxis
            dataKey={index}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
        )}
        {showYAxis && (
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        )}
        <Tooltip
          formatter={(value) => [valueFormatter(Number(value)), ""]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "12px",
            border: "1px solid #e5e7eb",
          }}
        />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Line
            key={`line-${category}`}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </ReChartsLineChart>
    </ResponsiveContainer>
  );
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["#2563eb", "#16a34a", "#d946ef", "#f97316"],
  valueFormatter = (value) => String(value),
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReChartsBarChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        {showXAxis && (
          <XAxis
            dataKey={index}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
        )}
        {showYAxis && (
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        )}
        <Tooltip
          formatter={(value) => [valueFormatter(Number(value)), ""]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "12px",
            border: "1px solid #e5e7eb",
          }}
        />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Bar
            key={`bar-${category}`}
            dataKey={category}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
            barSize={35}
          />
        ))}
      </ReChartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChart({
  data,
  index,
  categories,
  colors = ["#2563eb", "#16a34a", "#d946ef", "#f97316"],
  valueFormatter = (value) => String(value),
}: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReChartsPieChart>
        <Tooltip
          formatter={(value) => [valueFormatter(Number(value)), ""]}
          contentStyle={{
            backgroundColor: "white",
            borderRadius: "6px",
            padding: "8px",
            fontSize: "12px",
            border: "1px solid #e5e7eb",
          }}
        />
        <Legend layout="vertical" verticalAlign="middle" align="right" />
        <Pie
          data={data}
          cx="40%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey={categories[0]}
          nameKey={index}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </ReChartsPieChart>
    </ResponsiveContainer>
  );
}
