"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-toastify"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  const { user, role } = useAuth()
  const router = useRouter()

  // Form state
  const [emailNotifications, setEmailNotifications] = useState({
    courseUpdates: true,
    discussionMentions: true,
    newMessages: true,
    promotions: false,
  })

  const [language, setLanguage] = useState("english")
  const [timezone, setTimezone] = useState("America/New_York")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/sign-in")
    }
  }, [user, router])

  const handleSaveNotifications = () => {
    toast.success("Notification settings updated. Your notification preferences have been saved.");
  }

  const handleSavePreferences = () => {
    toast.success("Preferences updated. Your account preferences have been saved.");
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match. Please make sure your new password and confirmation match.");
      return
    }

    toast.success("Password updated. Your password has been changed successfully.");

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="account" className="w-full">
        <div className="flex">
          <div className="w-[200px] mr-6">
            <TabsList className="flex flex-col items-start h-auto p-0 bg-transparent">
              <TabsTrigger value="account" className="w-full justify-start px-2 data-[state=active]:bg-muted">
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start px-2 data-[state=active]:bg-muted">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="w-full justify-start px-2 data-[state=active]:bg-muted">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start px-2 data-[state=active]:bg-muted">
                Security
              </TabsTrigger>
              <TabsTrigger value="billing" className="w-full justify-start px-2 data-[state=active]:bg-muted">
                Billing
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1">
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Manage your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user.name} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Input id="role" value={role ? role.charAt(0).toUpperCase() + role.slice(1) : "Student"} disabled />
                    <p className="text-sm text-muted-foreground">
                      {role === "student"
                        ? "If you're a licensed medical professional and want to become an instructor, please contact support."
                        : "You have instructor privileges on this platform."}
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profileImage">Profile Image</Label>
                      <Button variant="outline" size="sm">
                        Upload New
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <img
                        src={user.image || "/placeholder.svg"}
                        alt={user.name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                      <div className="text-sm text-muted-foreground">
                        Recommended dimensions: 400x400 pixels
                        <br />
                        Maximum file size: 2MB
                        <br />
                        Supported formats: JPG, PNG
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Control how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Course Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about updates to your enrolled courses
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications.courseUpdates}
                        onCheckedChange={(checked) =>
                          setEmailNotifications({
                            ...emailNotifications,
                            courseUpdates: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Discussion Mentions</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when someone mentions you in a discussion
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications.discussionMentions}
                        onCheckedChange={(checked) =>
                          setEmailNotifications({
                            ...emailNotifications,
                            discussionMentions: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>New Messages</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications about new direct messages</p>
                      </div>
                      <Switch
                        checked={emailNotifications.newMessages}
                        onCheckedChange={(checked) =>
                          setEmailNotifications({
                            ...emailNotifications,
                            newMessages: checked,
                          })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Promotions and Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive promotional emails and platform updates</p>
                      </div>
                      <Switch
                        checked={emailNotifications.promotions}
                        onCheckedChange={(checked) =>
                          setEmailNotifications({
                            ...emailNotifications,
                            promotions: checked,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveNotifications}>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Account Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="spanish">Spanish</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                        <SelectItem value="german">German</SelectItem>
                        <SelectItem value="japanese">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Theme</Label>
                        <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                      </div>
                      <Select defaultValue="system">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSavePreferences}>Save Preferences</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button type="submit">Change Password</Button>
                    </div>
                  </form>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-medium mb-2 text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Manage your subscription and payment methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Current Plan</h3>
                    <div className="rounded-md border p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Premium Membership</p>
                          <p className="text-sm text-muted-foreground">$29.99/month</p>
                          <p className="text-sm mt-2">Next billing date: June 15, 2023</p>
                        </div>
                        <Button variant="outline">Upgrade Plan</Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Payment Methods</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-md border p-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-slate-100 p-2">
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
                              className="h-4 w-4"
                            >
                              <rect width="20" height="14" x="2" y="5" rx="2" />
                              <line x1="2" x2="22" y1="10" y2="10" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Visa ending in 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 04/2025</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-3">
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
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Add Payment Method
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Billing History</h3>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-4 font-medium border-b">
                        <div>Date</div>
                        <div>Description</div>
                        <div>Amount</div>
                        <div className="text-right">Receipt</div>
                      </div>
                      <div className="divide-y">
                        <div className="grid grid-cols-4 p-4">
                          <div>May 15, 2023</div>
                          <div>Premium Membership</div>
                          <div>$29.99</div>
                          <div className="text-right">
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 p-4">
                          <div>Apr 15, 2023</div>
                          <div>Premium Membership</div>
                          <div>$29.99</div>
                          <div className="text-right">
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 p-4">
                          <div>Mar 15, 2023</div>
                          <div>Premium Membership</div>
                          <div>$29.99</div>
                          <div className="text-right">
                            <Button variant="ghost" size="sm">
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
