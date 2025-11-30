import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography } from '@mui/material';

export default function BarChart({ title, data, dataKey, nameKey = 'name' }) {
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      {title && (
        <Typography variant="h6" gutterBottom fontWeight={600}>
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#0088FE" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </Paper>
  );
}
