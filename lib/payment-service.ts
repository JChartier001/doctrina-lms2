// This is a simulated payment service
// In a production environment, this would integrate with Stripe, PayPal, etc.

export type PaymentMethod = {
  id: string
  type: "credit_card" | "paypal"
  last4?: string
  expiryMonth?: string
  expiryYear?: string
  cardBrand?: string
  email?: string
}

export type PaymentIntent = {
  id: string
  amount: number
  currency: string
  status: "pending" | "processing" | "succeeded" | "failed"
  created: number
  paymentMethod?: PaymentMethod
}

export type CheckoutSession = {
  id: string
  courseId: string
  courseName: string
  amount: number
  currency: string
  status: "open" | "complete" | "expired"
  created: number
  paymentIntent?: PaymentIntent
}

// Simulate creating a checkout session
export async function createCheckoutSession(
  courseId: string,
  courseName: string,
  amount: number,
): Promise<CheckoutSession> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    id: `cs_${Math.random().toString(36).substring(2, 15)}`,
    courseId,
    courseName,
    amount,
    currency: "USD",
    status: "open",
    created: Date.now(),
  }
}

// Simulate processing a payment
export async function processPayment(
  sessionId: string,
  paymentDetails: {
    cardNumber: string
    cardExpiry: string
    cardCvc: string
    name: string
    email: string
  },
): Promise<PaymentIntent> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulate payment processing
  const success = Math.random() > 0.1 // 90% success rate

  if (!success) {
    throw new Error("Payment failed. Please try again.")
  }

  const paymentIntent: PaymentIntent = {
    id: `pi_${Math.random().toString(36).substring(2, 15)}`,
    amount: 0, // Will be updated with session amount
    currency: "USD",
    status: "succeeded",
    created: Date.now(),
    paymentMethod: {
      id: `pm_${Math.random().toString(36).substring(2, 15)}`,
      type: "credit_card",
      last4: paymentDetails.cardNumber.slice(-4),
      expiryMonth: paymentDetails.cardExpiry.split("/")[0],
      expiryYear: paymentDetails.cardExpiry.split("/")[1],
      cardBrand: getCardBrand(paymentDetails.cardNumber),
    },
  }

  return paymentIntent
}

// Helper function to determine card brand from number
function getCardBrand(cardNumber: string): string {
  // Very simplified version
  if (cardNumber.startsWith("4")) return "visa"
  if (cardNumber.startsWith("5")) return "mastercard"
  if (cardNumber.startsWith("3")) return "amex"
  if (cardNumber.startsWith("6")) return "discover"
  return "unknown"
}

// Get stored checkout sessions from localStorage
export function getStoredSessions(): CheckoutSession[] {
  if (typeof window === "undefined") return []

  const sessions = localStorage.getItem("checkout_sessions")
  return sessions ? JSON.parse(sessions) : []
}

// Store a checkout session in localStorage
export function storeSession(session: CheckoutSession): void {
  if (typeof window === "undefined") return

  const sessions = getStoredSessions()
  const updatedSessions = [session, ...sessions.filter((s) => s.id !== session.id)]
  localStorage.setItem("checkout_sessions", JSON.stringify(updatedSessions))
}

// Get user's purchase history
export function getUserPurchases(userId: string): CheckoutSession[] {
  const sessions = getStoredSessions()
  return sessions.filter((session) => session.status === "complete")
}
