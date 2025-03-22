export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string;
    product_count: number;
    is_active: boolean;
}

export interface ProductReview {
    id: number;
    rating: number;
    comment: string;
    reviewer_name: string;
    created_at: string;
}

export interface ProductReviews {
    average: number;
    count: number;
    recent: ProductReview[];
}

export interface ProductStudent {
    id: number;
    username: string;
    rating: number;
    products_count: number;
    joined_date: string;
}

export interface ProductBase {
    id: number;
    title: string;
    slug: string;
    price: number;
    category: number;
    category_name: string;
    image_url: string;
    is_active: boolean;
    student_name: string;
    average_rating: number;
    is_wishlisted: boolean;
    available_stock: number;
    condition: ProductCondition;
    created_at: string;
}

export interface Product {
    id: string | number;
    title?: string;
    name?: string;
    slug: string;
    description: string;
    price: string | number;
    image_url?: string;
    imageUrl?: string;
    category_id: string | number;
    category_name: string;
    student_id: string | number;
    student_name: string;
    condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
    available_stock?: number;
    stock?: number;
    average_rating?: number;
    rating?: number;
    created_at: string;
    updated_at: string;
}

export interface ProductDetail extends Omit<ProductBase, 'category' | 'category_name' | 'student'> {
    description: string;
    category: Category;
    student: ProductStudent;
    reviews: ProductReviews;
    related_products: ProductBase[];
    views_count: number;
    updated_at: string;
}

export interface ProductSearchFilters {
    query?: string;
    category?: number;
    min_price?: number;
    max_price?: number;
    condition?: ProductCondition;
    sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popularity';
    in_stock?: boolean;
    page?: number;
    page_size?: number;
}

export interface ProductSearchResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ProductBase[];
}

export interface CreateProductData {
    title: string;
    description: string;
    price: number;
    category: number;
    image?: File;
    condition: ProductCondition;
    stock: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    is_active?: boolean;
}

export interface BulkActionData {
    product_ids: number[];
    action: 'delete' | 'activate' | 'deactivate';
}

export interface UpdateStockData {
    stock: number;
}

export interface ProductVariant {
    id: number;
    name: string;
    sku: string;
    price_adjustment: number;
    available_stock: number;
    final_price: number;
    is_active: boolean;
  }
  
export interface ProductDetails extends Product {
    reviews: ProductReview[];
    related_products: Product[];
    seller_info: {
        id: string;
        name: string;
        rating: number;
        total_sales: number;
    };
}

export interface ProductReview {
    id: string;
    user_id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

export interface ProductStatistics {
    total_sales: number;
    total_revenue: number;
    last_sale_date: string;
    average_rating: number;
    review_count: number;
    views_count: number;
}

export interface ProductSeller {
    id: number;
    username: string;
    rating: number;
    products_count: number;
    joined_date: string;
}

export interface ProductReviews {
    average: number;
    count: number;
    recent: ProductReview[];
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at' | 'slug'> & {
  images: File[];
};

