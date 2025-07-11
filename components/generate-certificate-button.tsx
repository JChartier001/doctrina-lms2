"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateCertificate } from "@/lib/certificate-service"

interface GenerateCertificateButtonProps {
  courseId: string
  courseName: string
  instructorId: string
  instructorName: string
  disabled?: boolean
  onSuccess?: () => void
}

export function GenerateCertificateButton({
  courseId,
  courseName,
  instructorId,
  instructorName,
  disabled = false,
  onSuccess,
}: GenerateCertificateButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateCertificate = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsGenerating(true)

    try {
      // Generate certificate
      const certificate = generateCertificate(user.id, user.name, courseId, courseName, instructorId, instructorName)

      toast({
        title: "Certificate Generated",
        description: "Your certificate has been generated successfully.",
      })

      // Navigate to certificate view
      router.push(`/profile/certificates?certId=${certificate.id}`)

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error generating certificate:", error)
      toast({
        title: "Error",
        description: "There was an error generating your certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleGenerateCertificate} disabled={disabled || isGenerating} className="flex items-center">
      <Award className="mr-2 h-4 w-4" />
      {isGenerating ? "Generating Certificate..." : "Generate Certificate"}
    </Button>
  )
}
