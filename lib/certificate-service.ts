import { v4 as uuidv4 } from "uuid"

// Certificate types
export interface Certificate {
  id: string
  userId: string
  userName: string
  courseId: string
  courseName: string
  instructorId: string
  instructorName: string
  issueDate: string
  expiryDate?: string
  verificationCode: string
  templateId: string
}

// Certificate template types
export interface CertificateTemplate {
  id: string
  name: string
  description: string
  imageUrl: string
  primaryColor: string
  secondaryColor: string
  badgeUrl?: string
}

// Mock certificate templates
const certificateTemplates: CertificateTemplate[] = [
  {
    id: "template-1",
    name: "Standard Certificate",
    description: "Standard certificate for course completion",
    imageUrl: "/placeholder.svg?height=600&width=800",
    primaryColor: "#4f46e5",
    secondaryColor: "#818cf8",
  },
  {
    id: "template-2",
    name: "Advanced Certificate",
    description: "Certificate for advanced course completion",
    imageUrl: "/placeholder.svg?height=600&width=800",
    primaryColor: "#0891b2",
    secondaryColor: "#22d3ee",
    badgeUrl: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "template-3",
    name: "Specialist Certificate",
    description: "Certificate for specialist course completion",
    imageUrl: "/placeholder.svg?height=600&width=800",
    primaryColor: "#7c3aed",
    secondaryColor: "#a78bfa",
    badgeUrl: "/placeholder.svg?height=100&width=100",
  },
]

// Mock certificates storage
let certificates: Certificate[] = [
  {
    id: "cert-1",
    userId: "3", // student user ID
    userName: "Michael Chen",
    courseId: "1",
    courseName: "Advanced Botox Techniques",
    instructorId: "2",
    instructorName: "Dr. Sarah Johnson",
    issueDate: "2023-04-15",
    verificationCode: "DOCTRINA-ABC123",
    templateId: "template-1",
  },
  {
    id: "cert-2",
    userId: "3", // student user ID
    userName: "Michael Chen",
    courseId: "2",
    courseName: "Dermal Fillers Masterclass",
    instructorId: "2",
    instructorName: "Dr. Sarah Johnson",
    issueDate: "2023-05-20",
    verificationCode: "DOCTRINA-DEF456",
    templateId: "template-2",
  },
]

// Get all certificates for a user
export function getUserCertificates(userId: string): Certificate[] {
  return certificates.filter((cert) => cert.userId === userId)
}

// Get a specific certificate by ID
export function getCertificateById(certId: string): Certificate | undefined {
  return certificates.find((cert) => cert.id === certId)
}

// Verify a certificate by verification code
export function verifyCertificate(verificationCode: string): Certificate | undefined {
  return certificates.find((cert) => cert.verificationCode === verificationCode)
}

// Generate a new certificate
export function generateCertificate(
  userId: string,
  userName: string,
  courseId: string,
  courseName: string,
  instructorId: string,
  instructorName: string,
  templateId = "template-1",
): Certificate {
  // Check if certificate already exists
  const existingCert = certificates.find((cert) => cert.userId === userId && cert.courseId === courseId)

  if (existingCert) {
    return existingCert
  }

  // Generate a unique verification code
  const verificationCode = `DOCTRINA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

  const newCertificate: Certificate = {
    id: `cert-${uuidv4()}`,
    userId,
    userName,
    courseId,
    courseName,
    instructorId,
    instructorName,
    issueDate: new Date().toISOString().split("T")[0],
    verificationCode,
    templateId,
  }

  certificates.push(newCertificate)
  return newCertificate
}

// Get a certificate template
export function getCertificateTemplate(templateId: string): CertificateTemplate | undefined {
  return certificateTemplates.find((template) => template.id === templateId)
}

// Get all certificate templates
export function getAllCertificateTemplates(): CertificateTemplate[] {
  return certificateTemplates
}

// Delete a certificate (admin function)
export function deleteCertificate(certId: string): boolean {
  const initialLength = certificates.length
  certificates = certificates.filter((cert) => cert.id !== certId)
  return certificates.length < initialLength
}

// Check if a user has a certificate for a specific course
export function userHasCertificate(userId: string, courseId: string): boolean {
  return certificates.some((cert) => cert.userId === userId && cert.courseId === courseId)
}
