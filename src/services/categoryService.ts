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

  async createCategory(name: string): Promise<Category> {
    try {
      const response = await request.post<Category>('/category', { label: name });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await request.delete(`/category/${id}`);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, name: string): Promise<Category> {
    try {
      const response = await request.put<Category>(`/category/${id}`, { label: name });
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }
};
