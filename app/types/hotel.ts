export interface Hotel {
  documentId: string;
  id: number;
  old_id?: string;
  name: string;
  longName: string
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  website?: string;
  amenities?: string;
  conference?: {
    documentId: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}