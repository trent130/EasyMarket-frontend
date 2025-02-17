# API Services Documentation

## Overview

This directory contains consolidated API-related code for the application. The structure is organized to improve maintainability and clarity.  All API calls are now made using a central `apiClient` (Axios instance) for consistent request handling and error management.

## Directory Structure

- **admin.ts**: Contains admin-related API functions.
- **auth.ts**: Contains authentication-related API functions.
- **categories.ts**: Contains category-related API functions.
- **marketplace.ts**: Contains marketplace-related API functions (includes cart functionality).
- **orders.ts**: Contains order-related API functions.
- **payment.ts**: Contains payment-related API functions.
- **reviews.ts**: Contains review-related API functions.
- **security.ts**: Contains security-related API functions.
- **staticpages.ts**: Contains static page-related API functions.
- **students.ts**: Contains student-related API functions.

## Key Changes

*   **Centralized `apiClient`:** All API calls now use the `apiClient` (Axios instance) defined in `lib/api-client.ts`. This provides consistent request interception (for authorization), response handling, and error management.
*   **Removed `fetchWrapper`:** The `fetchWrapper` function has been removed to simplify the API structure and promote the use of `apiClient`.
*   **Consolidated Files:** Several API files (e.g., `adminApi.ts`, `productApi.ts`, `cartApi.ts`, `payment.ts`) have been merged into their corresponding base files to reduce redundancy.

## Adding New API Modules

To add a new API module:

1.  Create a new TypeScript file in this directory.
2.  Implement the necessary functions and interfaces.
3.  Use `apiClient` for making API calls.
4.  Export the functions from the new file.
5.  Update the `index.ts` file to include the new module.

## Usage

Import the necessary API functions in your components or services as follows:

```typescript
import { adminApi } from './services/api';

// Example: Get dashboard data
adminApi.getDashboardData()
  .then(data => {
    // Process the data
  })
  .catch(error => {
    // Handle the error
  });
```
 ## Error Handling
All API functions should handle errors gracefully. The recommended approach is to use try...catch blocks and re-throw a custom ApiError object with a user-friendly message and appropriate status code.

## Conclusion
This structure aims to provide a clear and maintainable organization for API-related code, making it easier for developers to navigate and extend the API functionalities in the future.

**Key Changes and Notes:**

*   **Updated File List:** The file list reflects the consolidated structure.
*   **Centralized `apiClient`:** Emphasizes the importance of using `apiClient`.
*   **Removed `fetchWrapper` Mention:** Removes any reference to the deleted `fetchWrapper`.
*   **Updated Usage Example:** Provides a clear example of how to use the API functions with `apiClient` and proper error handling.
*   **Error Handling Guidance:** Reinforces the importance of proper error handling.

**Your Turn:**

1.  Update your `api/README.md` file with the content above.