## 🚀 GUÍA PASO A PASO PARA HACER FUNCIONAR EL SISTEMA

### PASO 1: Preparar el Entorno (Una sola vez)

#### 1.1 Abre una terminal en la carpeta `backend`
```bash
cd c:/Users/aingar/Proyectos/proyecto-central-atencion/backend
```

#### 1.2 Activa el entorno virtual
```bash
source venv/Scripts/activate
```

Deberías ver algo como:
```
(venv) C:\Users\aingar\Proyectos\proyecto-central-atencion\backend>
```

---

### PASO 2: Inicializar la Base de Datos

#### 2.1 Ejecuta el script de inicialización
```bash
python init_db.py
```

**Deberías ver algo como esto:**
```
🔄 Inicializando base de datos...

ℹ No se pudo eliminar BD antigua (probablemente está en uso): ...
ℹ Continuando con inicialización...

✓ Tablas creadas correctamente

📝 Creando usuario administrador...
✓ Usuario administrador creado:
  Email: admin@central.com
  Contraseña: admin123
  Rol: administrador

👥 Agregando trabajadores de prueba...
✓ 8 trabajadores agregados

✅ Base de datos inicializada correctamente

==================================================
CREDENCIALES POR DEFECTO:
==================================================
Email: admin@central.com
Contraseña: admin123
==================================================
```

**✅ Si ves esto: ¡La BD está lista!**

---

### PASO 3: Iniciar el Servidor Backend

#### 3.1 Asegúrate que está activado el entorno virtual
Si no ves `(venv)` en tu terminal, ejecuta:
```bash
source venv/Scripts/activate
```

#### 3.2 Inicia el servidor
```bash
python -m uvicorn app:app --reload
```

**Deberías ver algo como:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**✅ Si ves esto: ¡El backend está corriendo!**

**NO cierres esta terminal**, déjala ejecutándose.

---

### PASO 4: Abrir la Interfaz Frontend

#### 4.1 Abre una NUEVA terminal (no cierres la del backend)

#### 4.2 Navega a la carpeta del proyecto
```bash
cd c:/Users/aingar/Proyectos/proyecto-central-atencion
```

#### 4.3 Abre el archivo HTML en el navegador
```bash
# En Windows bash, usa:
start frontend/index.html

# O simplemente abre el archivo manualmente en:
# c:\Users\aingar\Proyectos\proyecto-central-atencion\frontend\index.html
```

---

### PASO 5: Acceder al Sistema

#### 5.1 En el navegador deberías ver el login
Deberías ver un formulario con:
- Campo de Email
- Campo de Contraseña
- Botón "Iniciar Sesión"

#### 5.2 Ingresa las credenciales
```
Email: admin@central.com
Contraseña: admin123
```

#### 5.3 Haz click en "Iniciar Sesión"

**✅ Si entras: ¡El sistema funciona!**

---

### PASO 6: Probar el Autocomplete de DNI

#### 6.1 Ve a la pestaña "Incidencias"

#### 6.2 En el campo "DNI Trabajador" escribe:
```
12
```

**Deberías ver aparecer un dropdown con:**
```
12345678 | Juan Pérez        | Centro
```

#### 6.3 Haz click en el resultado
El campo se rellena automáticamente con: `12345678`

**✅ Si ves esto: ¡El autocomplete funciona!**

---

### PASO 7: Crear una Incidencia de Prueba

#### 7.1 En la pestaña "Incidencias"

#### 7.2 Completa el formulario:
- **DNI:** `12345678` (usa autocomplete)
- **ID Usuario:** Se rellena automáticamente
- **Estado:** Abierta
- **Formulario jerárquico:** Expande "Pago incorrecto" → "Planillas/Configuración de Pago"
- Marca algunas casillas

#### 7.3 Click en "Enviar Incidencia"

**✅ Si se envía sin errores: ¡Todo funciona!**

---

### PASO 8: Ver Reportes

#### 8.1 Ve a la pestaña "Reportes"

#### 8.2 Verás:
- La incidencia que acabas de crear
- Datos: DNI, estado, usuario, fecha

#### 8.3 Opcional: Filtra por DNI
```
Escribe en búsqueda: 123
Verás solo las incidencias con ese DNI
```

**✅ Si ves tus datos: ¡Los reportes funcionan!**

---

## 🐛 Si Algo No Funciona

### Error: "No se conecta al backend"
**Solución:**
1. Asegúrate que el backend está corriendo (`python -m uvicorn app:app --reload`)
2. Revisa que la terminal del backend NO tenga errores rojos
3. Recarga la página del navegador (F5)

### Error: "BD no existe"
**Solución:**
1. Cierra el navegador
2. Detén el backend (Ctrl+C en su terminal)
3. Ejecuta nuevamente: `python init_db.py`
4. Inicia el backend nuevamente
5. Abre el navegador

### Error: "Login fallido"
**Solución:**
1. Verifica que escribiste exactamente:
   - Email: `admin@central.com`
   - Contraseña: `admin123`
2. Sin espacios adicionales
3. Recarga la página (F5)

### Error: "El autocomplete no aparece"
**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a "Consola"
3. Mira si hay mensajes de error rojos
4. Si ves errores, avísame

---

## 📋 Checklist de Funcionamiento

Marca cada paso cuando lo completes:

- [ ] Terminal en `backend` abierta
- [ ] Entorno virtual activado `(venv)`
- [ ] Script `python init_db.py` ejecutado ✓
- [ ] Backend corriendo en `http://localhost:8000` ✓
- [ ] Frontend abierto en navegador ✓
- [ ] Login exitoso con admin ✓
- [ ] Autocomplete DNI funciona ✓
- [ ] Incidencia creada exitosamente ✓
- [ ] Reportes muestran la incidencia ✓

**Si todo está marcado: ¡Tu sistema está 100% funcional! 🎉**

---

## 💡 Comandos Rápidos de Referencia

```bash
# Activar entorno virtual
source venv/Scripts/activate

# Inicializar BD (primera vez)
python init_db.py

# Iniciar servidor (DEJAR CORRIENDO)
python -m uvicorn app:app --reload

# Ver documentación API (en navegador)
http://localhost:8000/docs

# Abrir frontend
start frontend/index.html
```

---

## 🎯 Próximos Pasos Después de que Funcione

1. **Crear usuarios gestores** (desde pestaña Usuarios como admin)
2. **Crear más incidencias** con diferentes datos
3. **Probar filtros** en reportes
4. **Agregar más trabajadores** si necesitas

---

**¿Necesitas ayuda con algo específico? ¡Avísame en qué paso tienes problemas!**
