# fakepay.ai - Pay Stubs Verification

Summary --> Automatic validation system for Spanish pay stubs using AI to detect fraud and verify authenticity.

**Why FakePay?**

With the rise of GenAI applications the risk of GenAI-driven fraud in document forging is exploding, and we want to help clients in the financial services industry to tackle these kinds of risks. 

Our vision is to create an easy to deploy API that can be included in current IDP processes in order to give a reliable OK / KO. For now we've create a first version with a web-app demo and focused in Spanish Pay Stubs. 

**About Us**

We're the leading company providing Intelligent Document Processing services in Spain, focused in the banking industry processing >1 million pages per day. 

We're based in Barcelona, founded in 2007 and a strong expertise in NLP and Computer Vision. 


## FakePay Features

- 📄 **Document Classification**: Automatically identifies document type using LandingAI - Parse API
- 🤖 **AI Detection**: Detects if the document has been generated or manipulated by AI using AIorNOT
- 📊 **Data Extraction**: Extracts key information from pay stubs - Extract API
- ✅ **Automatic Validation**: Verifies dates, NIF/CIF formats, and internal earnings calculations
- 🔌 **REST API**: Integrate verification into your applications via API

## Configuration

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

### Getting API Keys

1. **LandingAI**: Sign up at [landing.ai](https://landing.ai) and get your API key from settings
2. **AIorNOT**: Get your API key at [aiornot.com](https://aiornot.com)
3. **PAYROLL_API_KEY**: Generate a secure key to protect your REST API

## Installation

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build
```

## Usage

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

### REST API (Coming soon)

Check the complete API documentation at `/api-docs` or visit the "API" button in the web interface.

**Basic example:**

```bash
curl -X POST https://fakepay.ai/api/v1/verify \
  -H "Authorization: Bearer your_api_key" \
  -F "file=@paystub.pdf"
```

## Security

- LandingAI and AIorNOT API keys are stored as environment variables and never exposed to the client
- REST API requires authentication via Bearer token (Coming soon)
- All API keys must be configured through environment variables
- Do not include `.env.local` files in version control

## Technologies

- **Next.js 16**: React framework with App Router
- **TypeScript**: Static typing
- **Tailwind CSS v4**: Styling
- **shadcn/ui**: UI components
- **LandingAI**: Document classification and extraction
- **AIorNOT**: AI-generated content detection

From here we'd like to keep working to add more documents, user management and a fremium model through token purchase and create a FakePay API.


