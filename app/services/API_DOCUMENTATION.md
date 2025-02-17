# Frontend API Integration Documentation

## API Modules

### 1. Products API

```typescript
import { productService } from '@/services/api/product';

// Get all products
productService.getProducts();

// Search products
productService.searchProducts({
  query: 'textbook',
  category: 'someCategory',
  min_price: 100,
  max_price: 1000,
  sort_by: 'price_asc'
});

// Create product
productService.createProduct({
  title: 'Product Title',
  description: 'Description',
  price: 100,
  category: 'someCategory',
  image: file
});
```

### 2. Orders API
```typescript
import { ordersApi } from '@/services/api/orders';

// Create order
ordersApi.create({
  items: [{ product_id: 1, quantity: 2 }],
  shipping_address: 'Address'
});

// Get order history
ordersApi.getHistory();

// Track order
ordersApi.trackOrder(orderId);
```

### 3. Payment API
```typescript
import { paymentApi } from '@/services/api/payment';

// Initiate M-Pesa payment
paymentApi.initiateMpesaPayment({
  phone_number: '254712345678',
  order_id: 123,
  amount: 1000
});

// Verify payment
paymentApi.verifyPayment({ transaction_id: transactionId });

// Get payment receipt
paymentApi.getPaymentReceipt(transactionId);
```

### 4. StaticPages API
```typescript
import { staticpagesApi } from '@/services/api/staticpages';

// Get page content
staticpagesApi.getPage('about-us');

// Get FAQs
staticpagesApi.getFAQsByCategory();

// Send contact message
staticpagesApi.sendContactMessage({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Query',
  message: 'Message content'
});
```
### 5. Marketplace API
```typescript
import { marketplaceApi } from '@/services/api/marketplace';

// Get cart
marketplaceApi.getCart();

// Add to wishlist
marketplaceApi.addToWishlist(productId);

// Get product reviews
marketplaceApi.getProductReviews(productId);
```

### 6. Authentication
To login
```typescript
import { apiService } from '@/services/api/api';

//Login
apiService.login({username: 'someUsername',password: 'Password'});
```
To refresh
```typescript
import { apiService } from '@/services/api/api';

//RefreshToken
apiService.refreshToken('SomeRefreshToken');
```

All authenticated requests should include a JWT token:
```typescript 
// api-client.ts
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
### Error Handling
API errors are handled consistently:
```typescript
try {
  const result = await productService.getProducts();
} catch (error:any) {
  console.error(error.message);
}
```
### Real-time Updates
WebSocket integration for real-time updates:
```typescript
import { WebSocketService } from '@/lib/websocket';

const ws = new WebSocketService('ws://localhost:8000/ws/marketplace/');

// Subscribe to updates
ws.subscribe(WebSocketMessageType.PRODUCT_UPDATE, (data) => {
  // Handle product update
});

ws.subscribe(WebSocketMessageType.ORDER_UPDATE, (data) => {
  // Handle order update
});
```

### Type Safety
All API responses are properly typed:
```typescript
interface Product {
  id: number;
  title: string;
  price: number;
  // ...other fields
}

//the responses are in the data variable
productService.getProducts().then(res => const products: Product[] = res);
```

### Best Practices
1. Use the unified API interface:
```typescript
import { productService, ordersApi, paymentApi } from '@/lib/api';

// Instead of importing individual APIs
productService.getProducts();
ordersApi.create({});
paymentApi.verifyPaymentStatus('');
```

2. Handle loading states:
```typescript
const [loading, setLoading] = useState(false);

try {
  setLoading(true);
  await productService.create({});
} finally {
  setLoading(false);
}
```
3. Cache responses when appropriate:
```typescript
const { data: products, mutate } = useSWR(
  '/api/products',
  () => productService.getProducts()
);
```

4. Use proper error boundaries:
```typescript
<ErrorBoundary fallback={<ErrorComponent />}>
  <ProductList />
</ErrorBoundary>
```
### Integration Examples
### Product Listing Page
```typescript
import { productService } from '@/services/api/product';
import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productService.getProducts().then(res => res.products);
        setProducts(data);
      } catch (error:any) {
        console.error('Failed to load products:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
```
### Checkout Flow
```typescript
import { ordersApi } from '@/services/api/orders';
import { paymentApi } from '@/services/api/payment';
import { marketplaceApi } from '@/services/api/marketplace';

async function handleCheckout(cart: CartItem[]) {
  try {
    // 1. Create order
    const order = await ordersApi.create({
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    });

    // 2. Initialize payment
    const payment = await paymentApi.initiateMpesaPayment({
      order_id: order.id,
      amount: order.total_amount,
      phone_number: "254700000000"
    });

    // 3. Verify payment
    const status = await paymentApi.verifyPayment({
      transaction_id: payment.transaction_id
    });

    if (status.status ==="completed") {
      // 4. Clear cart
      await marketplaceApi.clearCart();

      // 5. Show success
      // router.push(`/orders/${order.id}/success`);
      return "success"
    }
  } catch (error:any) {
    console.error('Checkout failed:', error.message);
    return "failed";
  }
}
```