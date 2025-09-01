import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68b47f6e4f9f091cdcc1a01e", 
  requiresAuth: true // Ensure authentication is required for all operations
});
