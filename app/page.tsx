"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Upload, FileCheck, Shield, CheckCircle2, XCircle, AlertCircle, Database, FileSearch, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

const VALID_PASSWORD = "ivuRTRu6jkzDYjjIHfQg"
const AUTH_STORAGE_KEY = "payroll_auth"

type VerificationStep = "upload" | "classifying" | "ai-detection" | "extracting" | "validating" | "complete"
type VerificationStatus = "idle" | "processing" | "success" | "error"

interface VerificationResult {
  status: "valid" | "invalid" | "fraudulent"
  reason?: string
  details: string[]
  documentType?: string
  isAIGenerated?: boolean
  extractedData?: Record<string, any>
}

async function convertPdfToImage(file: File): Promise<File> {
  // Dynamically import pdfjs to avoid SSR issues
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

  // Create a new File from the blob
  return new File([blob], file.name.replace(/\.pdf$/i, ".png"), { type: "image/png" })
}

export default function PayrollVerificationPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState<VerificationStep>("upload")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle")
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth === VALID_PASSWORD) {
      setIsAuthenticated(true)
    }
    setIsCheckingAuth(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === VALID_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, password)
      setIsAuthenticated(true)
      setAuthError("")
    } else {
      setAuthError("Contraseña incorrecta")
      setPassword("")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthenticated(false)
    setPassword("")
    resetVerification()
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
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleVerify = async () => {
    if (!file) return

    setVerificationStatus("processing")
    setError(null)
    setCurrentStep("classifying")

    try {
      let fileToSend = file

      if (file.type === "application/pdf") {
        console.log("[v0] Converting PDF to image for AIorNOT compatibility")
        try {
          fileToSend = await convertPdfToImage(file)
          console.log("[v0] PDF converted to image successfully")
        } catch (conversionError) {
          console.error("[v0] PDF conversion error:", conversionError)
          throw new Error("Error al convertir PDF a imagen")
        }
      }

      const formData = new FormData()
      formData.append("file", fileToSend)
      if (file.type === "application/pdf") {
        formData.append("originalFile", file)
      }

      const stepTimings = [
        { step: "classifying" as VerificationStep, delay: 1500 },
        { step: "ai-detection" as VerificationStep, delay: 1500 },
        { step: "extracting" as VerificationStep, delay: 1500 },
        { step: "validating" as VerificationStep, delay: 1500 },
      ]

      const apiPromise = fetch("/api/verify", {
        method: "POST",
        body: formData,
      })

      for (const { step, delay } of stepTimings) {
        setCurrentStep(step)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }

      const response = await apiPromise

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al verificar el documento")
      }

      const data: VerificationResult = await response.json()

      setCurrentStep("complete")
      setVerificationStatus("success")
      setResult(data)
    } catch (err) {
      console.error("[v0] Verification error:", err)
      setVerificationStatus("error")
      setError(err instanceof Error ? err.message : "Error desconocido al verificar el documento")
      setCurrentStep("upload")
    }
  }

  const resetVerification = () => {
    setFile(null)
    setCurrentStep("upload")
    setVerificationStatus("idle")
    setResult(null)
    setError(null)
  }

  const steps = [
    { id: "classifying", label: "Clasificación", icon: FileCheck },
    { id: "ai-detection", label: "Detección IA", icon: Shield },
    { id: "extracting", label: "Extracción", icon: Database },
    { id: "validating", label: "Validación", icon: FileSearch },
  ]

  const getStepIndex = (step: VerificationStep) => {
    const stepOrder = ["upload", "classifying", "ai-detection", "extracting", "validating", "complete"]
    return stepOrder.indexOf(step)
  }

  const currentStepIndex = getStepIndex(currentStep)
  const progress = currentStep === "upload" ? 0 : (currentStepIndex / 5) * 100

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-2 p-8">
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex rounded-full bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">Acceso Restringido</h1>
            <p className="text-muted-foreground">Introduce la contraseña para acceder al sistema de verificación</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setAuthError("")
                }}
                className="text-center text-lg"
                autoFocus
              />
            </div>

            {authError && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3">
                <p className="text-center text-sm text-red-600">{authError}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full">
              Acceder
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">Verificación de Nóminas</h1>
          <p className="text-lg text-muted-foreground">Sistema de validación automática de nóminas españolas</p>
          <div className="mt-4">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {currentStep === "upload" && (
          <Card className="border-2 p-8">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-semibold text-foreground">Paso 1: Cargar Documento</h2>
              <p className="text-muted-foreground">
                Sube una nómina en formato PDF, PNG o JPG para verificar su autenticidad
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-600">Error al verificar</p>
                    <p className="text-sm text-red-600/90">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-border bg-muted/30"
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

                {file ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-foreground">Arrastra tu archivo aquí</p>
                      <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                    </div>
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="lg" asChild>
                        <span>Seleccionar archivo</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </div>

            {file && (
              <div className="mt-6 flex gap-3">
                <Button onClick={handleVerify} size="lg" className="flex-1">
                  Verificar Nómina
                </Button>
                <Button onClick={resetVerification} variant="outline" size="lg">
                  Cancelar
                </Button>
              </div>
            )}
          </Card>
        )}

        {verificationStatus === "processing" && currentStep !== "complete" && (
          <Card className="border-2 p-8">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-semibold text-foreground">Verificando Documento</h2>
              <p className="text-muted-foreground">Por favor espera mientras analizamos tu nómina</p>
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
                          ? "border-border bg-muted/30"
                          : "border-border bg-background opacity-50"
                    }`}
                  >
                    <div
                      className={`rounded-full p-2 ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isComplete
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{step.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {isActive ? "En proceso..." : isComplete ? "Completado" : "Pendiente"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {currentStep === "complete" && result && (
          <Card className="border-2 p-8">
            <div className="mb-6 flex items-start gap-4">
              {result.status === "valid" ? (
                <div className="rounded-full bg-green-500/10 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              ) : result.status === "fraudulent" ? (
                <div className="rounded-full bg-red-500/10 p-3">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              ) : (
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              )}

              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-semibold text-foreground">
                  {result.status === "valid"
                    ? "Documento Válido"
                    : result.status === "fraudulent"
                      ? "Documento Fraudulento"
                      : "Documento No Válido"}
                </h2>
                <p className="text-muted-foreground">
                  {result.status === "valid"
                    ? "La nómina ha pasado todas las verificaciones"
                    : result.reason || "El documento no cumple con los requisitos"}
                </p>
              </div>
            </div>

            {result.details && result.details.length > 0 && (
              <div className="mb-6 space-y-2 rounded-lg bg-muted/30 p-4">
                <h3 className="mb-3 font-semibold text-foreground">Comprobaciones Realizadas</h3>
                {result.details.map((detail, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {detail.startsWith("✓") ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    ) : detail.startsWith("❌") ? (
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                    )}
                    <p className="text-sm text-foreground">{detail.replace(/^[✓❌⚠️]\s*/, "")}</p>
                  </div>
                ))}
              </div>
            )}

            {result.extractedData && (
              <div className="mb-6 rounded-lg border border-border bg-muted/20 p-4">
                <h3 className="mb-3 font-semibold text-foreground">Datos Extraídos</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(result.extractedData).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-sm text-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={resetVerification} size="lg" className="w-full">
              Verificar Otra Nómina
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
