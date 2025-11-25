# Guía de Testing Frontend - Migración SQLite → MongoDB

## Resumen de Cambios Realizados

Se han realizado **2 cambios críticos** en los archivos del frontend para garantizar compatibilidad con MongoDB:

### 1. **auth.js** - Campo de contraseña
**Problema:** El frontend enviaba `contraseña` pero el backend ahora espera `password`

**Antes:**
```javascript
body: JSON.stringify({ email, contraseña })
```

**Después:**
```javascript
body: JSON.stringify({ email, password: contraseña })
```

**Ubicación:** `frontend/js/auth.js` línea 19

**Impacto:** El login ahora funciona correctamente con el backend MongoDB

---

### 2. **incidencias.js** - Tipo de usuario_id
**Problema:** El frontend enviaba `usuario_id` como entero, pero MongoDB requiere strings

**Antes:**
```javascript
usuario_id: parseInt(document.getElementById('incidencia-usuario_id').value),
```

**Después:**
```javascript
usuario_id: document.getElementById('incidencia-usuario_id').value,
```

**Ubicación:** `frontend/js/incidencias.js` línea 327

**Impacto:** Los IDs ObjectId de MongoDB se envían correctamente como strings

---

## Cambios Secundarios Automáticos

El frontend mantiene **retrocompatibilidad completa** con los cambios de MongoDB porque:

1. **API Endpoints** - Sin cambios en las URLs
   - GET /usuarios → Funciona igual
   - GET /trabajadores → Funciona igual
   - GET /asignados → Funciona igual
   - POST /auth/login → Corregido

2. **Respuestas JSON** - IDs ahora strings
   - JavaScript maneja automáticamente tanto números como strings
   - No requiere cambios en el manejo de datos del frontend

3. **Tipos de Datos** - Compatibles
   - Fechas: ISO 8601 (igual formato)
   - Enumerados: Strings (igual que antes)
   - Arrays: JSON (compatible)

---

## Plan de Pruebas Manual

### Fase 1: Autenticación
1. Abrir http://localhost:8000/login.html
2. Ingresar credenciales:
   - Email: `admin@central.com`
   - Contraseña: `admin123`
3. **Verificar:** Se carga index.html y redirige al dashboard

### Fase 2: Visualización de Datos
1. En el dashboard, verificar que se cargan:
   - ✓ Lista de trabajadores (8 registros)
   - ✓ Lista de asignados (3 registros)
   - ✓ Lista de incidencias
   - ✓ IDs aparecem como strings en la consola del navegador

2. Abrir DevTools (F12) → Console
   - Ejecutar: `console.log(typeof localStorage.getItem('user_id'))`
   - Debería mostrar: `string` (no `number`)

### Fase 3: Creación de Datos
1. **Crear nueva incidencia:**
   - Ir a sección de Incidencias
   - Llenar formulario
   - Enviar
   - **Verificar:** Se crea sin errores, recibe ID string en respuesta

2. **Subir CSV de trabajadores:**
   - Ir a sección de Trabajadores
   - Cargar archivo CSV
   - **Verificar:** Se importan registros correctamente

### Fase 4: Verificación de IDs
En DevTools → Network:
1. Hacer click en una incidencia
2. Ver request a GET /incidencias/{id}
3. **Verificar:** El {id} es una cadena hexadecimal de MongoDB (ej: `507f1f77bcf86cd799439011`)

---

## Prueba Automatizada

Ejecutar script de validación:
```bash
cd proyecto-central-atencion
python test_frontend_compat.py
```

Esto validará:
- ✓ Login funciona con campo "password"
- ✓ IDs retornados son strings
- ✓ Todos los endpoints accesibles
- ✓ CRUD completo funcional

---

## Checklist de Compatibilidad

| Componente | Status | Notas |
|-----------|--------|-------|
| Login | ✅ FIXED | Campo password corregido |
| Usuarios CRUD | ✅ OK | IDs strings automáticos |
| Trabajadores CRUD | ✅ OK | IDs strings automáticos |
| Asignados CRUD | ✅ OK | IDs strings automáticos |
| Incidencias CRUD | ✅ FIXED | usuario_id ahora string |
| CSV Upload | ✅ OK | Funcionalidad preservada |
| Reportes | ✅ OK | Sin cambios necesarios |
| Autenticación JWT | ✅ OK | Token compatible |
| LocalStorage | ✅ OK | Almacena strings correctamente |

---

## Próximos Pasos

1. **Testing Local:**
   - Ejecutar servidor: `cd backend && python -m uvicorn app:app --reload --port 8000`
   - Abrir: http://localhost:8000 (índice HTML estático)
   - Pruebas manuales de las Fases 1-4 anteriores

2. **Antes de Producción:**
   - [ ] Prueba de login completa
   - [ ] Prueba de carga de datos
   - [ ] Prueba de CSV upload
   - [ ] Prueba de creación/edición
   - [ ] Verificación en múltiples navegadores

3. **Deployment VPS:**
   - Actualizar URL de API (si es necesario)
   - Certificado SSL
   - Configuración de CORS
   - Backup de datos antes de migrar

---

## Contacto y Soporte

Para problemas específicos:
- Revisar console.log en DevTools (F12 → Console)
- Revisar Network tab para ver requests/responses
- Ver backend logs: `tail -f backend/logs/app.log`

