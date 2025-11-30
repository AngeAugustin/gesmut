import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Paper, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function PieChart({ title, data, dataKey = 'value', nameKey = 'name' }) {
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Paper>
  );
}
