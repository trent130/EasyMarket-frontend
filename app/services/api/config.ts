export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000',
  ENDPOINTS: {
    AUTH: {
      TOKEN: '/marketplace/token/',
      REFRESH: '/marketplace/token/refresh/',
      LOGOUT: '/marketplace/logout/',
      REGISTER: '/marketplace/register/',
      ME: '/marketplace/me/'
    },
    PRODUCTS: {
      LIST: '/products/api/products/',
      DETAIL: (slug: string) => `/products/api/products/${slug}/`,
      REVIEWS: (productId: number) => `/marketplace/products/${productId}/reviews/`,
      MY_PRODUCTS: '/marketplace/my-products/',
      MY_PRODUCT_DETAIL: (id: number) => `/marketplace/my-products/${id}/`,
      MY_PRODUCT_STATUS: (id: number) => `/marketplace/my-products/${id}/status/`,
      MY_PRODUCT_IMAGES: (id: number) => `/marketplace/my-products/${id}/images/`
    },
    MARKETPLACE: {
      CATEGORIES: '/marketplace/categories/',
      CATEGORY_DETAILS: (slug: string) => `/marketplace/categories/${slug}/`,
      WISHLIST: '/marketplace/api/wishlist/',
      CART: '/marketplace/cart/',
      SEARCH: '/marketplace/search/',
      RECOMMENDATIONS: '/marketplace/recommendations/',
      MESSAGES: '/marketplace/messages/',
      MESSAGE_DETAIL: (id: number) => `/marketplace/messages/${id}/`,
      MESSAGE_MESSAGES: (id: number) => `/marketplace/messages/${id}/messages/`,
      MESSAGE_READ: (id: number) => `/marketplace/messages/${id}/read/`,
      REVIEWS: '/marketplace/reviews/',
      ORDERS: '/marketplace/orders/'
    }
  },
  HEADERS: {
    'Content-Type': 'application/json'
  },
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
} as const;

export type ApiEndpoint = typeof API_CONFIG.ENDPOINTS; 