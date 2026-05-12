import api from './api';

export interface Category {
  id: number;
  nama: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data.data.categories;
};
