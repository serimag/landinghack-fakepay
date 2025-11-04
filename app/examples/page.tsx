"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { ArrowLeft, FileCheck, FileX, Bot, ImageIcon, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const translations = {
  es: {
    title: "Ejemplos de Documentos",
    subtitle: "Prueba el sistema con estos documentos de ejemplo",
    backButton: "Volver",
    analyzeButton: "Analizar",
    previewButton: "Ver documento",
    examples: {
      payslipOk: {
        title: "Nómina OK",
        description: "Documento válido sin errores",
      },
      payslipFakeData: {
        title: "Nómina KO - Datos falsos",
        description: "Datos modificados manualmente",
      },
      payslipAiGenerated: {
        title: "Nómina KO - Generada por IA",
        description: "Documento creado artificialmente",
      },
      notPayslip: {
        title: "Nómina KO - No es una nómina",
        description: "El documento no corresponde a una nómina",
      },
    },
  },
  en: {
    title: "Document Examples",
    subtitle: "Test the system with these example documents",
    backButton: "Back",
    analyzeButton: "Analyze",
    previewButton: "View document",
    examples: {
      payslipOk: {
        title: "Payslip OK",
        description: "Valid document without errors",
      },
      payslipFakeData: {
        title: "Payslip KO - Fake Data",
        description: "Manually modified data",
      },
      payslipAiGenerated: {
        title: "Payslip KO - AI Generated",
        description: "Artificially created document",
      },
      notPayslip: {
        title: "Payslip KO - Not a Payslip",
        description: "Document is not a payslip",
      },
    },
  },
}

export default function ExamplesPage() {
  const router = useRouter()
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem("payroll_language") as "es" | "en" | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const t = translations[language]

  const examples = [
    {
      id: 1,
      titleKey: "payslipOk" as const,
      file: "/examples/payslip_ok.pdf",
      icon: FileCheck,
      status: "success" as const,
    },
    {
      id: 2,
      titleKey: "payslipFakeData" as const,
      file: "/examples/payslip_modified.pdf",
      icon: FileX,
      status: "error" as const,
    },
    {
      id: 3,
      titleKey: "payslipAiGenerated" as const,
      file: "/examples/payslip-ai-generated.pdf",
      icon: Bot,
      status: "error" as const,
    },
    {
      id: 4,
      titleKey: "notPayslip" as const,
      file: "/examples/no_payslip_only_cat.pdf",
      icon: ImageIcon,
      status: "error" as const,
    },
  ]

  const handleAnalyze = async (filePath: string) => {
    try {
      sessionStorage.setItem("exampleFilePath", filePath)
      sessionStorage.setItem("exampleFileName", filePath.split("/").pop() || "document.pdf")
      router.push("/")
    } catch (error) {
      console.error("[v0] Error loading example file:", error)
    }
  }

  const handleLanguageChange = (lang: "es" | "en") => {
    setLanguage(lang)
    localStorage.setItem("payroll_language", lang)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={language} onLanguageChange={handleLanguageChange} />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backButton}
            </Button>
          </Link>
          <h1 className="mb-2 text-4xl font-bold text-foreground">{t.title}</h1>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {examples.map((example) => {
            const Icon = example.icon
            const exampleTranslation = t.examples[example.titleKey]
            return (
              <Card
                key={example.id}
                className="group relative overflow-hidden border border-border bg-card transition-all hover:border-primary hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`rounded-full p-3 ${
                        example.status === "success"
                          ? "bg-green-500/10 text-green-500"
                          : example.status === "warning"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">{exampleTranslation.title}</h3>
                  <p className="mb-6 text-sm text-muted-foreground">{exampleTranslation.description}</p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedPdf(example.file)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t.previewButton}
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleAnalyze(example.file)}>
                      {t.analyzeButton}
                    </Button>
                  </div>
                </div>

                {/* Preview thumbnail */}
                <div className="absolute inset-0 -z-10 opacity-5 transition-opacity group-hover:opacity-10">
                  <div className="h-full w-full bg-gradient-to-br from-primary to-primary/50" />
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPdf(null)}
        >
          <div className="relative h-[90vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 z-10 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedPdf(null)}
            >
              ✕
            </Button>
            <iframe src={selectedPdf} className="h-full w-full rounded-lg border border-border bg-background" />
          </div>
        </div>
      )}
    </div>
  )
}
