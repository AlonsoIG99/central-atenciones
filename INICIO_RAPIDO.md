# ⚡ INICIO RÁPIDO - 3 OPCIONES

## OPCIÓN 1: Con Script (La más fácil) ⭐ RECOMENDADA

### En Windows:
1. Ve a la carpeta raíz del proyecto
2. **Haz doble click en: `start.bat`**
3. Espera a que aparezca el mensaje de éxito
4. Abre en navegador: `frontend/index.html`

```
¡Listo! Todo se inicia automáticamente.
```

### En Linux/Mac:
```bash
cd proyecto-central-atencion
bash start.sh
```

---

## OPCIÓN 2: Manualmente (Paso a Paso)

### Terminal 1 - Backend

```bash
# 1. Ve a la carpeta backend
cd c:/Users/aingar/Proyectos/proyecto-central-atencion/backend

# 2. Activa el entorno virtual
source venv/Scripts/activate

# 3. Inicializa la BD
python init_db.py

# 4. Inicia el servidor (NO CIERRES ESTA TERMINAL)
python -m uvicorn app:app --reload
```

### Terminal 2 - Frontend

```bash
# 1. Ve a la carpeta raíz
cd c:/Users/aingar/Proyectos/proyecto-central-atencion

# 2. Abre el navegador
start frontend/index.html
```

---

## OPCIÓN 3: Sin Scripts (Si no funciona el .bat)

### Paso 1: Abre PowerShell o CMD
Presiona: **Windows Key + R** → Escribe `powershell` → Enter

### Paso 2: Navega al backend
```powershell
cd "C:\Users\aingar\Proyectos\proyecto-central-atencion\backend"
```

### Paso 3: Activa entorno virtual
```powershell
.\venv\Scripts\Activate.ps1
```

### Paso 4: Inicializa BD
```powershell
python init_db.py
```

### Paso 5: Inicia servidor
⚠️ **IMPORTANTE:** Usa este comando (NO `python app.py`):
```powershell
python -m uvicorn app:app --reload
```

Deberías ver:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Paso 6: En OTRA ventana, abre frontend
Presiona: **Windows Key + R** → Escribe:
```
C:\Users\aingar\Proyectos\proyecto-central-atencion\frontend\index.html
```

---

## ✅ ¿Cómo Saber que Todo Funciona?

### Backend (Deberías ver algo como esto)
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Frontend (Deberías ver)
- Un formulario de login
- Campo de Email y Contraseña
- Botón "Iniciar Sesión"

### Login (Credentials)
```
Email: admin@central.com
Contraseña: admin123
```

### Después de Login (Deberías ver)
- Pestaña: Usuarios
- Pestaña: Incidencias ← PRUEBA AQUÍ EL AUTOCOMPLETE
- Pestaña: Reportes

---

## 🎯 PRUEBA EL AUTOCOMPLETE

1. Ve a pestaña **Incidencias**
2. En el campo **DNI Trabajador** escribe: `12`
3. Deberías ver aparecer:
```
12345678 | Juan Pérez        | Centro
```
4. Haz click → Se rellena el campo
5. ¡LISTO! ✅

---

## 🆘 Si No Funciona

### Problema: "Error al inicializar BD"
```bash
# Solución:
# 1. Cierra todas las ventanas
# 2. Ejecuta nuevamente start.bat
# 3. Espera a que termine
```

### Problema: "No se conecta al API"
```bash
# Solución:
# 1. Revisa que la terminal del backend NO tenga errores rojos
# 2. Recarga la página (Ctrl+F5)
# 3. Verifica que dice: "Application startup complete"
```

### Problema: "Login no funciona"
```bash
# Solución:
# 1. Abre consola del navegador (F12)
# 2. Ve a pestaña "Consola"
# 3. Busca mensajes de error rojo
# 4. Verifica credenciales (sin espacios)
```

### Problema: "Autocomplete no aparece"
```bash
# Solución:
# 1. Abre consola del navegador (F12)
# 2. Ve a pestaña "Red" (Network)
# 3. Escribe un DNI
# 4. Busca request a /trabajadores/buscar/12...
# 5. Si no aparece, revisa que el backend esté corriendo
```

---

## 📊 Resumen de URLs

| Cosa | URL |
|------|-----|
| **API** | http://localhost:8000 |
| **Docs API** | http://localhost:8000/docs |
| **Frontend** | file:///C:/Users/aingar/Proyectos/proyecto-central-atencion/frontend/index.html |

---

## 🎓 Archivos Importantes

```
proyecto-central-atencion/
├── start.bat ← HACES DOBLE CLICK AQUÍ (Windows)
├── start.sh  ← O ejecutas esto (Linux/Mac)
├── README.md ← Documentación completa
│
├── backend/
│   ├── app.py ← API principal
│   ├── init_db.py ← Inicializar BD
│   └── database.py ← Conexión BD
│
└── frontend/
    └── index.html ← ABRES ESTO EN NAVEGADOR
```

---

## 🚀 TL;DR (Muy Resumido)

```bash
# 1. Windows: Doble click en start.bat
# 2. Espera mensaje de éxito
# 3. Abre frontend/index.html
# 4. Login: admin@central.com / admin123
# 5. ¡Listo!
```

**¿Problemas? Revisa la sección "Si No Funciona"**
