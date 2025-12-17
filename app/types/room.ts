import { Occupant } from "./occupant";

export interface Room {
  id: string;
  type: 'student' | 'chaperone';
  arrivalDate: string;
  departureDate: string;
  occupants: Occupant[];
}