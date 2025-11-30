import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

export default function GaugeChart({ title, value, max = 100, color = '#0088FE' }) {
  const percentage = Math.min((value / max) * 100, 100);
  const data = [
    { name: 'Atteint', value: percentage },
    { name: 'Restant', value: 100 - percentage }
  ];
  
  const getColor = () => {
    if (percentage >= 80) return '#00C49F';
    if (percentage >= 50) return '#FFBB28';
    return '#FF8042';
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%', textAlign: 'center' }}>
      {title && (
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {title}
        </Typography>
      )}
      <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2 }}>
        <ResponsiveContainer width={200} height={200}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              <Cell key="cell-0" fill={getColor()} />
              <Cell key="cell-1" fill="#e0e0e0" />
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        </ResponsiveContainer>
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h4" component="div" color="text.primary" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            / {max}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {percentage.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
