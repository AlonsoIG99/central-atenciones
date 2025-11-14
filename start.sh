#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🚀 CENTRAL DE ATENCIÓN - Inicializador Rápido                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paso 1: Ir a carpeta backend
echo -e "${BLUE}[1/4] Navegando a carpeta backend...${NC}"
cd "$(dirname "$0")/backend" || exit 1
echo -e "${GREEN}✓ Carpeta backend encontrada${NC}"
echo ""

# Paso 2: Activar entorno virtual
echo -e "${BLUE}[2/4] Activando entorno virtual...${NC}"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠ Creando entorno virtual...${NC}"
    python -m venv venv
fi
source venv/Scripts/activate
echo -e "${GREEN}✓ Entorno virtual activado${NC}"
echo ""

# Paso 3: Inicializar BD
echo -e "${BLUE}[3/4] Inicializando base de datos...${NC}"
python init_db.py
echo -e "${GREEN}✓ Base de datos lista${NC}"
echo ""

# Paso 4: Iniciar servidor
echo -e "${BLUE}[4/4] Iniciando servidor FastAPI...${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ SISTEMA INICIADO CORRECTAMENTE${NC}"
echo ""
echo -e "${YELLOW}🌐 API disponible en:${NC}     http://localhost:8000"
echo -e "${YELLOW}📚 Documentación API:${NC}     http://localhost:8000/docs"
echo -e "${YELLOW}🎨 Frontend:${NC}              abrir frontend/index.html"
echo ""
echo -e "${YELLOW}🔐 Credenciales:${NC}"
echo "   Email: admin@central.com"
echo "   Contraseña: admin123"
echo ""
echo -e "${YELLOW}⚠ NO CIERRES ESTA TERMINAL MIENTRAS USES EL SISTEMA${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
echo ""

python -m uvicorn app:app --reload
