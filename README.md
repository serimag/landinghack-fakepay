# payshit.ai - Verificación de Nóminas

Sistema de validación automática de nóminas españolas utilizando IA para detectar fraudes y verificar autenticidad.

## Características

- 📄 **Clasificación de Documentos**: Identifica automáticamente el tipo de documento usando LandingAI
- 🤖 **Detección de IA**: Detecta si el documento ha sido generado o manipulado por IA usando AIorNOT
- 📊 **Extracción de Datos**: Extrae información clave de las nóminas
- ✅ **Validación Automática**: Verifica fechas, formatos de NIF/CIF, y cálculos de nómina
- 🔌 **API REST**: Integra la verificación en tus aplicaciones mediante API

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

\`\`\`bash
# LandingAI Configuration
LANDINGAI_API_KEY=tu_api_key_de_landingai
LANDINGAI_ENDPOINT_ID=tu_endpoint_id

# AIorNOT Configuration
AIORNOT_API_KEY=tu_api_key_de_aiornot

# API REST Configuration
PAYROLL_API_KEY=tu_clave_secreta_para_api_rest

# Web Interface Password (opcional, por defecto usa PAYROLL_API_KEY)
WEB_PASSWORD=tu_contraseña_para_acceso_web
\`\`\`

### Obtener API Keys

1. **LandingAI**: Regístrate en [landing.ai](https://landing.ai) y crea un endpoint de clasificación de documentos
2. **AIorNOT**: Obtén tu API key en [aiornot.com](https://aiornot.com)
3. **PAYROLL_API_KEY**: Genera una clave segura para proteger tu API REST
4. **WEB_PASSWORD**: Define una contraseña para el acceso web (opcional)

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

### Interfaz Web

1. Accede a la aplicación e introduce la contraseña
2. Arrastra o selecciona un archivo de nómina (PDF, PNG, JPG)
3. Haz clic en "Verificar Nómina"
4. El sistema procesará el documento en 4 pasos:
   - Clasificación del documento
   - Detección de manipulación por IA
   - Extracción de datos
   - Validación de información
5. Revisa los resultados y el estado de verificación

### API REST

Consulta la documentación completa de la API en `/api-docs` o visita el botón "API" en la interfaz web.

**Ejemplo básico:**

\`\`\`bash
curl -X POST https://payshit.ai/api/v1/verify \
  -H "Authorization: Bearer tu_api_key" \
  -F "file=@nomina.pdf"
\`\`\`

## Seguridad

- Las API keys de LandingAI y AIorNOT se almacenan como variables de entorno y nunca se exponen al cliente
- La API REST requiere autenticación mediante Bearer token
- Todas las contraseñas y claves deben configurarse mediante variables de entorno
- No incluyas archivos `.env.local` en el control de versiones

## Tecnologías

- **Next.js 16**: Framework de React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS v4**: Estilos
- **shadcn/ui**: Componentes de UI
- **LandingAI**: Clasificación y extracción de documentos
- **AIorNOT**: Detección de contenido generado por IA

## Modo de Desarrollo

Si no tienes las API keys configuradas, el sistema funcionará en modo de desarrollo con datos simulados para que puedas probar la interfaz.

## Licencia

MIT
