"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  TableSortLabel,
  TablePagination
} from '@mui/material';
import { APIHOST } from '../../common';
import { Hotel } from '../../types/hotel';
import { Order } from '../../types/order';

type SortOrder = 'asc' | 'desc';

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Order>('updatedAt');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, orderBy, order]);

  const fetchOrders = async () => {
    console.log("Fetching orders...")
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${APIHOST}/api/orders?sort=${orderBy}:${order}&pagination[page]=${page + 1}&pagination[pageSize]=${rowsPerPage}&populate[0]=conference_hotel.hotel&populate[1]=conference_hotel.conference`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      const orders: Order[] = data.data;
      console.log("ORDERS", orders)
      setOrders(orders || []);
      setTotal(data.meta?.pagination?.total || 0);
      console.debug("ORDERS", orders)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property: keyof Order) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset to first page when sorting changes
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOrderClick = (documentId: string) => {
    router.push(`/admin/order?orderId=${documentId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const daysDiff = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'success';
    if (daysDiff <= 7) return 'primary';
    if (daysDiff <= 30) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">Loading orders...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Orders
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Orders with pagination and sorting
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'contactFirstName'}
                  direction={orderBy === 'contactFirstName' ? order : 'asc'}
                  onClick={() => handleRequestSort('contactFirstName')}
                >
                  Contact
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'contactEmail'}
                  direction={orderBy === 'contactEmail' ? order : 'asc'}
                  onClick={() => handleRequestSort('contactEmail')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>Conference</TableCell>
              <TableCell>Hotel</TableCell>
              <TableCell>Rooms</TableCell>
              <TableCell>Occupants</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdAt'}
                  direction={orderBy === 'createdAt' ? order : 'asc'}
                  onClick={() => handleRequestSort('createdAt')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'updatedAt'}
                  direction={orderBy === 'updatedAt' ? order : 'asc'}
                  onClick={() => handleRequestSort('updatedAt')}
                >
                  Updated
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow 
                key={order.documentId} 
                hover 
                onClick={() => handleOrderClick(order.documentId)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {order.contactFirstName} {order.contactLastName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.contactEmail}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.conference_hotel?.conference?.longName || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.conference_hotel?.hotel?.longName || 'Not selected'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.roomCount || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {order.occupantCount || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.updatedAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={order.orderStatus}
                    color={getStatusColor(order.createdAt)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {orders.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No orders found
          </Typography>
        </Box>
      )}
    </Paper>
  );
}