"use client";

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Conference } from '../types/conference';
import { Order } from '../types/order';
import {Room} from '../types/room';
import {Occupant} from '../types/occupant'; 

interface RoomSelectorProps {
  order?: Order | null;
  conference?: Conference | null;
  setOrderProp?: (field: string, value: any) => void;
  
}

export default function RoomSelector({ conference, setOrderProp }: RoomSelectorProps) {
  const [order_rooms, setOrderRooms] = useState<Room[]>([
    {
      id: '1',
      type: 'student',
      arrivalDate: conference?.defaultArrivalDate || '',
      departureDate: conference?.defaultDepartureDate || '',
      order_room_occupants: []
    }
  ]);

  const handleRoomChange = (roomId: string, field: keyof Room, value: any) => {
    const updatedOrderRooms = order_rooms.map(room =>
      room.id === roomId ? { ...room, [field]: value } : room
    );
    setOrderRooms(updatedOrderRooms);
    setOrderProp?.('order_rooms', updatedOrderRooms);
  };

  const handleOccupantChange = (roomId: string, occupantId: string, field: keyof Occupant, value: string) => {
    const updatedOrderRooms = order_rooms.map(room => {
      if (room.id === roomId) {
        const updatedOccupants = room.order_room_occupants.map((occupant: Occupant) =>
          occupant.id === occupantId ? { ...occupant, [field]: value } : occupant
        );
        return { ...room, order_room_occupants: updatedOccupants };
      }
      return room;
    });
    setOrderRooms(updatedOrderRooms);
    setOrderProp?.('order_rooms', updatedOrderRooms);
  };

  const addRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      type: 'student',
      arrivalDate: conference?.defaultArrivalDate || '',
      departureDate: conference?.defaultDepartureDate || '',
      order_room_occupants: []
    };
    const updatedRooms = [...order_rooms, newRoom];
    setOrderRooms(updatedRooms);
    setOrderProp?.('orderrooms', updatedRooms);
  };

  const removeRoom = (roomId: string) => {
    const room = order_rooms.find(r => r.id === roomId);
    if (room && room.order_room_occupants.length === 0) {
      const updatedOrderRooms = order_rooms.filter(r => r.id !== roomId);
      setOrderRooms(updatedOrderRooms);
      setOrderProp?.('orderrooms', updatedOrderRooms);
    }
  };

  const addOccupant = (roomId: string) => {
    const newOccupant: Occupant = {
      id: Date.now().toString(),
      firstName: '',
      lastName: ''
    };
    handleRoomChange(roomId, 'order_room_occupants', [
      ...order_rooms.find(r => r.id === roomId)?.order_room_occupants || [],
      newOccupant
    ]);
  };

  const removeOccupant = (roomId: string, occupantId: string) => {
    const room = order_rooms.find(r => r.id === roomId);
    if (room) {
      const updatedOccupants = room.order_room_occupants.filter(o => o.id !== occupantId);
      handleRoomChange(roomId, 'order_room_occupants', updatedOccupants);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h3">
          Occupants
        </Typography>
        <Box>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={addRoom}
          size="small"
        >
          Add Room
        </Button>
        </Box>
      </Box>

      {order_rooms.map((room, index) => (
        <Card key={room.id} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h4">
                Room {index + 1}
              </Typography>
              {order_rooms.length > 1 && room.order_room_occupants.length === 0 && (
                <IconButton
                  onClick={() => removeRoom(room.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Room Type</InputLabel>
                  <Select
                    value={room.type}
                    label="Room Type"
                    onChange={(e) => handleRoomChange(room.id, 'type', e.target.value)}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="chaperone">Chaperone</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Arrival Date"
                  type="date"
                  value={room.arrivalDate}
                  onChange={(e) => handleRoomChange(room.id, 'arrivalDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: conference?.earliestArrivalDate,
                    max: conference?.defaultDepartureDate
                  }}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Departure Date"
                  type="date"
                  value={room.departureDate}
                  onChange={(e) => handleRoomChange(room.id, 'departureDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: conference?.earliestArrivalDate,
                    max: conference?.defaultDepartureDate
                  }}
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" component="h5">
                Occupants
              </Typography>
              <Button
                variant="text"
                startIcon={<PersonAddIcon />}
                onClick={() => addOccupant(room.id)}
                size="small"
              >
                Add
              </Button>
            </Box>

            {room.order_room_occupants.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No occupants added yet. Click "Add Occupant" to add people to this room.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {room.order_room_occupants.map((occupant) => (
                  <Grid size={{ xs: 12 }} key={occupant.id}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        label="First Name"
                        value={occupant.firstName}
                        onChange={(e) => handleOccupantChange(room.id, occupant.id, 'firstName', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Last Name"
                        value={occupant.lastName}
                        onChange={(e) => handleOccupantChange(room.id, occupant.id, 'lastName', e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        onClick={() => removeOccupant(room.id, occupant.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addRoom}
            size="small"
            >
            Add Room
            </Button>
        </Box>
    </Box>
  );
}