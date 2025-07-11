"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { getUserCertificates, type Certificate } from "@/lib/certificate-service"
import { CertificateDisplay } from "@/components/certificate-display"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, ChevronRight } from "lucide-react"

export default function UserCertificatesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    // Fetch user certificates
    const userCertificates = getUserCertificates(user.id)
    setCertificates(userCertificates)

    // Select the first certificate by default if available
    if (userCertificates.length > 0) {
      setSelectedCertificate(userCertificates[0])
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Certificates</h1>

      {certificates.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Certificates Yet</CardTitle>
            <CardDescription>Complete courses to earn certificates that will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Certificates are awarded upon successful completion of courses. They serve as proof of your accomplishment
              and can be shared with employers or colleagues.
            </p>
            <Button onClick={() => router.push("/courses")}>Browse Courses</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Certificates</CardTitle>
                <CardDescription>
                  {certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                        selectedCertificate?.id === cert.id ? "bg-primary/10" : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedCertificate(cert)}
                    >
                      <div className="flex items-center">
                        <Award className="h-5 w-5 mr-3 text-primary" />
                        <div>
                          <p className="font-medium">{cert.courseName}</p>
                          <p className="text-xs text-muted-foreground">
                            Issued on {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedCertificate && (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">Certificate Preview</TabsTrigger>
                  <TabsTrigger value="details">Certificate Details</TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                  <CertificateDisplay certificate={selectedCertificate} />
                </TabsContent>

                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedCertificate.courseName}</CardTitle>
                      <CardDescription>Certificate Details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Certificate ID</h3>
                          <p>{selectedCertificate.id}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Verification Code</h3>
                          <p>{selectedCertificate.verificationCode}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Recipient</h3>
                          <p>{selectedCertificate.userName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Course</h3>
                          <p>{selectedCertificate.courseName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Instructor</h3>
                          <p>{selectedCertificate.instructorName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
                          <p>{new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                        </div>
                        {selectedCertificate.expiryDate && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
                            <p>{new Date(selectedCertificate.expiryDate).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="pt-4">
                          <Button
                            variant="outline"
                            onClick={() =>
                              window.open(`/certificates/verify?code=${selectedCertificate.verificationCode}`, "_blank")
                            }
                          >
                            Verify Certificate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
