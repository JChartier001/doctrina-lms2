"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  getUpcomingSessions,
  getPastSessions,
  createLiveSession,
  startSession,
  cancelSession,
} from "@/lib/live-session-service"
import { Clock, Users, Video, VideoOff } from "lucide-react"

export default function InstructorLiveSessionsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSession, setNewSession] = useState({
    title: "",
    description: "",
    scheduledFor: new Date(),
    duration: 60,
    isRecorded: true,
    maxParticipants: 100,
  })
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Get sessions from the service
  const upcomingSessions = getUpcomingSessions()
  const pastSessions = getPastSessions()

  const handleCreateSession = () => {
    if (!user) return

    if (!newSession.title || !newSession.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    createLiveSession({
      title: newSession.title,
      description: newSession.description,
      instructorId: user.id,
      instructorName: user.name,
      instructorImage: user.image || "/placeholder.svg?height=40&width=40",
      scheduledFor: newSession.scheduledFor,
      duration: newSession.duration,
      isRecorded: newSession.isRecorded,
      maxParticipants: newSession.maxParticipants,
    })

    toast({
      title: "Session created",
      description: "Your live session has been scheduled",
    })

    setIsCreateDialogOpen(false)
    setNewSession({
      title: "",
      description: "",
      scheduledFor: new Date(),
      duration: 60,
      isRecorded: true,
      maxParticipants: 100,
    })
  }

  const handleStartSession = (sessionId: string) => {
    startSession(sessionId)
    router.push(`/live/${sessionId}`)
  }

  const handleCancelSession = (sessionId: string) => {
    cancelSession(sessionId)
    toast({
      title: "Session cancelled",
      description: "The live session has been cancelled",
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Sessions</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Video className="mr-2 h-4 w-4" />
              Create New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create a New Live Session</DialogTitle>
              <DialogDescription>
                Schedule a live session for your students. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="e.g., Advanced Botox Techniques Q&A"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="Describe what will be covered in this session..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Date & Time</Label>
                  <div className="flex flex-col space-y-2">
                    <Calendar
                      mode="single"
                      selected={newSession.scheduledFor}
                      onSelect={(date) => date && setNewSession({ ...newSession, scheduledFor: date })}
                      className="rounded-md border"
                    />
                    <div className="flex gap-2">
                      <Select
                        value={newSession.scheduledFor.getHours().toString().padStart(2, "0")}
                        onValueChange={(value) => {
                          const newDate = new Date(newSession.scheduledFor)
                          newDate.setHours(Number.parseInt(value))
                          setNewSession({ ...newSession, scheduledFor: newDate })
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={newSession.scheduledFor.getMinutes().toString().padStart(2, "0")}
                        onValueChange={(value) => {
                          const newDate = new Date(newSession.scheduledFor)
                          newDate.setMinutes(Number.parseInt(value))
                          setNewSession({ ...newSession, scheduledFor: newDate })
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Minute" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={newSession.duration.toString()}
                      onValueChange={(value) => setNewSession({ ...newSession, duration: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">120 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxParticipants">Maximum Participants</Label>
                    <Select
                      value={newSession.maxParticipants.toString()}
                      onValueChange={(value) =>
                        setNewSession({ ...newSession, maxParticipants: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select max participants" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50 participants</SelectItem>
                        <SelectItem value="100">100 participants</SelectItem>
                        <SelectItem value="150">150 participants</SelectItem>
                        <SelectItem value="200">200 participants</SelectItem>
                        <SelectItem value="300">300 participants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="record"
                      checked={newSession.isRecorded}
                      onCheckedChange={(checked) => setNewSession({ ...newSession, isRecorded: checked })}
                    />
                    <Label htmlFor="record">Record session</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>Create Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <VideoOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">You don't have any upcoming sessions</p>
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  Create New Session
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>
                        {new Date(session.scheduledFor).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(session.scheduledFor).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{session.duration} min</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{session.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {session.duration} minutes
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {session.participants.length} / {session.maxParticipants} participants
                    </div>
                    {session.isRecorded && (
                      <div className="flex items-center">
                        <Video className="mr-1 h-4 w-4" />
                        Will be recorded
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => handleCancelSession(session.id)}>
                    Cancel Session
                  </Button>
                  <Button onClick={() => handleStartSession(session.id)}>Start Session</Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <VideoOff className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">You don't have any past sessions</p>
              </CardContent>
            </Card>
          ) : (
            pastSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>
                        {new Date(session.scheduledFor).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {new Date(session.scheduledFor).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{session.duration} min</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{session.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {session.duration} minutes
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      {session.participants.length} participants attended
                    </div>
                  </div>
                  {session.recordingUrl && (
                    <Button className="w-full" variant="outline">
                      View Recording
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Calendar</CardTitle>
              <CardDescription>View and manage your live session schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                </div>
                <div className="md:w-1/2">
                  <h3 className="font-medium mb-4">
                    Sessions on{" "}
                    {date?.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>

                  {upcomingSessions.some(
                    (session) => new Date(session.scheduledFor).toDateString() === date?.toDateString(),
                  ) ? (
                    upcomingSessions
                      .filter((session) => new Date(session.scheduledFor).toDateString() === date?.toDateString())
                      .map((session) => (
                        <div key={session.id} className="mb-4 p-4 border rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{session.title}</h4>
                            <Badge variant="outline">
                              {new Date(session.scheduledFor).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {session.participants.length} / {session.maxParticipants} participants
                          </p>
                          <Button size="sm" onClick={() => handleStartSession(session.id)}>
                            Start Session
                          </Button>
                        </div>
                      ))
                  ) : (
                    <div className="text-center p-6 border rounded-lg border-dashed">
                      <p className="text-muted-foreground">No sessions scheduled for this day</p>
                      <Button className="mt-4" variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                        Create Session
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
