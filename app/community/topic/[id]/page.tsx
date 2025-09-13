"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for topic
const topicData = {
  id: "1",
  title: "Best practices for dermal fillers in male patients",
  content: `I'm looking to improve my techniques for male patients requesting dermal fillers. My current practice primarily serves female clients, but I've seen an increase in male patients seeking aesthetic treatments.

Male facial anatomy and aesthetic goals can differ significantly from female patients. I'm particularly interested in:

1. Injection techniques for male jawlines and chins
2. Appropriate filler types and volumes for male patients
3. Consultation approaches specific to male aesthetic goals
4. Before/after examples that show natural results for men

Has anyone specialized in this area or taken courses specifically on male aesthetics? Any resources or personal experiences would be greatly appreciated!`,
  author: {
    name: "Dr. Sarah Johnson",
    image: "/placeholder.svg?height=40&width=40",
    specialization: "Dermatology",
    posts: 124,
  },
  date: "2023-05-10T14:30:00",
  views: 156,
  tags: ["Fillers", "Male Aesthetics", "Clinical"],
  solved: true,
  replies: [
    {
      id: "1",
      content: `Great question, Dr. Johnson. I've been seeing a similar trend in my practice. For male jawlines and chins, I've had success with higher G' fillers that can create more defined, angular results.

A few best practices I follow:
- Male patients typically need more volume but in specific, targeted areas
- Avoid over-treating the midface which can feminize male features
- Focus on structural support rather than overall volume replacement
- Advance gradually - male patients often prefer incremental improvements

I recommend checking out the "Male Aesthetics Masterclass" by Dr. Robert Thompson. It specifically addresses these techniques with plenty of before/after examples.`,
      author: {
        name: "Dr. Michael Chen",
        image: "/placeholder.svg?height=40&width=40",
        specialization: "Plastic Surgery",
        posts: 87,
      },
      date: "2023-05-10T15:45:00",
      isAnswer: true,
      likes: 12,
    },
    {
      id: "2",
      content: `I'd add that consulting with male patients often requires a different approach. In my experience, male patients:

1. Are more concerned about looking "natural" and not "done"
2. Often seek treatments for specific concerns rather than overall rejuvenation
3. May be less informed about aesthetic procedures and require more education
4. Might be more hesitant to discuss their aesthetic concerns

Setting clear expectations is key. I always show before/after photos of other male patients and explain that my goal is to enhance their masculine features, not feminize them.`,
      author: {
        name: "Dr. Emily Rodriguez",
        image: "/placeholder.svg?height=40&width=40",
        specialization: "Facial Aesthetics",
        posts: 152,
      },
      date: "2023-05-11T09:20:00",
      isAnswer: false,
      likes: 8,
    },
    {
      id: "3",
      content: `For filler types, I prefer using Radiesse for male patients, especially for jawline and chin augmentation. It provides excellent structural support and promotes collagen production. For areas requiring more finesse, I'll use a hyaluronic acid filler with a higher G'.

Regarding volumes, I typically use 1.5-2x the amount I would use for female patients for equivalent areas, but this varies significantly by individual. Always start conservatively and build up over multiple sessions if needed.`,
      author: {
        name: "Dr. James Wilson",
        image: "/placeholder.svg?height=40&width=40",
        specialization: "Cosmetic Medicine",
        posts: 67,
      },
      date: "2023-05-12T11:10:00",
      isAnswer: false,
      likes: 5,
    },
  ],
}

export default function TopicPage({ params }: { params: { id: string } }) {
  const [replyContent, setReplyContent] = useState("")
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      router.push("/sign-in")
    }
  }, [user, router])

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (replyContent.trim()) {
      toast({
        title: "Reply submitted",
        description: "Your reply has been posted to the discussion.",
      })
      setReplyContent("")
    }
  }

  const handleLikeReply = (replyId: string) => {
    toast({
      title: "Reply liked",
      description: "You've liked this reply.",
    })
  }

  const handleMarkAsAnswer = (replyId: string) => {
    toast({
      title: "Answer marked",
      description: "This reply has been marked as the answer.",
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-10">
      <Button variant="outline" onClick={() => router.push("/community")} className="mb-6">
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
          className="mr-2 h-4 w-4"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Community
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold">{topicData.title}</h1>
                {topicData.solved && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Solved
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 mb-4">
                <span>{new Date(topicData.date).toLocaleDateString()}</span>
                <span>•</span>
                <span>{topicData.views} views</span>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-center">
                  <Avatar className="h-12 w-12 mx-auto">
                    <AvatarImage src={topicData.author.image || "/placeholder.svg"} alt={topicData.author.name} />
                    <AvatarFallback>{topicData.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="mt-2">
                    <p className="font-medium text-sm">{topicData.author.name}</p>
                    <p className="text-xs text-muted-foreground">{topicData.author.specialization}</p>
                    <p className="text-xs mt-1">{topicData.author.posts} posts</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{topicData.content}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {topicData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-bold">{topicData.replies.length} Replies</h2>

          <div className="space-y-6">
            {topicData.replies.map((reply) => (
              <Card key={reply.id} className={reply.isAnswer ? "border-green-500" : ""}>
                <CardContent className="p-6">
                  {reply.isAnswer && (
                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium w-fit mb-4">
                      Accepted Answer
                    </div>
                  )}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 text-center">
                      <Avatar className="h-12 w-12 mx-auto">
                        <AvatarImage src={reply.author.image || "/placeholder.svg"} alt={reply.author.name} />
                        <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="mt-2">
                        <p className="font-medium text-sm">{reply.author.name}</p>
                        <p className="text-xs text-muted-foreground">{reply.author.specialization}</p>
                        <p className="text-xs mt-1">{reply.author.posts} posts</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-muted-foreground">
                          {new Date(reply.date).toLocaleDateString()} at {new Date(reply.date).toLocaleTimeString()}
                        </span>
                        {!reply.isAnswer && topicData.author.name === user.name && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkAsAnswer(reply.id)}>
                            Mark as Answer
                          </Button>
                        )}
                      </div>

                      <div className="prose max-w-none mt-3">
                        <p className="whitespace-pre-line">{reply.content}</p>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeReply(reply.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
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
                            className="mr-1 h-4 w-4"
                          >
                            <path d="M7 10v12" />
                            <path d="M15 5.88 14 10h5.5a2.5 2.5 0 0 0 2.5-2.5v-.03a2.5 2.5 0 0 0-.57-1.53L18.18 2a2.5 2.5 0 0 0-3.8 0l-2.37 2.46A10 10 0 0 1 14 10" />
                          </svg>
                          Like ({reply.likes})
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
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
                            className="mr-1 h-4 w-4"
                          >
                            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                          </svg>
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Leave a Reply</h2>
              <form onSubmit={handleSubmitReply}>
                <Textarea
                  placeholder="Share your thoughts or answer..."
                  className="min-h-32 mb-4"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <Button type="submit">Post Reply</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Related Topics</h3>
              <div className="space-y-3">
                <div className="group">
                  <a href="#" className="text-sm font-medium group-hover:underline">
                    Advanced techniques for cheek fillers
                  </a>
                  <p className="text-xs text-muted-foreground">8 replies • 3 days ago</p>
                </div>
                <div className="group">
                  <a href="#" className="text-sm font-medium group-hover:underline">
                    Jawline enhancement protocols
                  </a>
                  <p className="text-xs text-muted-foreground">12 replies • 5 days ago</p>
                </div>
                <div className="group">
                  <a href="#" className="text-sm font-medium group-hover:underline">
                    Patient selection for facial sculpting
                  </a>
                  <p className="text-xs text-muted-foreground">5 replies • 1 week ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Active Participants</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={topicData.author.image || "/placeholder.svg"} alt={topicData.author.name} />
                    <AvatarFallback>{topicData.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{topicData.author.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    Author
                  </Badge>
                </div>
                {topicData.replies.map((reply) => (
                  <div key={reply.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.author.image || "/placeholder.svg"} alt={reply.author.name} />
                      <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{reply.author.name}</span>
                    {reply.isAnswer && (
                      <Badge variant="outline" className="ml-auto text-xs bg-green-50 text-green-700 border-green-200">
                        Solution
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
