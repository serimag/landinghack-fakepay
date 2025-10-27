# payshit.ai - Verificación de Nóminas

Sistema de validación automática de nóminas españolas utilizando IA para detectar fraudes y verificar autenticidad.

## Características

- 📄 **Clasificación de Documentos**: Identifica automáticamente el tipo de documento usando LandingAI
- 🤖 **Detección de IA**: Detecta si el documento ha sido generado o manipulado por IA usando AIorNOT
- 📊 **Extracción de Datos**: Extrae información clave de las nóminas
- ✅ **Validación Automática**: Verifica fechas, formatos de NIF/CIF, y cálculos de nómina

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

\`\`\`bash
# LandingAI Configuration
LANDINGAI_API_KEY=tu_api_key_de_landingai
LANDINGAI_ENDPOINT_ID=tu_endpoint_id

# AIorNOT Configuration
AIORNOT_API_KEY=tu_api_key_de_aiornot
\`\`\`

### Obtener API Keys

1. **LandingAI**: Regístrate en [landing.ai](https://landing.ai) y crea un endpoint de clasificación de documentos
2. **AIorNOT**: Obtén tu API key en [aiornot.com](https://aiornot.com)

## Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
\`\`\`

## Uso

1. Arrastra o selecciona un archivo de nómina (PDF, PNG, JPG)
2. Haz clic en "Verificar Nómina"
3. El sistema procesará el documento en 4 pasos:
   - Clasificación del documento
   - Detección de manipulación por IA
   - Extracción de datos
   - Validación de información
4. Revisa los resultados y el estado de verificación

## Tecnologías

- **Next.js 16**: Framework de React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS v4**: Estilos
- **shadcn/ui**: Componentes de UI
- **LandingAI**: Clasificación de documentos
- **AIorNOT**: Detección de contenido generado por IA

## Modo de Desarrollo

Si no tienes las API keys configuradas, el sistema funcionará en modo de desarrollo con datos simulados para que puedas probar la interfaz.

## Licencia

MIT
