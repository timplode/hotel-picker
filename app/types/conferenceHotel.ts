import { Conference } from './conference';
import { Hotel } from './hotel';

export interface ConferenceHotel {
  id: number;
  documentId: string;
  conference: Conference;
  hotel: Hotel;
  contactEmail?: string;
  contactName?: string;
  hasBusParking?: boolean;
  hasTransitToVenue?: boolean;
  priority: number;
  requiresCreditCard?: boolean;
  taxPerRoomNight?: number;
  taxPerRoomNightNonProfit?: number;
  taxRatePercentage: number;
  taxRatePercentageNonProfit?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type ConferenceHotelResponse = {
  data: ConferenceHotel[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};