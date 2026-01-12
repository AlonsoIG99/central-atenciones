# 🛠️ GUÍA DE IMPLEMENTACIÓN - CORRECCIONES DE SEGURIDAD

## ✅ CORRECCIONES IMPLEMENTADAS

### 1. ✅ Migración a bcrypt para contraseñas

- **Archivo:** `backend/auth.py`
- **Cambio:** SHA256 → bcrypt (factor de trabajo 12)
- **Estado:** Implementado

### 2. ✅ Eliminación de credenciales hardcodeadas

- **Archivos:**
  - `backend/auth.py` (JWT_SECRET_KEY)
  - `backend/database.py` (MongoDB)
  - `backend/minio_config.py` (MinIO)
- **Cambio:** Todas las credenciales ahora provienen de variables de entorno
- **Estado:** Implementado

### 3. ✅ Eliminación de exposición de hashes en API

- **Archivos:**
  - `backend/schemas/usuario.py`
  - `backend/routes/usuarios.py`
- **Cambio:** Campo `contraseña` eliminado de todas las respuestas API
- **Estado:** Implementado

### 4. ✅ Rate Limiting implementado

- **Archivo:** `backend/routes/auth.py`
- **Cambio:** Máximo 5 intentos de login por minuto por IP
- **Librería:** slowapi
- **Estado:** Implementado

### 5. ✅ CORS específicos configurados

- **Archivo:** `backend/app.py`
- **Cambio:**
  - Desarrollo: lista específica de orígenes permitidos
  - Producción: solo dominios oficiales
- **Estado:** Implementado

### 6. ✅ Headers de seguridad agregados

- **Archivo:** `backend/app.py`
- **Headers agregados:**
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (solo producción)
- **Estado:** Implementado

### 7. ✅ Timeouts de seguridad en MongoDB

- **Archivo:** `backend/database.py`
- **Timeouts configurados:**
  - serverSelectionTimeoutMS: 5000
  - connectTimeoutMS: 10000
  - socketTimeoutMS: 30000
- **Estado:** Implementado

---

## 📋 PASOS PARA APLICAR LAS CORRECCIONES

### Paso 1: Instalar dependencias nuevas

```bash
cd backend
pip install -r requirements.txt
```

**Nueva dependencia:** `slowapi==0.1.9`

---

### Paso 2: Configurar variables de entorno

1. Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Edita `.env` y configura tus credenciales:

```bash
# Generar JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Copiar el resultado en .env
JWT_SECRET_KEY=<tu-clave-generada>
```

**IMPORTANTE:**

- ⚠️ NUNCA subir `.env` a Git
- ✅ Verificar que `.env` esté en `.gitignore`
- 🔄 Rotar las credenciales de MongoDB y MinIO si fueron expuestas

---

### Paso 3: Migrar contraseñas existentes

Las contraseñas existentes están en formato SHA256 y deben migrarse a bcrypt.

**Opción A: Migración automática con contraseña temporal**

```bash
cd backend
python migrar_bcrypt.py migrar
```

Esto establecerá la contraseña `CambiarMe2026!` para todos los usuarios.

**Opción B: Crear nuevo usuario administrador**

```bash
python migrar_bcrypt.py admin
```

Credenciales:

- Email: `admin@liderman.net.pe`
- Contraseña: `Admin2026!`

⚠️ **Cambiar la contraseña inmediatamente después del primer login**

---

### Paso 4: Actualizar .gitignore

Verificar que `.env` esté ignorado:

```bash
# Ver contenido de .gitignore
cat .gitignore | grep .env
```

Debe mostrar:

```
.env
.env.local
```

Si no está, agregar:

```bash
echo ".env" >> .gitignore
```

---

### Paso 5: Limpiar historial de Git (si credenciales fueron expuestas)

⚠️ **CRÍTICO si credenciales reales estuvieron en Git**

```bash
# Listar archivos a limpiar
echo "backend/.env" > files-to-clean.txt

# Usar BFG Repo Cleaner (recomendado)
java -jar bfg.jar --delete-files files-to-clean.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# O usar git filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push
git push origin --force --all
```

**Alternativa más simple:** Rotar TODAS las credenciales expuestas

---

### Paso 6: Probar la aplicación

1. Iniciar el servidor:

```bash
cd backend
uvicorn app:app --reload
```

2. Probar login con rate limiting:

```bash
# Debería funcionar las primeras 5 veces
for i in {1..6}; do
  curl -X POST http://localhost:8000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo "Intento $i"
done

# El 6to intento debería retornar: 429 Too Many Requests
```

3. Verificar headers de seguridad:

```bash
curl -I http://localhost:8000/
```

Debe incluir:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

### Paso 7: Notificar a usuarios (si se usó migración automática)

Si ejecutaste la migración automática, todos los usuarios tienen contraseña temporal.

**Email de notificación sugerido:**

```
Asunto: Actualización de Seguridad - Cambio de Contraseña Requerido

Estimado usuario,

Hemos implementado mejoras de seguridad en el sistema Central de Atención.
Como parte de esta actualización, es necesario que cambies tu contraseña.

Credenciales temporales:
- Tu email: [email-del-usuario]
- Contraseña temporal: CambiarMe2026!

Por favor:
1. Inicia sesión con la contraseña temporal
2. Cambia tu contraseña inmediatamente

Agradecemos tu comprensión.

Saludos,
Equipo de TI
```

---

## 🔍 VERIFICACIÓN POST-IMPLEMENTACIÓN

### Checklist de Seguridad

- [ ] `pip list | grep bcrypt` muestra bcrypt instalado
- [ ] `.env` contiene JWT_SECRET_KEY (no hardcodeada en código)
- [ ] `.env` NO está en Git (`git status` no lo muestra)
- [ ] Rate limiting funciona (6to intento de login falla con 429)
- [ ] Headers de seguridad presentes en respuestas
- [ ] API de usuarios NO retorna campo `contraseña`
- [ ] Login con contraseña temporal funciona
- [ ] MongoDB se conecta correctamente con nuevas variables
- [ ] MinIO se conecta correctamente con nuevas variables

### Pruebas de Seguridad

```bash
# 1. Verificar que contraseñas no se exponen
curl http://localhost:8000/usuarios/ | jq '.[0]'
# NO debe mostrar campo "contraseña"

# 2. Verificar rate limiting
for i in {1..7}; do curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'; done
# Debe fallar en el intento 6 o 7

# 3. Verificar que credenciales vienen de .env
grep -r "Jdg27aCQqOzR" backend/*.py
# NO debe encontrar nada (credenciales no hardcodeadas)
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Error: "JWT_SECRET_KEY no configurada"

**Solución:** Agregar a `.env`:

```bash
JWT_SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
```

### Error: "ModuleNotFoundError: No module named 'slowapi'"

**Solución:**

```bash
pip install slowapi==0.1.9
```

### Error: Login no funciona después de migración

**Solución:** Usar contraseña temporal `CambiarMe2026!` o crear nuevo usuario:

```bash
python migrar_bcrypt.py admin
```

### Error: MongoDB no conecta

**Solución:** Verificar credenciales en `.env`:

```bash
cat .env | grep MONGODB
```

Verificar conectividad:

```bash
python -c "from backend.database import conectar_db"
```

---

## 📈 PRÓXIMOS PASOS (Mejoras Adicionales)

### Prioridad Alta

1. Implementar token blacklist para logout seguro
2. Agregar logging de eventos de seguridad
3. Implementar HTTPS redirect en producción

### Prioridad Media

4. Migrar tokens a cookies HttpOnly
5. Agregar validación robusta de inputs
6. Implementar 2FA (autenticación de dos factores)

### Prioridad Baja

7. Auditorías de seguridad periódicas
8. Penetration testing
9. Monitoreo de intentos de intrusión

---

## 📞 SOPORTE

Si encuentras problemas durante la implementación:

1. Revisa los logs del servidor: `uvicorn app:app --reload`
2. Consulta la documentación: `AUDITORIA_SEGURIDAD.md`
3. Revierte cambios si es necesario: `git checkout <archivo>`

---

**Última actualización:** 9 de Enero de 2026  
**Versión:** 1.0
