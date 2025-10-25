import { useMutation, useQuery } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

// Payment types - keeping some for UI compatibility
export type PaymentMethod = {
	id: string;
	type: 'credit_card' | 'paypal';
	last4?: string;
	expiryMonth?: string;
	expiryYear?: string;
	cardBrand?: string;
	email?: string;
};

export type PaymentIntent = {
	id: string;
	amount: number;
	currency: string;
	status: 'pending' | 'processing' | 'succeeded' | 'failed';
	created: number;
	paymentMethod?: PaymentMethod;
};

export type CheckoutSession = {
	id: string;
	courseId: string;
	courseName: string;
	amount: number;
	currency: string;
	status: 'open' | 'complete' | 'expired';
	created: number;
	paymentIntent?: PaymentIntent;
};

// React hooks for Convex integration

// Get purchases for a user
export function useUserPurchases(userId?: Id<'users'>) {
	return useQuery(api.purchases.listForUser, userId ? { userId } : 'skip');
}

// Create a purchase mutation
export function useCreatePurchase() {
	return useMutation(api.purchases.create);
}

// Complete a purchase mutation
export function useCompletePurchase() {
	return useMutation(api.purchases.complete);
}

// Expire a purchase mutation
export function useExpirePurchase() {
	return useMutation(api.purchases.expire);
}
