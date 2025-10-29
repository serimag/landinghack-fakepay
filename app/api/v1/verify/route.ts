import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

interface APIVerificationResult {
  success: boolean
  status: "valid" | "invalid" | "fraudulent"
  message?: string
  documentType?: string
  aiGenerated: boolean
  aiConfidence: number
  extractedData?: {
    employeeName?: string
    employeeNIF?: string
    companyName?: string
    companyCIF?: string
    payrollDate?: string
    liquidationPeriod?: string
    seniorityDate?: string
    totalEarnings?: number
    totalDeductions?: number
    netSalary?: number
  }
  validations: Array<{
    check: string
    status: "success" | "error" | "warning"
    message: string
    details: string
  }>
  timestamp: string
}

// API Key validation
function validateApiKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  const apiKey = authHeader?.replace("Bearer ", "")

  // For now, accept the same password as the web interface
  // In production, you should use separate API keys stored in a database
  const validApiKey = "ivuRTRu6jkzDYjjIHfQg"

  return apiKey === validApiKey
}

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "Invalid or missing API key. Please provide a valid API key in the Authorization header.",
        },
        { status: 401 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: "No file provided. Please include a file in the 'file' field of the multipart/form-data request.",
        },
        { status: 400 },
      )
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: `Invalid file type: ${file.type}. Allowed types: PDF, PNG, JPG, JPEG`,
        },
        { status: 400 },
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "Bad Request",
          message: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 10MB`,
        },
        { status: 400 },
      )
    }

    // Call the existing verification logic
    const internalFormData = new FormData()
    internalFormData.append("file", file)
    internalFormData.append("originalFile", file)

    const internalRequest = new Request(new URL("/api/verify", request.url), {
      method: "POST",
      body: internalFormData,
    })

    const internalResponse = await fetch(internalRequest)
    const internalResult = await internalResponse.json()

    // Transform internal result to API format
    const apiResult: APIVerificationResult = {
      success: internalResult.status === "valid",
      status: internalResult.status,
      message: internalResult.reason,
      documentType: internalResult.documentType,
      aiGenerated: internalResult.isAIGenerated || false,
      aiConfidence: internalResult.isAIGenerated ? 0.8 : 0.05,
      extractedData: internalResult.extractedData,
      validations: (internalResult.detailedChecks || []).map((check: any) => ({
        check: check.label,
        status: check.status,
        message: check.label,
        details: check.explanation,
      })),
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(apiResult, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("[v0] API verification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "An error occurred while processing your request. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
