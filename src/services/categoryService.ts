import axios from 'axios';
import type { Category, CategoryListResponse } from '../types/category';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await axios.get<CategoryListResponse>(`${API_BASE_URL}/categories`);
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};
