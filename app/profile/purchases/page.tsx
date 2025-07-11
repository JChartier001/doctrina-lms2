"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getUserPurchases } from "@/lib/payment-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, CreditCard, Calendar, Clock } from "lucide-react"
import Link from "next/link"

export default function PurchasesPage() {
  const { user, isLoading } = useAuth()
  const [purchases, setPurchases] = useState<any[]>([])

  useEffect(() => {
    if (isLoading || !user) return

    const userPurchases = getUserPurchases(user.id)
    setPurchases(userPurchases)
  }, [user, isLoading])

  if (isLoading) {
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

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your purchase history.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login?redirect=/profile/purchases">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Purchase History</h1>

      {purchases.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Purchases Yet</CardTitle>
            <CardDescription>You haven't made any purchases yet. Browse our courses to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{purchase.courseName}</CardTitle>
                    <CardDescription>Order ID: {purchase.id}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${purchase.amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(purchase.created).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center text-sm">
                      <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">
                        {purchase.paymentIntent?.paymentMethod?.type.replace("_", " ")}
                        {purchase.paymentIntent?.paymentMethod?.last4 &&
                          ` (**** ${purchase.paymentIntent.paymentMethod.last4})`}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Purchased on {new Date(purchase.created).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Lifetime access</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button asChild>
                      <Link href={`/courses/${purchase.courseId}`}>
                        Access Course
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
