"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface IProjectGrowthOverTime {
  projectData: {
    month: string;
    projects: number;
  }[];
}

export function ProjectGrowthOverTime({ projectData }: IProjectGrowthOverTime) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={projectData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Line
          type="monotone"
          dataKey="projects"
          stroke="hsl(var(--accent))"
          strokeWidth={3}
          dot={{ fill: "hsl(var(--accent))", r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
