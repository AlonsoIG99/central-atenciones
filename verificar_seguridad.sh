#!/bin/bash
# Script de verificación de seguridad post-implementación

echo "🔐 VERIFICACIÓN DE SEGURIDAD - Central de Atención"
echo "=================================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Función de verificación
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAILED++))
    fi
}

# 1. Verificar que .env existe
echo "1. Verificando archivo .env..."
if [ -f "backend/.env" ]; then
    check ".env existe"
else
    echo -e "${RED}❌ FAIL${NC}: .env no existe"
    ((FAILED++))
fi

# 2. Verificar que .env está en .gitignore
echo ""
echo "2. Verificando .gitignore..."
grep -q "^\.env$" .gitignore
check ".env está en .gitignore"

# 3. Verificar que .env no está en Git
echo ""
echo "3. Verificando que .env NO está trackeado en Git..."
! git ls-files | grep -q "backend/.env"
check ".env NO está en Git"

# 4. Verificar variables de entorno requeridas
echo ""
echo "4. Verificando variables de entorno en .env..."

check_env_var() {
    grep -q "^$1=" backend/.env
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $1 está configurada"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $1 NO está configurada"
        ((FAILED++))
    fi
}

check_env_var "JWT_SECRET_KEY"
check_env_var "MONGODB_HOST"
check_env_var "MONGODB_USER"
check_env_var "MONGODB_PASSWORD"
check_env_var "MINIO_ENDPOINT"
check_env_var "MINIO_ACCESS_KEY"
check_env_var "MINIO_SECRET_KEY"

# 5. Verificar que credenciales NO están hardcodeadas
echo ""
echo "5. Verificando que NO hay credenciales hardcodeadas..."

! grep -r "tu-clave-secreta-muy-segura" backend/*.py > /dev/null 2>&1
check "No hay SECRET_KEY hardcodeada"

! grep -r "Jdg27aCQqOzR" backend/*.py > /dev/null 2>&1
check "No hay password de MongoDB hardcodeada"

! grep -r "wZ8pDqV2sX9m" backend/*.py > /dev/null 2>&1
check "No hay secret de MinIO hardcodeada"

# 6. Verificar dependencias instaladas
echo ""
echo "6. Verificando dependencias..."

pip show bcrypt > /dev/null 2>&1
check "bcrypt instalado"

pip show slowapi > /dev/null 2>&1
check "slowapi instalado"

# 7. Verificar imports correctos
echo ""
echo "7. Verificando imports en código..."

grep -q "import bcrypt" backend/auth.py
check "bcrypt importado en auth.py"

grep -q "from slowapi import Limiter" backend/app.py
check "slowapi importado en app.py"

# 8. Verificar que funciones de bcrypt están implementadas
echo ""
echo "8. Verificando funciones de seguridad..."

grep -q "bcrypt.gensalt" backend/auth.py
check "bcrypt.gensalt implementado"

grep -q "bcrypt.checkpw" backend/auth.py
check "bcrypt.checkpw implementado"

# 9. Verificar rate limiting
echo ""
echo "9. Verificando rate limiting..."

grep -q "@limiter.limit" backend/routes/auth.py
check "Rate limiter decorador presente"

# 10. Verificar headers de seguridad
echo ""
echo "10. Verificando middleware de seguridad..."

grep -q "SecurityHeadersMiddleware" backend/app.py
check "SecurityHeadersMiddleware definido"

grep -q "X-Content-Type-Options" backend/app.py
check "Header X-Content-Type-Options configurado"

grep -q "X-Frame-Options" backend/app.py
check "Header X-Frame-Options configurado"

# 11. Verificar CORS específicos
echo ""
echo "11. Verificando configuración de CORS..."

! grep -q 'origins = \["\*"\]' backend/app.py
check "CORS no usa wildcard (*)"

# 12. Verificar que contraseñas NO se exponen en API
echo ""
echo "12. Verificando schemas..."

! grep -q '"contraseña":' backend/routes/usuarios.py
check "Campo contraseña NO expuesto en rutas"

# RESUMEN
echo ""
echo "=================================================="
echo "RESUMEN DE VERIFICACIÓN"
echo "=================================================="
echo -e "${GREEN}Pruebas pasadas: $PASSED${NC}"
echo -e "${RED}Pruebas fallidas: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todas las verificaciones pasaron!${NC}"
    echo ""
    echo "Siguiente paso: Migrar contraseñas"
    echo "  python backend/migrar_bcrypt.py migrar"
    exit 0
else
    echo -e "${RED}⚠️  Algunas verificaciones fallaron${NC}"
    echo ""
    echo "Revisa los errores arriba y corrige antes de continuar"
    echo "Consulta: IMPLEMENTACION_SEGURIDAD.md"
    exit 1
fi
