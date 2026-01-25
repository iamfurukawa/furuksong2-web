import { request } from './api';
import type { Category, CategoryListResponse } from '../types/category';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await request.get<CategoryListResponse>('/categories');
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};
