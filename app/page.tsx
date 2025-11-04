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
  Lock,
  Eye,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import Link from "next/link"

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
}

const translations = {
  es: {
    hero: {
      title: "Detecta",
      titleAccent: "Nóminas falsas",
      titleEnd: "con IA.",
      subtitle: "Utiliza Payshit.ai para detectar nóminas que hayan sido modificadas usando IA y otros métodos.",
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
    },
    checks: {
      labels: {
        "Documento identificado como: nomina": "Document identified as: payslip",
        "No se detectó manipulación por IA": "No AI manipulation detected",
        "Fecha de nómina válida": "Valid payslip date",
        "Fecha de nómina no válida": "Invalid payslip date",
        "Nómina con más de 3 meses de antigüedad": "Payslip older than 3 months",
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
      titleAccent: "Fake Payslips",
      titleEnd: "with AI.",
      subtitle: "Use Payshit.ai to detect payslips that have been modified using AI and other methods.",
    },
    upload: {
      title: "Upload Document",
      description: "Upload a payslip in PDF, PNG or JPG format to verify its authenticity",
      dragText: "Drag your file here",
      clickText: "or click to select",
      selectButton: "Select file",
      verifyButton: "Verify Payslip",
      cancelButton: "Cancel",
    },
    processing: {
      title: "Verifying Document",
      description: "Please wait while we analyze your payslip",
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
      valid: "Payslip OK",
      fraudulent: "Fraudulent Document",
      invalid: "Invalid Document",
      validDesc: "The payslip has passed all verifications",
      checksTitle: "Checks Performed",
      extractedTitle: "Extracted Data",
      verifyAnother: "Verify Another Payslip",
      viewDocument: "View Document",
    },
    checks: {
      labels: {
        "Documento identificado como: nomina": "Document identified as: payslip",
        "No se detectó manipulación por IA": "No AI manipulation detected",
        "Fecha de nómina válida": "Valid payslip date",
        "Fecha de nómina no válida": "Invalid payslip date",
        "Nómina con más de 3 meses de antigüedad": "Payslip older than 3 months",
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

async function convertPdfToImage(file: File): Promise<File> {
  const pdfjsLib = await import("pdfjs-dist")

  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const page = await pdf.getPage(1)

  const viewport = page.getViewport({ scale: 2.0 })
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Could not get canvas context")
  }

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error("Failed to convert canvas to blob"))
      }
    }, "image/png")
  })

  return new File([blob], file.name.replace(/\.pdf$/i, ".png"), { type: "image/png" })
}

export default function PayrollVerificationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const [language, setLanguage] = useState<"es" | "en">("es")
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
    const authStatus = localStorage.getItem("payroll_authenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
    const savedLanguage = localStorage.getItem("payroll_language") as "es" | "en" | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
    setIsCheckingAuth(false)
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === process.env.NEXT_PUBLIC_WEB_PASSWORD || password === "ivuRTRu6jkzDYjjIHfQg") {
      setIsAuthenticated(true)
      localStorage.setItem("payroll_authenticated", "true")
      setAuthError("")
    } else {
      setAuthError(language === "es" ? "Contraseña incorrecta" : "Incorrect password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("payroll_authenticated")
    setPassword("")
  }

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

    const url = URL.createObjectURL(targetFile)
    setDocumentUrl(url)

    setShowFilePreview(false)
    setVerificationStatus("processing")
    setError(null)
    setCurrentStep("classifying")

    try {
      let fileToSend = targetFile

      if (targetFile.type === "application/pdf") {
        console.log("[v0] Converting PDF to image for AIorNOT compatibility")
        try {
          fileToSend = await convertPdfToImage(targetFile)
          console.log("[v0] PDF converted to image successfully")
        } catch (conversionError) {
          console.error("[v0] PDF conversion error:", conversionError)
          throw new Error("Error al convertir PDF a imagen")
        }
      }

      const formData = new FormData()
      formData.append("file", fileToSend)
      if (targetFile.type === "application/pdf") {
        formData.append("originalFile", targetFile)
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
      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al verificar el documento")
      }

      const data: VerificationResult = await response.json()

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

    // Translate common patterns in explanations
    const translations: Record<string, string> = {
      "El documento contiene los campos requeridos de una nómina": "The document contains the required payslip fields",
      "nombre del empleado": "employee name",
      empresa: "company",
      "datos salariales": "salary data",
      "El sistema ha analizado el documento y lo ha clasificado como":
        "The system has analyzed the document and classified it as",
      "con una confianza del": "with a confidence of",
      "El análisis de AIorNOT ha detectado que este documento tiene una probabilidad del":
        "AIorNOT analysis has detected that this document has a probability of",
      "de haber sido generado o manipulado por inteligencia artificial":
        "of having been generated or manipulated by artificial intelligence",
      "El análisis de AIorNOT indica que este documento tiene una probabilidad muy baja":
        "AIorNOT analysis indicates that this document has a very low probability",
      "de haber sido generado o manipulado por IA. El documento parece ser auténtico":
        "of having been generated or manipulated by AI. The document appears to be authentic",
      "La fecha de la nómina": "The payslip date",
      "está dentro del rango válido de los últimos 3 meses": "is within the valid range of the last 3 months",
      "es posterior a la fecha actual. Las nóminas no pueden tener fechas futuras":
        "is after the current date. Payslips cannot have future dates",
      "es anterior a 3 meses desde hoy. Solo se aceptan nóminas de los últimos 3 meses":
        "is more than 3 months old. Only payslips from the last 3 months are accepted",
      "El periodo de liquidación": "The settlement period",
      "es posterior a la fecha de antigüedad del empleado": "is after the employee's seniority date",
      "es igual o posterior a la fecha de antigüedad del empleado":
        "is equal to or after the employee's seniority date",
      "lo cual es correcto": "which is correct",
      "es anterior a la fecha de antigüedad del empleado": "is before the employee's seniority date",
      "Esto es imposible ya que el empleado no trabajaba en la empresa en ese periodo":
        "This is impossible as the employee was not working at the company during that period",
      "La suma de los conceptos devengados": "The sum of earning items",
      "coincide con el total devengado": "matches the total earnings",
      "Error: La suma de los conceptos devengados es": "Error: The sum of earning items is",
      "pero el total devengado indicado es": "but the total earnings shown is",
      "La suma de los conceptos deducidos": "The sum of deduction items",
      "coincide con el total deducido": "matches the total deductions",
      "Error: La suma de los conceptos deducidos es": "Error: The sum of deduction items is",
      "pero el total deducido indicado es": "but the total deductions shown is",
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
      "El total devengado": "The total earnings",
      "ha sido verificado y es consistente con el líquido a percibir":
        "has been verified and is consistent with the net salary",
      "ha sido verificado": "has been verified",
      "El NIF del empleado": "The employee's ID",
      "tiene un formato correcto y el dígito de control es válido":
        "has a correct format and the control digit is valid",
      "tiene un dígito de control incorrecto. Debería ser": "has an incorrect control digit. It should be",
      "en lugar de": "instead of",
      "no tiene el formato correcto. Debe ser 8 dígitos seguidos de una letra mayúscula":
        "does not have the correct format. It must be 8 digits followed by an uppercase letter",
      "El CIF de la empresa": "The company's tax ID",
      "tiene un formato válido: letra inicial seguida de 7 dígitos y un dígito de control":
        "has a valid format: initial letter followed by 7 digits and a control digit",
      "no tiene el formato correcto. Debe ser una letra mayúscula seguida de 7 dígitos y un dígito de control":
        "does not have the correct format. It must be an uppercase letter followed by 7 digits and a control digit",
      "No se pudo validar la relación entre el periodo de liquidación":
        "Could not validate the relationship between the settlement period",
      "y la fecha de antigüedad": "and the seniority date",
      "debido a un formato de fecha no reconocido": "due to an unrecognized date format",
    }

    let translated = explanation
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
      // Try to translate common error messages
      const reasonTranslations: Record<string, string> = {
        "El documento no es una nómina válida": "The document is not a valid payslip",
        "El documento no contiene los campos requeridos de una nómina":
          "The document does not contain the required payslip fields",
        "No se pudo clasificar el documento": "Could not classify the document",
        "El documento ha sido generado o manipulado por IA": "The document has been generated or manipulated by AI",
        "Error al procesar el documento": "Error processing the document",
      }

      if (language === "en") {
        // Try exact match first
        if (reasonTranslations[result.reason]) {
          return reasonTranslations[result.reason]
        }
        // Try to translate using the same logic as explanations
        return translateExplanation(result.reason, "")
      }

      return result.reason
    }

    // Generic fallback message
    return language === "es" ? "El documento no es una nómina válida" : "The document is not a valid payslip"
  }

  const handleLanguageChange = (lang: "es" | "en") => {
    setLanguage(lang)
    localStorage.setItem("payroll_language", lang)
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="w-full max-w-md border border-border bg-card p-8">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">Payshit.ai</h1>
              <p className="text-sm text-muted-foreground">
                {language === "es" ? "Introduce la contraseña para acceder" : "Enter password to access"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder={language === "es" ? "Contraseña" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
                  <p className="text-sm text-red-500">{authError}</p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                {language === "es" ? "Acceder" : "Access"}
              </Button>
            </form>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {language === "es" ? "English" : "Español"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
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
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
            <div className="flex-1 lg:max-w-[60%]">
              <h1 className="mb-6 text-left font-mono text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
                {t.hero.title} <span className="text-primary">{t.hero.titleAccent}</span> {t.hero.titleEnd}
              </h1>
              <p className="text-justify text-lg leading-relaxed text-muted-foreground md:text-xl">{t.hero.subtitle}</p>
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
                    className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
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
                  <Eye className="mr-2 h-4 w-4" />
                  {t.results.viewDocument}
                </Button>
              )}
            </div>

            {result.detailedChecks && result.detailedChecks.length > 0 && (
              <div className="mb-6 space-y-2 rounded-lg border border-border bg-secondary/30 p-4">
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
                        <p className="flex-1 text-sm text-card-foreground">{translateCheckLabel(check.label)}</p>
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
                    ))}
                  </div>
                </TooltipProvider>
              </div>
            )}

            {result.extractedData && (
              <Collapsible open={isExtractedDataOpen} onOpenChange={setIsExtractedDataOpen} className="mb-6">
                <div className="rounded-lg border border-border bg-secondary/20">
                  <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/30">
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
