export interface Category {
  id: string;
  label: string;
}

export interface CategoryListResponse {
  categories: Category[];
}
