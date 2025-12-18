import { ConferenceHotel } from "./conferenceHotel";
import { Room } from "./room";

export interface Order {
  id: number;
  documentId: string;
  billingAddressee: string;
  billingCity: string | null;
  billingCountry: string | null;
  billingState: string | null;
  billingStreet1: string | null;
  billingStreet2: string | null;
  billingZip: string | null;
  confirmation: string | null;
  confirmationNumbers: string | null;
  contactCell: string | null;
  contactEmail: string | null;
  contactFirstName: string | null;
  contactLastName: string | null;
  notesForHotel: string | null;
  owner: string | null;
  primary: string | null;
  requiresBusParking: boolean;
  requiresTransitToVenue: boolean;
  segment: string | null;
  staffNotes: string | null;
  staffState: string | null;
  state: string | null;
  studentsShareBeds: boolean;
  selectedHotel?: string;
  rewardsNumber?: string;
  termsAccepted?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  order_rooms?: Room[];
  conference_hotel?: ConferenceHotel | null;
  orderStatus: string;
  roomCount?: number;
  occupantCount?: number;
}

export type OrderResponse = {
  data: Order[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};
