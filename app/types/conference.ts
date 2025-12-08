export interface MediaFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface Media {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string;
  caption: string;
  width: number;
  height: number;
  formats: {
    large?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    thumbnail?: MediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Conference {
  id: number;
  documentId: string;
  name: string;
  longName: string;
  defaultArrivalDate: string;
  earliestArrivalDate: string;
  allowLogins: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  passcode: string;
  defaultDepartureDate: string;
  logo?: Media;
}

export type ConferenceResponse = {
  data: Conference[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};