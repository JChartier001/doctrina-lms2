"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Check, Clock, Users, ShoppingCart, MessageSquare } from "lucide-react"
import { getUserPurchases } from "@/lib/payment-service"

// Mock data for the course
const courseData = {
  id: "1",
  title: "Introduction to Medical Aesthetics",
  description: "Learn the fundamentals of medical aesthetics in this comprehensive course.",
  longDescription: `This comprehensive course is designed for medical professionals who want to build a strong foundation in medical aesthetics.

Over the course of 8 weeks, you'll learn from industry experts through a combination of video lessons, live demonstrations, interactive workshops, and hands-on training opportunities.

The curriculum is structured to provide a systematic progression from basic principles to specialized applications, ensuring that you develop the knowledge, skills, and confidence needed to excel in the field of medical aesthetics.`,
  image: "/placeholder.svg?height=400&width=800",
  duration: "8 weeks",
  lessons: 24,
  students: 156,
  level: "Beginner",
  pricing: {
    oneTime: 99.99,
  },
  tags: ["Fundamentals", "Botox", "Fillers"],
  whatYouWillLearn: [
    "Comprehensive facial anatomy with focus on aesthetic implications",
    "Basic injection techniques for FDA-approved neurotoxins and dermal fillers",
    "Patient assessment and treatment planning",
    "Medical aesthetic practice fundamentals",
    "Legal and regulatory considerations in aesthetic medicine",
  ],
  requirements: [
    "Must be a licensed medical professional (MD, DO, NP, PA, RN, or equivalent)",
    "Basic understanding of facial anatomy",
    "Computer with internet access for online components",
  ],
  instructor: {
    id: "1",
    name: "Dr. Sarah Johnson",
    image: "/placeholder.svg?height=100&width=100",
    title: "Board-Certified Dermatologist",
    bio: "With over 15 years of experience in medical aesthetics, Dr. Johnson specializes in advanced injection techniques and has trained over 500 medical professionals.",
  },
  curriculum: [
    {
      title: "Foundations of Medical Aesthetics",
      lessons: [
        { title: "Introduction to Medical Aesthetics", duration: "45 min", type: "video" },
        { title: "Applied Facial Anatomy", duration: "1.5 hrs", type: "video" },
        { title: "Patient Assessment and Photography", duration: "1 hr", type: "video" },
        { title: "Foundations Quiz", duration: "30 min", type: "quiz" },
      ],
    },
    {
      title: "Neurotoxins Basics",
      lessons: [
        { title: "Neurotoxin Pharmacology", duration: "1 hr", type: "video" },
        { title: "Basic Injection Techniques", duration: "2 hrs", type: "video" },
        { title: "Common Applications", duration: "1.5 hrs", type: "video" },
        { title: "Neurotoxin Assessment", duration: "45 min", type: "assignment" },
      ],
    },
  ],
  reviews: [
    {
      id: "1",
      user: {
        name: "Dr. James Wilson",
        image: "/placeholder.svg?height=40&width=40",
      },
      rating: 5,
      date: "2023-04-15",
      content:
        "This course has transformed my practice. The comprehensive approach covers everything from basic principles to practical applications. The instructor is excellent and the content is well-structured.",
    },
    {
      id: "2",
      user: {
        name: "Dr. Lisa Martinez",
        image: "/placeholder.svg?height=40&width=40",
      },
      rating: 4,
      date: "2023-03-22",
      content:
        "Great introduction to medical aesthetics with good attention to detail, especially in facial anatomy and injection techniques.",
    },
  ],
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [hasPurchased, setHasPurchased] = useState(false)

  // Check if user has already purchased this course
  useEffect(() => {
    if (isLoading || !user) return

    const purchases = getUserPurchases(user.id)
    const purchased = purchases.some((p) => p.courseId === params.id)
    setHasPurchased(purchased)
  }, [user, isLoading, params.id])

  const handleEnroll = () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (hasPurchased) {
      // If already purchased, go directly to course content
      router.push(`/courses/${params.id}/learn`)
      return
    }

    // Otherwise, redirect to checkout
    router.push(`/checkout/${params.id}`)
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {courseData.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold">{courseData.title}</h1>
            <p className="text-xl text-muted-foreground">{courseData.description}</p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent">
                <Clock className="h-5 w-5 mb-1" />
                <span className="text-sm font-medium">{courseData.duration}</span>
                <span className="text-xs text-muted-foreground">Duration</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent">
                <Check className="h-5 w-5 mb-1" />
                <span className="text-sm font-medium">{courseData.lessons} Lessons</span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-accent">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-sm font-medium">{courseData.students}+ Students</span>
                <span className="text-xs text-muted-foreground">Enrolled</span>
              </div>
            </div>

            <img
              src={courseData.image || "/placeholder.svg"}
              alt={courseData.title}
              className="w-full rounded-lg object-cover aspect-video mt-6"
            />
          </div>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Course Enrollment</CardTitle>
              <CardDescription>One-time payment for lifetime access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <span className="text-3xl font-bold">${courseData.pricing.oneTime}</span>
              </div>

              <Button className="w-full" size="lg" onClick={handleEnroll}>
                {hasPurchased ? (
                  "Continue Learning"
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Now
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">30-day money-back guarantee. Cancel anytime.</p>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">This course includes:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    {courseData.lessons} comprehensive lessons
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    10+ hours of video content
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Downloadable resources and templates
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Lifetime access
                  </li>
                  <li className="flex items-center text-sm">
                    <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                    Discussion forums
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="prose max-w-none">
            <h2>About This Course</h2>
            <p className="whitespace-pre-line">{courseData.longDescription}</p>

            <h2>What You Will Learn</h2>
            <ul>
              {courseData.whatYouWillLearn.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <h2>Requirements</h2>
            <ul>
              {courseData.requirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>

          <div className="space-y-4">
            {courseData.curriculum.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>
                    {section.lessons.length} lessons •{" "}
                    {section.lessons.reduce((total, lesson) => {
                      const time = lesson.duration.split(" ")
                      let minutes = 0
                      if (time[1] === "min") minutes = Number.parseInt(time[0])
                      if (time[1] === "hrs" || time[1] === "hr") minutes = Number.parseInt(time[0]) * 60
                      return total + minutes
                    }, 0) / 60}{" "}
                    hours total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="flex justify-between items-center p-3 rounded-lg hover:bg-accent"
                      >
                        <div className="flex items-center">
                          {lesson.type === "video" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 mr-3 text-primary"
                            >
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          )}
                          {lesson.type === "quiz" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 mr-3 text-primary"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                              <path d="M12 17h.01" />
                            </svg>
                          )}
                          {lesson.type === "assignment" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 mr-3 text-primary"
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          )}
                          <span>{lesson.title}</span>
                        </div>
                        <div className="flex items-center">
                          <Badge variant="outline">{lesson.type}</Badge>
                          <span className="ml-4 text-sm text-muted-foreground">{lesson.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instructor" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Meet Your Instructor</h2>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={courseData.instructor.image || "/placeholder.svg"}
                    alt={courseData.instructor.name}
                  />
                  <AvatarFallback>{courseData.instructor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{courseData.instructor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{courseData.instructor.title}</p>
                  <p>{courseData.instructor.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Student Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-yellow-500"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className="font-medium">4.5 out of 5</span>
              <span className="text-muted-foreground">({courseData.reviews.length} reviews)</span>
            </div>
          </div>

          <div className="space-y-6">
            {courseData.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.user.image || "/placeholder.svg"} alt={review.user.name} />
                        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.user.name}</p>
                        <p className="text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill={star <= review.rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-yellow-500"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4">{review.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discussions" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Course Discussions</h2>
            <Button onClick={() => router.push(`/courses/${params.id}/discussions`)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              View All Discussions
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="text-center py-8">
                Join the discussion to ask questions, share insights, and connect with fellow students.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => router.push(`/courses/${params.id}/discussions`)}>Go to Discussion Forum</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
