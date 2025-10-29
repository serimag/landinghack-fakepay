"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Copy, Check, Code, FileText, Shield, Database } from "lucide-react"

export default function APIDocsPage() {
  const [language, setLanguage] = useState<"es" | "en">("es")
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const curlExample = `curl -X POST https://payshit.ai/api/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@/path/to/nomina.pdf"`

  const pythonExample = `import requests

url = "https://payshit.ai/api/v1/verify"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
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
    'Authorization': 'Bearer YOUR_API_KEY'
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
            API <span className="text-primary">Documentation</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Integra la verificación de nóminas en tu aplicación mediante nuestra API REST
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-6 border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Code className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground">Quick Start</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">Endpoint</h3>
              <div className="rounded-lg bg-secondary/50 p-4 font-mono text-sm">
                <span className="text-green-500">POST</span> https://payshit.ai/api/v1/verify
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">Autenticación</h3>
              <p className="mb-2 text-sm text-muted-foreground">Incluye tu API key en el header Authorization:</p>
              <div className="rounded-lg bg-secondary/50 p-4 font-mono text-sm">Authorization: Bearer YOUR_API_KEY</div>
            </div>
          </div>
        </Card>

        {/* Request */}
        <Card className="mb-6 border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-card-foreground">Request</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">Headers</h3>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-semibold">Header</th>
                      <th className="pb-2 text-left font-semibold">Valor</th>
                      <th className="pb-2 text-left font-semibold">Requerido</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr className="border-b border-border/50">
                      <td className="py-2">Authorization</td>
                      <td className="py-2 text-muted-foreground">Bearer YOUR_API_KEY</td>
                      <td className="py-2 text-green-500">Sí</td>
                    </tr>
                    <tr>
                      <td className="py-2">Content-Type</td>
                      <td className="py-2 text-muted-foreground">multipart/form-data</td>
                      <td className="py-2 text-green-500">Sí</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-card-foreground">Body (multipart/form-data)</h3>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-semibold">Campo</th>
                      <th className="pb-2 text-left font-semibold">Tipo</th>
                      <th className="pb-2 text-left font-semibold">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 font-mono">file</td>
                      <td className="py-2 text-muted-foreground">File</td>
                      <td className="py-2 text-muted-foreground">Archivo PDF, PNG o JPG de la nómina (max 10MB)</td>
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
            <h2 className="text-2xl font-semibold text-card-foreground">Response</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">Ejemplo de respuesta exitosa</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(responseExample, "response")}
                  className="gap-2"
                >
                  {copiedSection === "response" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
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
              <h3 className="mb-2 font-semibold text-card-foreground">Campos de respuesta</h3>
              <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-semibold">Campo</th>
                      <th className="pb-2 text-left font-semibold">Tipo</th>
                      <th className="pb-2 text-left font-semibold">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">success</td>
                      <td className="py-2 text-muted-foreground">boolean</td>
                      <td className="py-2 text-muted-foreground">Indica si la verificación fue exitosa</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">status</td>
                      <td className="py-2 text-muted-foreground">string</td>
                      <td className="py-2 text-muted-foreground">Estado: "valid", "invalid", "fraudulent"</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">documentType</td>
                      <td className="py-2 text-muted-foreground">string</td>
                      <td className="py-2 text-muted-foreground">Tipo de documento detectado</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">aiGenerated</td>
                      <td className="py-2 text-muted-foreground">boolean</td>
                      <td className="py-2 text-muted-foreground">Si el documento fue generado/modificado por IA</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">aiConfidence</td>
                      <td className="py-2 text-muted-foreground">number</td>
                      <td className="py-2 text-muted-foreground">Confianza de detección de IA (0-1)</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">extractedData</td>
                      <td className="py-2 text-muted-foreground">object</td>
                      <td className="py-2 text-muted-foreground">Datos extraídos de la nómina</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-mono">validations</td>
                      <td className="py-2 text-muted-foreground">array</td>
                      <td className="py-2 text-muted-foreground">Lista de validaciones realizadas</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-mono">timestamp</td>
                      <td className="py-2 text-muted-foreground">string</td>
                      <td className="py-2 text-muted-foreground">Fecha y hora de la verificación (ISO 8601)</td>
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
            <h2 className="text-2xl font-semibold text-card-foreground">Ejemplos de Código</h2>
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
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
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
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
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
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar
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
          <h2 className="mb-4 text-2xl font-semibold text-card-foreground">Códigos de Error</h2>
          <div className="overflow-x-auto rounded-lg bg-secondary/50 p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-semibold">Código</th>
                  <th className="pb-2 text-left font-semibold">Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-2 font-mono text-red-500">400</td>
                  <td className="py-2 text-muted-foreground">
                    Bad Request - Archivo no proporcionado o formato inválido
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 font-mono text-red-500">401</td>
                  <td className="py-2 text-muted-foreground">Unauthorized - API key inválida o ausente</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-2 font-mono text-red-500">413</td>
                  <td className="py-2 text-muted-foreground">Payload Too Large - Archivo mayor a 10MB</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono text-red-500">500</td>
                  <td className="py-2 text-muted-foreground">Internal Server Error - Error del servidor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Rate Limits */}
        <Card className="border border-border bg-card p-6">
          <h2 className="mb-4 text-2xl font-semibold text-card-foreground">Límites de Uso</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Máximo 100 peticiones por minuto por API key</p>
            <p>• Tamaño máximo de archivo: 10MB</p>
            <p>• Formatos soportados: PDF, PNG, JPG, JPEG</p>
            <p>• Timeout de petición: 60 segundos</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
