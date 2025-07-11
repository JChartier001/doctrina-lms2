"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getStoredSessions } from "@/lib/payment-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")

  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    if (!sessionId) {
      router.push("/dashboard")
      return
    }

    const sessions = getStoredSessions()
    const foundSession = sessions.find((s) => s.id === sessionId)

    if (!foundSession) {
      router.push("/dashboard")
      return
    }

    setSession(foundSession)
  }, [sessionId, router])

  if (!session) {
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
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Thank you for your purchase. Your order has been processed successfully.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Order Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Course:</div>
                <div>{session.courseName}</div>

                <div className="text-muted-foreground">Order ID:</div>
                <div className="font-mono text-xs">{session.id}</div>

                <div className="text-muted-foreground">Date:</div>
                <div>{new Date(session.created).toLocaleDateString()}</div>

                <div className="text-muted-foreground">Amount:</div>
                <div>${session.amount.toFixed(2)}</div>

                <div className="text-muted-foreground">Payment Method:</div>
                <div className="capitalize">
                  {session.paymentIntent?.paymentMethod?.type.replace("_", " ")}
                  {session.paymentIntent?.paymentMethod?.last4 &&
                    ` (**** ${session.paymentIntent.paymentMethod.last4})`}
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-medium text-green-800 mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You now have full access to "{session.courseName}"</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You can access your course from your dashboard or the "My Courses" section</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>A receipt has been sent to your email address</span>
                </li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center gap-4">
            <Button asChild>
              <Link href={`/courses/${session.courseId}`}>
                Go to Course
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
