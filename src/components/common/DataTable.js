import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  border: '1px solid',
  borderColor: theme.palette.divider,
  overflow: 'hidden',
  '& .MuiTableRow': {
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td': {
      borderBottom: 0,
    },
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: '16px',
  fontSize: '0.875rem',
}));

export default function DataTable({
  columns,
  rows,
  actions,
  onRowClick,
  emptyMessage = 'Aucune donnée disponible',
}) {
  return (
    <StyledTableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <StyledTableCell key={column.id} align={column.align || 'left'}>
                {column.label}
              </StyledTableCell>
            ))}
            {actions && <StyledTableCell align="right">Actions</StyledTableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 6 }}>
                <Box sx={{ color: 'text.secondary' }}>{emptyMessage}</Box>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow
                key={row.id || index}
                onClick={() => onRowClick && onRowClick(row)}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
              >
                {columns.map((column) => (
                  <StyledTableCell key={column.id} align={column.align || 'left'}>
                    {column.render ? column.render(row[column.id], row) : row[column.id]}
                  </StyledTableCell>
                ))}
                {actions && (
                  <StyledTableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      {actions(row).map((action, idx) => (
                        <Tooltip key={idx} title={action.tooltip || ''}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            color={action.color || 'primary'}
                            sx={{
                              '&:hover': {
                                backgroundColor: `${action.color || 'primary'}.main`,
                                color: 'white',
                              },
                            }}
                          >
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                  </StyledTableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
}

