import { useQuery, useMutation } from 'convex/react';
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

// Legacy functions for backward compatibility (deprecated - use hooks instead)

// Simulate creating a checkout session (deprecated)
export async function createCheckoutSession(
	courseId: string,
	courseName: string,
	amount: number
): Promise<CheckoutSession> {
	// This function is deprecated - use useCreatePurchase mutation hook instead
	console.warn(
		'createCheckoutSession is deprecated. Use useCreatePurchase mutation hook instead.'
	);
	throw new Error(
		'This function is deprecated. Use the Convex mutation hook instead.'
	);
}

// Simulate processing a payment (deprecated)
export async function processPayment(
	sessionId: string,
	paymentDetails: {
		cardNumber: string;
		cardExpiry: string;
		cardCvc: string;
		name: string;
		email: string;
	}
): Promise<PaymentIntent> {
	// This function is deprecated - use payment processing integration instead
	console.warn('processPayment is deprecated. Use proper payment integration.');
	throw new Error(
		'This function is deprecated. Use proper payment processing.'
	);
}

// Helper function to determine card brand from number
function getCardBrand(cardNumber: string): string {
	// Very simplified version
	if (cardNumber.startsWith('4')) return 'visa';
	if (cardNumber.startsWith('5')) return 'mastercard';
	if (cardNumber.startsWith('3')) return 'amex';
	if (cardNumber.startsWith('6')) return 'discover';
	return 'unknown';
}

// Get stored checkout sessions from localStorage (deprecated)
export function getStoredSessions(): CheckoutSession[] {
	// This function is deprecated - use useUserPurchases hook instead
	console.warn(
		'getStoredSessions is deprecated. Use useUserPurchases hook instead.'
	);
	if (typeof window === 'undefined') return [];

	const sessions = localStorage.getItem('checkout_sessions');
	return sessions ? JSON.parse(sessions) : [];
}

// Store a checkout session in localStorage (deprecated)
export function storeSession(session: CheckoutSession): void {
	// This function is deprecated - use Convex mutations instead
	console.warn('storeSession is deprecated. Use Convex mutations instead.');
	if (typeof window === 'undefined') return;

	const sessions = getStoredSessions();
	const updatedSessions = [
		session,
		...sessions.filter(s => s.id !== session.id),
	];
	localStorage.setItem('checkout_sessions', JSON.stringify(updatedSessions));
}

// Get user's purchase history (deprecated)
export function getUserPurchases(userId: string): CheckoutSession[] {
	// This function is deprecated - use useUserPurchases hook instead
	console.warn(
		'getUserPurchases is deprecated. Use useUserPurchases hook instead.'
	);
	const sessions = getStoredSessions();
	return sessions.filter(session => session.status === 'complete');
}
