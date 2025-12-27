export interface ConferenceHotelRoom {
  id: number;
  documentId: string;
  name: string;
  dailyRate: number;
  blockTotal: number;
  reservedTotal?: number;
  maxOccupants?: number;
  pics?: Array<{
    id: number;
    documentId: string;
    name: string;
    alternativeText?: string;
    url: string;
    formats?: any;
  }>;
  conference_hotel: {
    documentId: string;
    hotel: {
      documentId: string;
      name: string;
      longName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export type ConferenceHotelRoomResponse = {
  data: ConferenceHotelRoom[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};