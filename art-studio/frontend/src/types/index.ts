export interface ArtItem {
  id: string;
  imageUrl: string;
  prompt: string;
  style: string;
  size?: string;
  createdAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface ArtHistoryResponse {
  success: boolean;
  data: ArtItem[];
  pagination: PaginationInfo;
}

export interface GenerateArtParams {
  prompt: string;
  style: string;
  size: string;
}

export interface EditArtParams {
  image: File;
  prompt: string;
  style: string;
}

export interface UpscaleArtParams {
  image: File;
  scale: number;
}

export interface ArtResponse {
  success: boolean;
  imageUrl: string;
  prompt: string;
  style: string;
  size?: string;
} 