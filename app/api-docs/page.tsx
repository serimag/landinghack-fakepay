"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Copy, Check, Code, FileText, Shield, Database } from "lucide-react"

const translations = {
  es: {
    title: "Documentación",
    titleAccent: "API",
    subtitle: "Integra la verificación de nóminas en tu aplicación mediante nuestra API REST",
    quickStart: {
      title: "Quick Start",
      endpoint: "Endpoint",
      auth: "Autenticación",
      authDesc: "Incluye tu API key en el header Authorization:",
      authNote: "Contacta con el administrador para obtener tu API key",
    },
    request: {
      title: "Request",
      headers: "Headers",
      body: "Body (multipart/form-data)",
      headerName: "Header",
      headerValue: "Valor",
      headerRequired: "Requerido",
      yes: "Sí",
      fieldName: "Campo",
      fieldType: "Tipo",
      fieldDesc: "Descripción",
      fileDesc: "Archivo PDF, PNG o JPG de la nómina (max 10MB)",
    },
    response: {
      title: "Response",
      exampleTitle: "Ejemplo de respuesta exitosa",
      copied: "Copiado",
      copy: "Copiar",
      fields: "Campos de respuesta",
      fieldName: "Campo",
      fieldType: "Tipo",
      fieldDesc: "Descripción",
      successDesc: "Indica si la verificación fue exitosa",
      statusDesc: 'Estado: "valid", "invalid", "fraudulent"',
      docTypeDesc: "Tipo de documento detectado",
      aiGenDesc: "Si el documento fue generado/modificado por IA",
      aiConfDesc: "Confianza de detección de IA (0-1)",
      extractedDesc: "Datos extraídos de la nómina",
      validationsDesc: "Lista de validaciones realizadas",
      timestampDesc: "Fecha y hora de la verificación (ISO 8601)",
    },
    examples: {
      title: "Ejemplos de Código",
    },
    errors: {
      title: "Códigos de Error",
      code: "Código",
      description: "Descripción",
      error400: "Bad Request - Archivo no proporcionado o formato inválido",
      error401: "Unauthorized - API key inválida o ausente",
      error413: "Payload Too Large - Archivo mayor a 10MB",
      error500: "Internal Server Error - Error del servidor",
    },
    limits: {
      title: "Límites de Uso",
      rate: "Máximo 100 peticiones por minuto por API key",
      size: "Tamaño máximo de archivo: 10MB",
      formats: "Formatos soportados: PDF, PNG, JPG, JPEG",
      timeout: "Timeout de petición: 60 segundos",
    },
  },
  en: {
    title: "API",
    titleAccent: "Documentation",
    subtitle: "Integrate payroll verification into your application using our REST API",
    quickStart: {
      title: "Quick Start",
      endpoint: "Endpoint",
      auth: "Authentication",
      authDesc: "Include your API key in the Authorization header:",
      authNote: "Contact the administrator to obtain your API key",
    },
    request: {
      title: "Request",
      headers: "Headers",
      body: "Body (multipart/form-data)",
      headerName: "Header",
      headerValue: "Value",
      headerRequired: "Required",
      yes: "Yes",
      fieldName: "Field",
      fieldType: "Type",
      fieldDesc: "Description",
      fileDesc: "PDF, PNG or JPG file of the payslip (max 10MB)",
    },
    response: {
      title: "Response",
      exampleTitle: "Successful response example",
      copied: "Copied",
      copy: "Copy",
      fields: "Response fields",
      fieldName: "Field",
      fieldType: "Type",
      fieldDesc: "Description",
      successDesc: "Indicates if the verification was successful",
      statusDesc: 'Status: "valid", "invalid", "fraudulent"',
      docTypeDesc: "Detected document type",
      aiGenDesc: "Whether the document was generated/modified by AI",
      aiConfDesc: "AI detection confidence (0-1)",
      extractedDesc: "Extracted payslip data",
      validationsDesc: "List of performed validations",
      timestampDesc: "Verification date and time (ISO 8601)",
    },
    examples: {
      title: "Code Examples",
    },
    errors: {
      title: "Error Codes",
      code: "Code",
      description: "Description",
      error400: "Bad Request - File not provided or invalid format",
      error401: "Unauthorized - Invalid or missing API key",
      error413: "Payload Too Large - File larger than 10MB",
      error500: "Internal Server Error - Server error",
    },
    limits: {
      title: "Usage Limits",
      rate: "Maximum 100 requests per minute per API key",
      size: "Maximum file size: 10MB",
      formats: "Supported formats: PDF, PNG, JPG, JPEG",
      timeout: "Request timeout: 60 seconds",
    },
  },
}

export default function APIDocsPage() {
  const [language, setLanguage] = useState<"es" | "en">("en")
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem("payroll_language") as "es" | "en" | null
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("payroll_language", language)
  }, [language])

  const t = translations[language]

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const curlExample = `curl -X POST https://payshit.ai/api/v1/verify \\
  -H "Authorization: Bearer your_api_key_here" \\
  -F "file=@/path/to/nomina.pdf"`

  const pythonExample = `import requests

url = "https://payshit.ai/api/v1/verify"
headers = {
    "Authorization": "Bearer your_api_key_here"
}
files = {
    "file": open("nomina.pdf", "rb")
}

response = requests.post(url, headers=headers, files=files)
result = response.json()

print(f"Status: {result['status']}")
print(f"AI Generated: {result['aiGenerated']}")
print(f"Validations: {len(result['validations'])}")`

  const nodeExample = `const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const form = new FormData();
form.append('file', fs.createReadStream('nomina.pdf'));

const response = await fetch('https://payshit.ai/api/v1/verify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key_here'
  },
  body: form
});

const result = await response.json();
console.log('Status:', result.status);
console.log('AI Generated:', result.aiGenerated);`

  const responseExample = `{
  "success": true,
  "status": "valid",
  "documentType": "nomina",
  "aiGenerated": false,
  "aiConfidence": 0.05,
  "extractedData": {
    "employeeName": "Juan Pérez García",
    "employeeNIF": "12345678A",
    "companyName": "Empresa Ejemplo S.L.",
    "companyCIF": "B12345678",
    "payrollDate": "2024-01-31",
    "liquidationPeriod": "01/2024",
    "seniorityDate": "2020-01-15",
    "totalEarnings": 2500.00,
    "totalDeductions": 624.50,
    "netSalary": 1875.50
  },
  "validations": [
    {
      "check": "Documento identificado como: nomina",
      "status": "success",
      "message": "Documento identificado como: nomina",
      "details": "El documento contiene los campos requeridos..."
    },
    {
      "check": "No se detectó manipulación por IA",
      "status": "success",
      "message": "No se detectó manipulación por IA",
      "details": "El análisis indica probabilidad muy baja..."
    }
  ],
  "timestamp": "2024-01-31T10:30:00.000Z"
}`

  return (
    <div className="min-h-screen bg-background">
      <Navbar language={language} onLanguageChange={setLanguage} />

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-4 font-mono text-4xl font-bold text-foreground">
            {t.title} <span className="text-primary">{t.titleAccent}</span>
          </h1>
          <p className="text-lg text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Quick Start */}
        <Card className="mb-6 border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Code className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground">{t.quickStart.title}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">{t.quickStart.endpoint}</h3>
              <div className="rounded-lg bg-secondary/50 p-4 font-mono text-sm">
                <span className="text-green-500">POST</span> https://payshit.ai/api/v1/verify
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">{t.quickStart.auth}</h3>
              <p className="mb-2 text-sm text-muted-foreground">{t.quickStart.authDesc}</p>
              <div className="rounded-lg bg-secondary/50 p-4 font-mono text-sm">
                Authorization: Bearer your_api_key_here
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{t.quickStart.authNote}</p>
            </div>
          </div>
        </Card>

        {/* Request */}
        <Card className="mb-6 border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground">{t.request.title}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">{t.request.headers}</h3>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-semibold">{t.request.headerName}</th>
                      <th className="pb-2 text-left font-semibold">{t.request.headerValue}</th>
                      <th className="pb-2 text-left font-semibold">{t.request.headerRequired}</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b border-border/50">
                      <td className="py-2">Authorization</td>
                      <td className="py-2 text-muted-foreground">Bearer your_api_key_here</td>
                      <td className="py-2 text-green-500">{t.request.yes}</td>
                    </tr>
                    <tr>
                      <td className="py-2">Content-Type</td>
                      <td className="py-2 text-muted-foreground">multipart/form-data</td>
                      <td className="py-2 text-green-500">{t.request.yes}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">{t.request.body}</h3>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-semibold">{t.request.fieldName}</th>
                      <th className="pb-2 text-left font-semibold">{t.request.fieldType}</th>
                      <th className="pb-2 text-left font-semibold">{t.request.fieldDesc}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 font-mono">file</td>
                      <td className="py-2 text-muted-foreground">File</td>
                      <td className="py-2 text-muted-foreground">{t.request.fileDesc}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        {/* Response */}
        <Card className="mb-6 border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground">{t.response.title}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">{t.response.exampleTitle}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(responseExample, "response")}
                  className="gap-2"
                >
                  {copiedSection === "response" ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t.response.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t.response.copy}
                    </>
                  )}
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <pre className="text-xs">
                  <code>{responseExample}</code>
                </pre>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">{t.response.fields}</h3>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-semibold">{t.response.fieldName}</th>
                      <th className="pb-2 text-left font-semibold">{t.response.fieldType}</th>
                      <th className="pb-2 text-left font-semibold">{t.response.fieldDesc}</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">success</td>
                      <td className="py-2 text-muted-foreground">boolean</td>
                      <td className="py-2 text-muted-foreground">{t.response.successDesc}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">status</td>
                      <td className="py-2 text-muted-foreground">string</td>
                      <td className="py-2 text-muted-foreground">{t.response.statusDesc}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">documentType</td>
                      <td className="py-2 text-muted-foreground">string</td>
                      <td className="py-2 text-muted-foreground">{t.response.docTypeDesc}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">aiGenerated</td>
                      <td className="py-2 text-muted-foreground">boolean</td>
                      <td className="py-2 text-muted-foreground">{t.response.aiGenDesc}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">aiConfidence</td>
                      <td className="py-2 text-muted-foreground">number</td>
                      <td className="py-2 text-muted-foreground">{t.response.aiConfDesc}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">extractedData</td>
                      <td className="py-2 text-muted-foreground">object</td>
                      <td className="py-2 text-muted-foreground">{t.response.extractedDesc}</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">validations</td>
                      <td className="py-2 text-muted-foreground">array</td>
                      <td className="py-2 text-muted-foreground">{t.response.validationsDesc}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono">timestamp</td>
                      <td className="py-2 text-muted-foreground">string</td>
                      <td className="py-2 text-muted-foreground">{t.response.timestampDesc}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>

        {/* Code Examples */}
        <Card className="mb-6 border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground">{t.examples.title}</h2>
          </div>
          <div className="space-y-6">
            {/* cURL */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">cURL</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(curlExample, "curl")}
                  className="gap-2"
                >
                  {copiedSection === "curl" ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t.response.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t.response.copy}
                    </>
                  )}
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <pre className="text-xs">
                  <code>{curlExample}</code>
                </pre>
              </div>
            </div>

            {/* Python */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">Python</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(pythonExample, "python")}
                  className="gap-2"
                >
                  {copiedSection === "python" ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t.response.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t.response.copy}
                    </>
                  )}
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <pre className="text-xs">
                  <code>{pythonExample}</code>
                </pre>
              </div>
            </div>

            {/* Node.js */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">Node.js</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(nodeExample, "node")}
                  className="gap-2"
                >
                  {copiedSection === "node" ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t.response.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t.response.copy}
                    </>
                  )}
                </Button>
              </div>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <pre className="text-xs">
                  <code>{nodeExample}</code>
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Error Codes */}
        <Card className="mb-6 border border-border bg-card p-6">
          <h2 className="mb-4 text-2xl font-semibold text-card-foreground">{t.errors.title}</h2>
          <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-semibold">{t.errors.code}</th>
                  <th className="pb-2 text-left font-semibold">{t.errors.description}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 font-mono text-red-500">400</td>
                  <td className="py-2 text-muted-foreground">{t.errors.error400}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 font-mono text-red-500">401</td>
                  <td className="py-2 text-muted-foreground">{t.errors.error401}</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 font-mono text-red-500">413</td>
                  <td className="py-2 text-muted-foreground">{t.errors.error413}</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-red-500">500</td>
                  <td className="py-2 text-muted-foreground">{t.errors.error500}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Rate Limits */}
        <Card className="border border-border bg-card p-6">
          <h2 className="mb-4 text-2xl font-semibold text-card-foreground">{t.limits.title}</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• {t.limits.rate}</p>
            <p>• {t.limits.size}</p>
            <p>• {t.limits.formats}</p>
            <p>• {t.limits.timeout}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
