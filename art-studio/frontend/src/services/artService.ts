import axios from 'axios';

import type {
  ArtHistoryResponse,
  ArtResponse,
  EditArtParams,
  GenerateArtParams,
  UpscaleArtParams,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const generateArt = async (params: GenerateArtParams): Promise<ArtResponse> => {
  const response = await axios.post(`${API_URL}/art/generate`, params);
  return response.data;
};

export const editArt = async (params: EditArtParams): Promise<ArtResponse> => {
  const formData = new FormData();
  formData.append('image', params.image);
  formData.append('prompt', params.prompt);
  formData.append('style', params.style);

  const response = await axios.post(`${API_URL}/art/edit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const upscaleArt = async (params: UpscaleArtParams): Promise<ArtResponse> => {
  const formData = new FormData();
  formData.append('image', params.image);
  formData.append('scale', params.scale.toString());

  const response = await axios.post(`${API_URL}/art/upscale`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getArtHistory = async (page: number = 1, limit: number = 10): Promise<ArtHistoryResponse> => {
  const response = await axios.get(`${API_URL}/art/history`, {
    params: { page, limit },
  });
  return response.data;
}; 