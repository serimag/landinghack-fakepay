# 🚀fakepay.ai - Pay Stubs Verification

Automatic validation system for Spanish pay stubs using AI to detect fraud and verify authenticity.

Web Demo: https://fakepay-landing.vercel.app/ 

Video Demo: https://www.youtube.com/watch?v=-vNP2rP7Kvs

---
**Why FakePay?**

With the rise of GenAI applications the risk of GenAI-driven fraud in document forging is exploding, and we want to help clients in the financial services industry to tackle these kinds of risks. 

Our vision is to create an easy to deploy API that can be included in current IDP workflows in order to give a reliable OK / KO. For now we've create a first version with a web-app demo and focused in Spanish Pay Stubs. 

**About Us**

At Serimag we're the leading company providing Intelligent Document Processing services in Spain, focused in the banking industry processing >1 million pages per day. 

We're based in Barcelona, founded in 2007 and a strong expertise in NLP and Computer Vision. 

For this demo its been Sergio & Hugo, part of the Serimag team, that have built FakePay during a weekend and some late nights.

---
## ✨FakePay Features

- 📄 **Document Classification**: Automatically identifies document type using LandingAI - Parse API
- 🤖 **AI Detection**: Detects if the document has been generated or manipulated by AI using AIorNOT
- 📊 **Data Extraction**: Extracts key information from pay stubs - Extract API
- ✅ **Automatic Validation**: Verifies dates, NIF/CIF formats, and internal earnings calculations
- 🔌 **REST API**: Integrate verification into your applications via API (coming soon)

**Architecture & Data Flow**

Upload Pipeline
```bash
User uploads PDF / Image (JPG, PNG)
↓
Save to ./data_rooms/{task_id}/{filename}
↓
LandingAI Parse API → Markdown text
↓
Gemini 2.5 (classification) → document type, locale, confidence
↓
PDF → Image conversion (page-wise PNG @300dpi)
↓
AI-image detection (AI or Not) → probability of diffusion-model generation (per page)
↓
LandingAI Extract API → structured fields (JSON)
↓
FakePay rules engine → reconcilers, checks, forensic flags → ✅/⚠️
↓
Score & summarize → risk_score + NL summary
↓
Render full report in UI 
↓
User can repeat / upload next document
```
---
## :gear:Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# LandingAI Configuration
LANDINGAI_API_KEY=your_landingai_api_key

# AIorNOT Configuration
AIORNOT_API_KEY=your_aiornot_api_key

# API REST Configuration
PAYROLL_API_KEY=your_secret_key_for_rest_api
```

Notes

Classification: Gemini 2.5 is used to validate that the content matches a Spanish pay stub (or other supported type) before deep extraction.

AI-image detection: third‑party detectors are probabilistic. We surface their score as a signal, not a verdict.

Privacy: all artifacts stay within the data_rooms/ sandbox during the session unless persistence is enabled.

### Getting API Keys

1. **LandingAI**: Sign up at [landing.ai](https://landing.ai) and get your API key from settings
2. **AIorNOT**: Get your API key at [aiornot.com](https://aiornot.com)
3. **PAYROLL_API_KEY**: Generate a secure key to protect your REST API

---
##  ⚙️Key Features

| Feature | Description |
|----------|--------------|
| **Landing AI** | Parse & Extract API. |
| **AI or NOT** | GenAI generated image detector through API |
| **Gemini 2.5** | LLM to classify the documents based on their content. |

---
## 📥Installation

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build
```
---
## 📦Usage

### Web Interface

1. Access the application
2. Drag or select a pay stub file (PDF, PNG, JPG)
3. Click "Verify Pay Stub"
4. The system will process the document in 4 steps:
   - Document classification
   - AI manipulation detection
   - Data extraction
   - Information validation
5. Review the results and verification status
---
### ⏳REST API (Coming soon)

Check the complete API documentation at `/api-docs` or visit the "API" button in the web interface.

**Basic example:**

```bash
curl -X POST https://fakepay.ai/api/v1/verify \
  -H "Authorization: Bearer your_api_key" \
  -F "file=@paystub.pdf"
```
---
## 🔒Security

- LandingAI and AIorNOT API keys are stored as environment variables and never exposed to the client
- REST API requires authentication via Bearer token (Coming soon)
- All API keys must be configured through environment variables
- Do not include `.env.local` files in version control
---
## 🛠️Technologies

- **Next.js 16**: React framework with App Router
- **TypeScript**: Static typing
- **Tailwind CSS v4**: Styling
- **shadcn/ui**: UI components
- **LandingAI**: Document classification and extraction
- **AIorNOT**: AI-generated content detection
---
## 🎯What’s next

📄 New document types: bank statements, employment contracts, proof of address

🔬 Deeper forensics: layer analysis, error‑level analysis, signature tamper patterns

📚 Richer rules & datasets: broader Spanish variants and historical templates

🔗 Enable FakePay API: add a fremium model through token purchase and create a FakePay API.


