export interface Hotel {
  documentId: string;
  id: number;
  old_id?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  phone?: string;
  email?: string;
  website?: string;
  rate?: number;
  capacity?: number;
  availability?: number;
  amenities?: string;
  conference?: {
    documentId: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface HotelResponse {
  data: Hotel[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}