"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { createCheckoutSession, processPayment, storeSession } from "@/lib/payment-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, CreditCard, Lock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock course data - in a real app, this would be fetched from an API
const coursesData = {
  "1": {
    id: "1",
    title: "Introduction to Medical Aesthetics",
    description: "Learn the fundamentals of medical aesthetics in this comprehensive course.",
    price: 99.99,
    image: "/placeholder.svg?height=200&width=300",
    instructor: "Dr. Sarah Johnson",
  },
  "2": {
    id: "2",
    title: "Advanced Botox Techniques",
    description: "Master advanced Botox injection techniques with hands-on demonstrations.",
    price: 149.99,
    image: "/placeholder.svg?height=200&width=300",
    instructor: "Dr. Michael Chen",
  },
  "3": {
    id: "3",
    title: "Dermal Fillers Masterclass",
    description: "Comprehensive training on dermal fillers application and techniques.",
    price: 199.99,
    image: "/placeholder.svg?height=200&width=300",
    instructor: "Dr. Emily Rodriguez",
  },
}

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }

  // Format card expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }

    return value
  }

  // Initialize checkout session
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push(`/login?redirect=/checkout/${courseId}`)
      return
    }

    const fetchCourse = async () => {
      // In a real app, this would be an API call
      const courseData = coursesData[courseId as keyof typeof coursesData]

      if (!courseData) {
        toast({
          title: "Course not found",
          description: "The requested course could not be found.",
          variant: "destructive",
        })
        router.push("/courses")
        return
      }

      setCourse(courseData)
      setEmail(user.email || "")
      setName(user.name || "")

      try {
        const session = await createCheckoutSession(courseData.id, courseData.title, courseData.price)
        setSessionId(session.id)
        storeSession(session)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to initialize checkout. Please try again.",
          variant: "destructive",
        })
      }

      setLoading(false)
    }

    fetchCourse()
  }, [courseId, user, isLoading, router, toast])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionId || !course) return

    setProcessing(true)

    try {
      // Process payment
      const paymentIntent = await processPayment(sessionId, {
        cardNumber,
        cardExpiry,
        cardCvc,
        name,
        email,
      })

      // Update session in storage
      const updatedSession = {
        id: sessionId,
        courseId: course.id,
        courseName: course.title,
        amount: course.price,
        currency: "USD",
        status: "complete" as const,
        created: Date.now(),
        paymentIntent,
      }

      storeSession(updatedSession)

      // Redirect to success page
      router.push(`/checkout/success?session=${sessionId}`)
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
      setProcessing(false)
    }
  }

  if (loading || !course) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-[300px]"></div>
            <div className="h-64 bg-muted rounded w-[600px]"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Course
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Checkout</CardTitle>
              <CardDescription>Complete your purchase to gain access to this course</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="card">
                <TabsList className="mb-6">
                  <TabsTrigger value="card">Credit Card</TabsTrigger>
                  <TabsTrigger value="paypal" disabled>
                    PayPal
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="card">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Cardholder Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Smith"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                            required
                          />
                          <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Lock className="h-4 w-4 mr-2" />
                      Your payment information is secure and encrypted
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={processing}>
                      {processing ? "Processing..." : `Pay $${course.price.toFixed(2)}`}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">By {course.instructor}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Course Price</span>
                  <span>${course.price.toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${course.price.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/50 text-sm">
              <p>By completing your purchase, you agree to our Terms of Service and Privacy Policy.</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
