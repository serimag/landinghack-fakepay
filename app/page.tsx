"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Upload,
  FileCheck,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  FileSearch,
  ChevronDown,
  Info,
  Eye,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"

type VerificationStep = "upload" | "classifying" | "ai-detection" | "extracting" | "validating" | "complete"
type VerificationStatus = "idle" | "processing" | "success" | "error"

interface VerificationResult {
  status: "valid" | "invalid" | "fraudulent"
  reason?: string
  details: string[]
  detailedChecks?: Array<{
    label: string
    status: "success" | "error" | "warning"
    explanation: string
  }>
  documentType?: string
  isAIGenerated?: boolean
  extractedData?: Record<string, any>
  aiBreakdown?: {
    ai_probability: number
    fake_probability: number
    nsfw_probability: number
    class_probabilities?: Record<string, number>
  }
}

const translations = {
  es: {
    hero: {
      title: "Detecta",
      titleAccent: "Nóminas falsas",
      titleEnd: "con IA.",
      subtitle:
        "Utiliza Fakepay.ai para detectar nóminas que hayan sido modificadas o generadas usando IA y otras técnicas fraudulentas.",
    },
    upload: {
      title: "Cargar Documento",
      description: "Sube una nómina en formato PDF, PNG o JPG para verificar su autenticidad",
      dragText: "Arrastra tu archivo aquí",
      clickText: "o haz clic para seleccionar",
      selectButton: "Seleccionar archivo",
      verifyButton: "Verificar Nómina",
      cancelButton: "Cancelar",
    },
    processing: {
      title: "Verificando Documento",
      description: "Por favor espera mientras analizamos tu nómina",
      steps: {
        classifying: "Clasificación",
        aiDetection: "Comprobación GenAI",
        extracting: "Extracción de Datos",
        validating: "Validación de Datos y Controles",
      },
      status: {
        processing: "En proceso...",
        completed: "Completado",
        pending: "Pendiente",
      },
    },
    results: {
      valid: "Nómina OK",
      fraudulent: "Documento Fraudulento",
      invalid: "Documento No Válido",
      validDesc: "La nómina ha pasado todas las verificaciones",
      checksTitle: "Comprobaciones Realizadas",
      extractedTitle: "Datos Extraídos",
      verifyAnother: "Verificar Otra Nómina",
      viewDocument: "Ver Documento",
      aiBreakdownTitle: "Análisis de IA",
      aiClass: "Clase",
      aiLikelihood: "Probabilidad",
    },
    checks: {
      labels: {
        "Documento identificado como: nomina": "Documento identificado como: nomina",
        "No se detectó manipulación por IA": "No se detectó manipulación por IA",
        "Fecha de nómina válida": "Fecha de nómina válida",
        "Fecha de nómina no válida": "Fecha de nómina no válida",
        "Nómina con más de 3 meses de antigüedad": "Nómina con más de 3 meses de antigüedad",
        "Periodo de liquidación válido": "Periodo de liquidación válido",
        "Periodo de liquidación anterior a la antigüedad": "Periodo de liquidación anterior a la antigüedad",
        "Los conceptos devengados suman correctamente": "Los conceptos devengados suman correctamente",
        "Los conceptos devengados no suman el total devengado": "Los conceptos devengados no suman el total devengado",
        "Los conceptos deducidos suman correctamente": "Los conceptos deducidos suman correctamente",
        "Los conceptos deducidos no suman el total deducido": "Los conceptos deducidos no suman el total deducido",
        "Líquido a percibir correcto": "Líquido a percibir correcto",
        "El líquido a percibir no coincide con el cálculo": "El líquido a percibir no coincide con el cálculo",
        "Total devengado verificado": "Total devengado verificado",
        "NIF de empleado válido": "NIF de empleado válido",
        "NIF de empleado inválido": "NIF de empleado inválido",
        "Formato de NIF inválido": "Formato de NIF inválido",
        "CIF de empresa válido": "CIF de empresa válido",
        "Formato de CIF inválido": "Formato de CIF inválido",
        "No se pudo validar el periodo de liquidación": "No se pudo validar el periodo de liquidación",
      },
    },
    fields: {
      employeeName: "Nombre del Empleado",
      employeeNIF: "NIF del Empleado",
      companyName: "Nombre de la Empresa",
      companyCIF: "CIF de la Empresa",
      payrollDate: "Fecha de la Nómina",
      liquidationPeriod: "Periodo de Liquidación",
      seniorityDate: "Fecha de Antigüedad",
      totalEarnings: "Total Devengado",
      totalDeductions: "Total Deducido",
      netSalary: "Líquido a Percibir",
    },
  },
  en: {
    hero: {
      title: "Detect",
      titleAccent: "Fake Pay Stubs",
      titleEnd: "with AI.",
      subtitle:
        "Use Fakepay.ai to detect pay stubs that have been modified or generated using AI and other fraudulent techniques.",
    },
    upload: {
      title: "Upload Document",
      description: "Upload a pay stub in PDF, PNG or JPG format to verify its authenticity",
      dragText: "Drag your file here",
      clickText: "or click to select",
      selectButton: "Select file",
      verifyButton: "Verify Pay Stub",
      cancelButton: "Cancel",
    },
    processing: {
      title: "Verifying Document",
      description: "Please wait while we analyze your pay stub",
      steps: {
        classifying: "Classification",
        aiDetection: "GenAI Check",
        extracting: "Data Extraction",
        validating: "Data & Controls Validation",
      },
      status: {
        processing: "Processing...",
        completed: "Completed",
        pending: "Pending",
      },
    },
    results: {
      valid: "Pay Stub OK",
      fraudulent: "Fraudulent Document",
      invalid: "Invalid Document",
      validDesc: "The pay stub has passed all verifications",
      checksTitle: "Checks Performed",
      extractedTitle: "Extracted Data",
      verifyAnother: "Verify Another Pay Stub",
      viewDocument: "View Document",
      aiBreakdownTitle: "AI Analysis",
      aiClass: "Class",
      aiLikelihood: "Likeliness",
    },
    checks: {
      labels: {
        "Documento identificado como: nomina": "Document identified as: pay stub",
        "No se detectó manipulación por IA": "No AI manipulation detected",
        "Fecha de nómina válida": "Valid pay stub date",
        "Fecha de nómina no válida": "Invalid pay stub date",
        "Nómina con más de 3 meses de antigüedad": "Pay stub older than 3 months",
        "Periodo de liquidación válido": "Valid settlement period",
        "Periodo de liquidación anterior a la antigüedad": "Settlement period before seniority date",
        "Los conceptos devengados suman correctamente": "Earning items sum correctly",
        "Los conceptos devengados no suman el total devengado": "Earning items don't match total earnings",
        "Los conceptos deducidos suman correctamente": "Deduction items sum correctly",
        "Los conceptos deducidos no suman el total deducido": "Deduction items don't match total deductions",
        "Líquido a percibir correcto": "Net salary correct",
        "El líquido a percibir no coincide con el cálculo": "Net salary doesn't match calculation",
        "Total devengado verificado": "Total earnings verified",
        "NIF de empleado válido": "Valid employee ID",
        "NIF de empleado inválido": "Invalid employee ID",
        "Formato de NIF inválido": "Invalid ID format",
        "CIF de empresa válido": "Valid company tax ID",
        "Formato de CIF inválido": "Invalid tax ID format",
        "No se pudo validar el periodo de liquidación": "Could not validate settlement period",
      },
    },
    fields: {
      employeeName: "Employee Name",
      employeeNIF: "Employee ID",
      companyName: "Company Name",
      companyCIF: "Company Tax ID",
      payrollDate: "Payroll Date",
      liquidationPeriod: "Settlement Period",
      seniorityDate: "Seniority Date",
      totalEarnings: "Total Earnings",
      totalDeductions: "Total Deductions",
      netSalary: "Net Salary",
    },
  },
}

const AI_GENERATOR_COLORS: Record<string, string> = {
  stable_diffusion: "#3b82f6", // blue-500
  midjourney: "#8b5cf6", // violet-500
  dall_e: "#f59e0b", // amber-500
  gan: "#eab308", // yellow-500
  flux: "#f97316", // orange-500
  four_o: "#06b6d4", // cyan-500
  adobe_firefly: "#a855f7", // purple-500
  this_person_does_not_exist: "#ec4899", // pink-500
  ai: "#ef4444", // red-500 for AI
  human: "#22c55e", // green-500 for Human
}

const formatGeneratorName = (name: string): string => {
  // Special cases
  const specialCases: Record<string, string> = {
    dall_e: "DALL-E",
    four_o: "GPT-4o",
    this_person_does_not_exist: "This Person Does Not Exist",
    adobe_firefly: "Adobe Firefly",
    stable_diffusion: "Stable Diffusion",
    midjourney: "Midjourney",
    gan: "GAN",
    flux: "Flux",
    ai: "AI",
    human: "Human",
  }

  return specialCases[name.toLowerCase()] || name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function PayrollVerificationPage() {
  const [language, setLanguage] = useState<"es" | "en">("en")
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState<VerificationStep>("upload")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle")
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [isExtractedDataOpen, setIsExtractedDataOpen] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  const t = translations[language]

  useEffect(() => {
    const savedLanguage = localStorage.getItem("payroll_language") as "es" | "en" | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    const exampleFilePath = sessionStorage.getItem("exampleFilePath")
    const exampleFileName = sessionStorage.getItem("exampleFileName")

    if (exampleFilePath && exampleFileName) {
      // Fetch the file directly from the path
      fetch(exampleFilePath)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch file: ${res.statusText}`)
          }
          return res.blob()
        })
        .then((blob) => {
          const file = new File([blob], exampleFileName, { type: "application/pdf" })
          setFile(file)
          setShowFilePreview(true)
          setTimeout(() => {
            handleVerify(file)
          }, 1000)
        })
        .catch((error) => {
          console.error("[v0] Error loading example file:", error)
          setError(language === "es" ? "Error al cargar el archivo de ejemplo" : "Error loading example file")
        })
        .finally(() => {
          sessionStorage.removeItem("exampleFilePath")
          sessionStorage.removeItem("exampleFileName")
        })
    }
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0]
      setFile(selectedFile)
      handleVerify(selectedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setShowFilePreview(true)
      setTimeout(() => {
        handleVerify(selectedFile)
      }, 1000)
    }
  }

  const handleVerify = async (fileToVerify?: File) => {
    const targetFile = fileToVerify || file
    if (!targetFile) return

    console.log("[v0] Starting verification for file:", targetFile.name, targetFile.type, targetFile.size)

    const url = URL.createObjectURL(targetFile)
    setDocumentUrl(url)

    setShowFilePreview(false)
    setVerificationStatus("processing")
    setError(null)
    setCurrentStep("classifying")

    try {
      const formData = new FormData()

      if (targetFile.size === 0) {
        throw new Error(language === "es" ? "El archivo está vacío" : "The file is empty")
      }

      if (targetFile.size > 10 * 1024 * 1024) {
        throw new Error(
          language === "es" ? "El archivo es demasiado grande (máximo 10MB)" : "File is too large (max 10MB)",
        )
      }

      if (targetFile.type === "application/pdf") {
        console.log("[v0] PDF detected, converting to image for AI detection")
        try {
          const imageFile = await convertPdfToImage(targetFile)
          console.log("[v0] PDF successfully converted to image")
          formData.append("file", imageFile) // Image for AI detection
          formData.append("originalFile", targetFile) // Original PDF for extraction
        } catch (conversionError) {
          console.error("[v0] Failed to convert PDF to image:", conversionError)
          console.log("[v0] Will skip AI detection for this PDF")
          formData.append("originalFile", targetFile)
        }
      } else if (targetFile.type.startsWith("image/")) {
        // For images (PNG, JPG, etc.), send directly for both AI detection and extraction
        console.log("[v0] Image file detected, sending for AI detection")
        formData.append("file", targetFile)
      } else {
        throw new Error(
          language === "es"
            ? "Tipo de archivo no soportado. Por favor sube un PDF, PNG o JPG"
            : "Unsupported file type. Please upload a PDF, PNG or JPG",
        )
      }

      const stepTimings = [
        { step: "classifying" as VerificationStep, delay: 1500 },
        { step: "ai-detection" as VerificationStep, delay: 1500 },
        { step: "extracting" as VerificationStep, delay: 1500 },
      ]

      for (const { step, delay } of stepTimings) {
        setCurrentStep(step)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      setCurrentStep("validating")

      console.log("[v0] Sending request to /api/verify")
      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      const contentType = response.headers.get("content-type")
      console.log("[v0] Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("[v0] Non-JSON response received:")
        console.error("[v0] Response text:", textResponse.substring(0, 500))
        throw new Error(
          language === "es" ? "Error del servidor: respuesta no válida" : "Server error: invalid response",
        )
      }

      if (!response.ok) {
        const errorData = await response.json()
        console.error("[v0] API error response:", errorData)
        throw new Error(errorData.error || errorData.message || "Error al verificar el documento")
      }

      const data: VerificationResult = await response.json()
      console.log("[v0] Verification result:", data)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      setCurrentStep("complete")
      setVerificationStatus("success")
      setResult(data)
    } catch (err) {
      console.error("[v0] Verification error:", err)
      setVerificationStatus("error")
      setError(err instanceof Error ? err.message : "Error desconocido al verificar el documento")
      setCurrentStep("upload")
      setShowFilePreview(false)
    }
  }

  const convertPdfToImage = async (pdfFile: File): Promise<File> => {
    const pdfjsLib = await import("pdfjs-dist")

    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

    // Read PDF file
    const arrayBuffer = await pdfFile.arrayBuffer()

    console.log("[v0] PDF file size:", arrayBuffer.byteLength)

    if (arrayBuffer.byteLength === 0) {
      throw new Error("PDF file is empty")
    }

    // Load PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    console.log("[v0] PDF loaded successfully, pages:", pdf.numPages)

    // Get first page
    const page = await pdf.getPage(1)

    // Set scale for good quality
    const scale = 2.0
    const viewport = page.getViewport({ scale })

    // Create canvas
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    if (!context) {
      throw new Error("Could not get canvas context")
    }

    canvas.height = viewport.height
    canvas.width = viewport.width

    console.log("[v0] Canvas created:", canvas.width, "x", canvas.height)

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    console.log("[v0] PDF page rendered to canvas")

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error("Failed to convert canvas to blob"))
        }
      }, "image/png")
    })

    console.log("[v0] Canvas converted to blob, size:", blob.size)

    // Create File from blob
    const imageFile = new File([blob], "converted.png", { type: "image/png" })

    return imageFile
  }

  const resetVerification = () => {
    setFile(null)
    setCurrentStep("upload")
    setVerificationStatus("idle")
    setResult(null)
    setError(null)
    setShowFilePreview(false)
    if (documentUrl) {
      URL.revokeObjectURL(documentUrl)
      setDocumentUrl(null)
    }
  }

  const steps = [
    { id: "classifying", label: t.processing.steps.classifying, icon: FileCheck },
    { id: "ai-detection", label: t.processing.steps.aiDetection, icon: Shield },
    { id: "extracting", label: t.processing.steps.extracting, icon: Database },
    { id: "validating", label: t.processing.steps.validating, icon: FileSearch },
  ]

  const getStepIndex = (step: VerificationStep) => {
    const stepOrder = ["upload", "classifying", "ai-detection", "extracting", "validating", "complete"]
    return stepOrder.indexOf(step)
  }

  const currentStepIndex = getStepIndex(currentStep)
  const progress = currentStep === "upload" ? 0 : (currentStepIndex / 5) * 100

  const translateCheckLabel = (label: string): string => {
    if (language === "es") return label

    // Try exact match first
    if (t.checks.labels[label as keyof typeof t.checks.labels]) {
      return t.checks.labels[label as keyof typeof t.checks.labels]
    }

    // Handle dynamic labels like "Documento identificado como: unknown"
    if (label.startsWith("Documento identificado como:")) {
      const docType = label.split(":")[1]?.trim()
      // Translate common document types
      if (docType === "nomina") {
        return "Document identified as: pay stub"
      }
      return `Document identified as: ${docType}`
    }

    if (label.startsWith("Probabilidad de IA:")) {
      const percentage = label.split(":")[1]?.trim()
      return `AI probability: ${percentage}`
    }

    // Return original if no translation found
    return label
  }

  const translateExplanation = (explanation: string, label: string): string => {
    if (language === "es") return explanation

    // Comprehensive translation map for all backend Spanish strings
    const translations: Record<string, string> = {
      // Document classification
      "El documento contiene los campos requeridos de una nómina": "The document contains the required pay stub fields",
      "nombre del empleado": "employee name",
      empresa: "company",
      "datos salariales": "salary data",
      "El sistema ha analizado el documento y lo ha clasificado como":
        "The system has analyzed the document and classified it as",
      "con una confianza del": "with a confidence of",

      // AI detection
      "El análisis de AIorNOT ha detectado que este documento tiene una probabilidad del":
        "AI or NOT analysis has detected that this document has a probability of",
      "de haber sido generado o manipulado por inteligencia artificial":
        "of having been generated or manipulated by artificial intelligence",
      "El análisis de AIorNOT indica que este documento tiene una probabilidad muy baja":
        "AI or NOT analysis indicates that this document has a very low probability",
      "de haber sido generado o manipulado por IA. El documento parece ser auténtico":
        "of having been generated or manipulated by AI. The document appears to be authentic",
      "El análisis de IA no está disponible para este tipo de archivo":
        "AI analysis is not available for this file type",

      // Date validation
      "La fecha de la nómina": "The pay stub date",
      "está dentro del rango válido de los últimos 3 meses": "is within the valid range of the last 3 months",
      "es posterior a la fecha actual. Las nóminas no pueden tener fechas futuras":
        "is after the current date. Pay stubs cannot have future dates",
      "es anterior a 3 meses desde hoy. Solo se aceptan nóminas de los últimos 3 meses":
        "is more than 3 months old. Only pay stubs from the last 3 months are accepted",

      // Settlement period validation
      "El periodo de liquidación": "The settlement period",
      "es posterior a la fecha de antigüedad del empleado": "is after the employee's seniority date",
      "es igual o posterior a la fecha de antigüedad del empleado":
        "is equal to or after the employee's seniority date",
      "lo cual es correcto": "which is correct",
      "es anterior a la fecha de antigüedad del empleado": "is before the employee's seniority date",
      "Esto es imposible ya que el empleado no trabajaba en la empresa en ese periodo":
        "This is impossible as the employee was not working at the company during that period",

      // Earnings validation
      "La suma de los conceptos devengados": "The sum of earning items",
      "coincide con el total devengado": "matches the total earnings",
      "Error: La suma de los conceptos devengados es": "Error: The sum of earning items is",
      "pero el total devengado indicado es": "but the total earnings shown is",

      // Deductions validation
      "La suma de los conceptos deducidos": "The sum of deduction items",
      "coincide con el total deducido": "matches the total deductions",
      "Error: La suma de los conceptos deducidos es": "Error: The sum of deduction items is",
      "pero el total deducido indicado es": "but the total deductions shown is",

      // Net salary validation
      "El cálculo es correcto: Total devengado": "The calculation is correct: Total earnings",
      "El cálculo del líquido a percibir es correcto: Total devengado":
        "The net salary calculation is correct: Total earnings",
      "Total deducido": "Total deductions",
      "Líquido a percibir": "Net salary",
      "Error en el cálculo": "Calculation error",
      "Error en el cálculo del líquido a percibir: Total devengado": "Error in net salary calculation: Total earnings",
      "debería ser": "should be",
      "pero el documento indica": "but the document shows",
      Diferencia: "Difference",

      // Total earnings verification
      "El total devengado": "The total earnings",
      "ha sido verificado y es consistente con el líquido a percibir":
        "has been verified and is consistent with the net salary",
      "ha sido verificado": "has been verified",

      // NIF validation
      "El NIF del empleado": "The employee's ID",
      "tiene un formato correcto y el dígito de control es válido":
        "has a correct format and the control digit is valid",
      "tiene un dígito de control incorrecto. Debería ser": "has an incorrect control digit. It should be",
      "en lugar de": "instead of",
      "no tiene el formato correcto. Debe ser 8 dígitos seguidos de una letra mayúscula":
        "does not have the correct format. It must be 8 digits followed by an uppercase letter",

      // CIF validation
      "El CIF de la empresa": "The company's tax ID",
      "tiene un formato válido: letra inicial seguida de 7 dígitos y un dígito de control":
        "has a valid format: initial letter followed by 7 digits and a control digit",
      "no tiene el formato correcto. Debe ser una letra mayúscula seguida de 7 dígitos y un dígito de control":
        "does not have the correct format. It must be an uppercase letter followed by 7 digits and a control digit",

      // Settlement period validation warning
      "No se pudo validar la relación entre el periodo de liquidación":
        "Could not validate the relationship between the settlement period",
      "y la fecha de antigüedad": "and the seniority date",
      "debido a un formato de fecha no reconocido": "due to an unrecognized date format",
    }

    let translated = explanation

    // Apply all translations
    for (const [spanish, english] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(spanish, "g"), english)
    }

    return translated
  }

  const translateFieldName = (fieldKey: string): string => {
    if (t.fields[fieldKey as keyof typeof t.fields]) {
      return t.fields[fieldKey as keyof typeof t.fields]
    }
    // Fallback: convert camelCase to readable format
    return fieldKey.replace(/([A-Z])/g, " $1").trim()
  }

  const getErrorSummary = (result: VerificationResult): string | string[] => {
    if (result.status === "valid") {
      return t.results.validDesc
    }

    // If there are detailed checks, generate summary from failed checks
    if (result.detailedChecks && result.detailedChecks.length > 0) {
      const failedChecks = result.detailedChecks.filter((check) => check.status === "error")

      if (failedChecks.length > 0) {
        const errorMessages = failedChecks.map((check) => translateExplanation(check.explanation, check.label))

        // Return array if multiple errors, single string if one error
        return errorMessages.length > 1 ? errorMessages : errorMessages[0]
      }
    }

    // Fallback to original reason (translated) or generic message
    if (result.reason) {
      // Translate common reason strings
      const reasonTranslations: Record<string, string> = {
        "El documento no es una nómina válida": "The document is not a valid pay stub",
        "El documento no contiene los campos requeridos de una nómina":
          "The document does not contain the required pay stub fields",
        "No se pudo clasificar el documento": "Could not classify the document",
        "El documento ha sido generado o manipulado por IA": "The document has been generated or manipulated by AI",
        "Se detectó manipulación por IA en el documento": "AI manipulation detected in the document",
        "Error al procesar el documento": "Error processing the document",
        "Fecha de nómina futura no válida": "Invalid future pay stub date",
        "Nómina con más de 3 meses de antigüedad": "Pay stub older than 3 months",
        "El periodo de liquidación es anterior a la fecha de antigüedad": "Settlement period is before seniority date",
        "Los conceptos devengados no suman el total devengado": "Earning items don't match total earnings",
        "Los conceptos deducidos no suman el total deducido": "Deduction items don't match total deductions",
        "El líquido a percibir no coincide con el cálculo": "Net salary doesn't match calculation",
        "NIF de empleado inválido": "Invalid employee ID",
        "Formato de NIF inválido": "Invalid ID format",
        "Formato de CIF inválido": "Invalid tax ID format",
      }

      if (language === "en" && reasonTranslations[result.reason]) {
        return reasonTranslations[result.reason]
      }
      return result.reason
    }

    // Generic fallback message
    return language === "es" ? "El documento no es una nómina válida" : "The document is not a valid pay stub"
  }

  const handleLanguageChange = (lang: "es" | "en") => {
    setLanguage(lang)
    localStorage.setItem("payroll_language", lang)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        showApiButton={currentStep === "upload" && verificationStatus === "idle" && !result}
      />

      {showDocumentModal && documentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative h-full w-full max-w-4xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 z-10 text-white hover:bg-white/20"
              onClick={() => setShowDocumentModal(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <iframe src={documentUrl} className="h-full w-full rounded-lg bg-white" title="Document viewer" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12">
        {currentStep === "upload" && verificationStatus !== "processing" && !result && (
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-5">
            <div className="flex-1 lg:max-w-[60%]">
              <h1 className="font-mono text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl text-left mb-6 lg:text-7xl">
                {t.hero.title} <span className="text-primary">{t.hero.titleAccent}</span> {t.hero.titleEnd}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground md:text-xl px-0 mx-0 leading-7 text-justify max-w-xl">
                {t.hero.subtitle}
              </p>
            </div>

            <div className="w-full lg:w-[40%]">
              {error && (
                <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                    <div>
                      <p className="font-semibold text-red-500">Error</p>
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {showFilePreview && file ? (
                <div className="rounded-lg border-2 border-primary bg-primary/5 p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="rounded-full bg-primary/10 p-4">
                        <FileCheck className="h-8 w-8 text-primary" />
                      </div>
                      <div className="absolute -right-1 -top-1">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-medium text-card-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors px-8 ${
                      dragActive ? "border-primary bg-primary/5" : "border-border bg-card/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                    />

                    <div className="flex flex-col items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-4">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>

                      <div className="space-y-2">
                        <p className="text-base font-medium text-card-foreground">{t.upload.dragText}</p>
                        <p className="text-sm text-muted-foreground">{t.upload.clickText}</p>
                        <p className="text-xs text-muted-foreground">PDF, PNG, JPG • Max 10MB</p>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        className="cursor-pointer bg-transparent transition-all duration-300 hover:scale-105 hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/30"
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        {t.upload.selectButton}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <Link href="/examples">
                      <Button variant="link" className="text-primary hover:text-primary/80">
                        {language === "es" ? "Utiliza nuestros ejemplos" : "Use our examples"} →
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {verificationStatus === "processing" && currentStep !== "complete" && (
          <Card className="fuse-border border border-border bg-card p-8">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-semibold text-card-foreground">{t.processing.title}</h2>
              <p className="text-muted-foreground">{t.processing.description}</p>
            </div>

            <div className="mb-8">
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = currentStep === step.id
                const isComplete = getStepIndex(currentStep) > index + 1

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : isComplete
                          ? "border-border bg-secondary/30"
                          : "border-border bg-card opacity-50"
                    }`}
                  >
                    <div
                      className={`rounded-full p-2 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{step.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {isActive ? (
                          step.id === "validating" ? (
                            <span className="loading-dots">{language === "es" ? "Validando" : "Validating"}</span>
                          ) : (
                            t.processing.status.processing
                          )
                        ) : isComplete ? (
                          t.processing.status.completed
                        ) : (
                          t.processing.status.pending
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {currentStep === "complete" && result && (
          <Card className="border border-border bg-card p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {result.status === "valid" ? (
                  <div className="rounded-full bg-green-500/10 p-3">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                ) : result.status === "fraudulent" ? (
                  <div className="rounded-full bg-red-500/10 p-3">
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                ) : (
                  <div className="rounded-full bg-red-500/10 p-3">
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                )}

                <div className="flex-1">
                  <h2 className="mb-2 text-2xl font-semibold text-card-foreground">
                    {result.status === "valid"
                      ? t.results.valid
                      : result.status === "fraudulent"
                        ? t.results.fraudulent
                        : t.results.invalid}
                  </h2>
                  {(() => {
                    const summary = getErrorSummary(result)
                    if (Array.isArray(summary)) {
                      return (
                        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                          {summary.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      )
                    }
                    return <p className="text-muted-foreground">{summary}</p>
                  })()}
                </div>
              </div>

              {documentUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDocumentModal(true)}
                  className="flex-shrink-0"
                >
                  <Eye className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  {t.results.viewDocument}
                </Button>
              )}
            </div>

            <div className="mb-6 grid gap-6 lg:grid-cols-[1fr,auto]">
              {/* Checks section */}
              {result.detailedChecks && result.detailedChecks.length > 0 && (
                <div className="space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
                  <h3 className="mb-3 font-semibold text-card-foreground">{t.results.checksTitle}</h3>
                  <TooltipProvider>
                    <div className="grid gap-3 md:grid-cols-2">
                      {result.detailedChecks.map((check, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {check.status === "success" ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          ) : check.status === "error" ? (
                            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                          ) : (
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                          )}
                          <div className="flex flex-1 items-start gap-1">
                            <p className="text-sm text-card-foreground">{translateCheckLabel(check.label)}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="flex-shrink-0 text-muted-foreground transition-colors hover:text-foreground">
                                  <Info className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-xs">
                                <p className="text-xs">{translateExplanation(check.explanation, check.label)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              )}

              {/* AI Breakdown Section - Updated Layout */}
              {result.aiBreakdown && result.aiBreakdown.class_probabilities && (
                <div className="w-full space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
                  <h3 className="font-semibold text-card-foreground">{t.results.aiBreakdownTitle}</h3>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Column 1: List of AI Generators */}
                    {(() => {
                      const filteredGenerators = Object.entries(result.aiBreakdown.class_probabilities || {})
                        .filter(([className, probability]) => {
                          const isNotAiOrHuman = className.toLowerCase() !== "ai" && className.toLowerCase() !== "human"
                          const isAboveThreshold = probability >= 0.01
                          return isNotAiOrHuman && isAboveThreshold
                        })
                        .sort(([, a], [, b]) => b - a)

                      if (filteredGenerators.length === 0) return null

                      return (
                        <div className="space-y-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {language === "es" ? "Desglose de IA" : "AI Breakdown"}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              <span>{t.results.aiClass}</span>
                              <span>{t.results.aiLikelihood}</span>
                            </div>
                            {filteredGenerators.map(([className, probability]) => {
                              const color = AI_GENERATOR_COLORS[className] || "#6b7280"
                              return (
                                <div key={className} className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-3 w-3 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor: color,
                                      }}
                                    />
                                    <span className="text-sm text-card-foreground">
                                      {formatGeneratorName(className)}
                                    </span>
                                  </div>
                                  <span className="text-sm font-medium text-green-500">
                                    {(probability * 100).toFixed(0)}%
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Column 2: AI vs Human Pie Chart */}
                    {result.aiBreakdown.ai_probability !== undefined &&
                      (() => {
                        const aiVsHumanData = [
                          {
                            name: language === "es" ? "IA" : "AI",
                            value: result.aiBreakdown.ai_probability * 100,
                            fill: AI_GENERATOR_COLORS.ai,
                          },
                          {
                            name: language === "es" ? "Humano" : "Human",
                            value: (1 - result.aiBreakdown.ai_probability) * 100,
                            fill: AI_GENERATOR_COLORS.human,
                          },
                        ]

                        console.log("[v0] AI vs Human chart data:", aiVsHumanData)

                        return (
                          <div className="space-y-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground text-center">
                              {language === "es" ? "IA vs Humano" : "AI vs Human"}
                            </p>
                            <ResponsiveContainer width="100%" height={200}>
                              <PieChart>
                                <Pie
                                  data={aiVsHumanData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={70}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {aiVsHumanData.map((entry, index) => {
                                    console.log(`[v0] AI vs Human Cell ${index}:`, entry.name, entry.fill)
                                    return <Cell key={`cell-${index}`} fill={entry.fill} />
                                  })}
                                </Pie>
                                <RechartsTooltip
                                  formatter={(value: number) => `${value.toFixed(1)}%`}
                                  contentStyle={{
                                    backgroundColor: "hsl(var(--popover))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                    color: "hsl(var(--popover-foreground))",
                                  }}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  height={36}
                                  formatter={(value: string, entry: any) => (
                                    <span className="text-xs text-card-foreground">
                                      {value}: {entry.payload.value.toFixed(1)}%
                                    </span>
                                  )}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )
                      })()}

                    {/* Column 3: AI Generators Breakdown Pie Chart */}
                    {(() => {
                      const filteredGenerators = Object.entries(result.aiBreakdown.class_probabilities || {})
                        .filter(([className, probability]) => {
                          const isNotAiOrHuman = className.toLowerCase() !== "ai" && className.toLowerCase() !== "human"
                          const isAboveThreshold = probability >= 0.01
                          return isNotAiOrHuman && isAboveThreshold
                        })
                        .sort(([, a], [, b]) => b - a)

                      if (filteredGenerators.length === 0) return null

                      const chartData = filteredGenerators.map(([className, probability]) => ({
                        name: className,
                        value: probability * 100,
                        fill: AI_GENERATOR_COLORS[className] || "#6b7280",
                      }))

                      console.log("[v0] AI Distribution chart data:", chartData)

                      return (
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground text-center">
                            {language === "es" ? "Distribución de IA" : "AI Distribution"}
                          </p>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {chartData.map((entry, index) => {
                                  console.log(`[v0] AI Distribution Cell ${index}:`, entry.name, entry.fill)
                                  return <Cell key={`cell-${index}`} fill={entry.fill} />
                                })}
                              </Pie>
                              <RechartsTooltip
                                formatter={(value: number) => `${value.toFixed(1)}%`}
                                contentStyle={{
                                  backgroundColor: "hsl(var(--popover))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "0.5rem",
                                  color: "hsl(var(--popover-foreground))",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>

            {result.extractedData && (
              <Collapsible open={isExtractedDataOpen} onOpenChange={setIsExtractedDataOpen} className="mb-6">
                <div className="rounded-lg border border-border bg-secondary/20">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 transition-colors hover:bg-secondary/30">
                    <h3 className="font-semibold text-card-foreground">{t.results.extractedTitle}</h3>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                        isExtractedDataOpen ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        {Object.entries(result.extractedData)
                          .filter(([key]) => key !== "earningItems" && key !== "deductionItems")
                          .map(([key, value]) => (
                            <div key={key} className="flex flex-col gap-1">
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {translateFieldName(key)}
                              </span>
                              <span className="text-sm text-card-foreground">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )}

            <Button onClick={resetVerification} size="lg" className="w-full">
              {t.results.verifyAnother}
            </Button>
          </Card>
        )}
      </div>

      <footer className="py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-sm text-muted-foreground">
              hacked with <span className="text-red-500">❤️</span> from Barcelona
            </p>
            <img
              src="/serimag-logo.png"
              alt="Serimag"
              className="h-8 opacity-80 transition-opacity hover:opacity-100"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
