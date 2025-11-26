# 🚀 GUÍA RÁPIDA - Carga de Asignados desde CSV

## ¡Ya está lista la interfaz! ✅

Ahora puedes cargar datos de asignados directamente desde la web.

## Pasos Rápidos

### 1. Inicia Sesión
```
URL: http://localhost:5500/frontend/login.html
Email: test@test.com
Password: test123
```

### 2. Navega a Asignados
- Una vez logueado, verás la página principal
- Haz clic en el botón "Asignados" en la navegación

### 3. Prepara tu CSV
El archivo debe tener estos campos (en este orden):

```
tipo_compania,nombre_completo,dni,fecha_ingreso,cliente,zona,lider_zonal,jefe_operaciones,macrozona,jurisdiccion,sector
Privada,Juan Pérez,12345678,2022-01-15,Cliente A,Zona A,Lider 1,Jefe 1,MacroZona 1,Jurisdicción 1,Sector 1
Pública,María García,23456789,2021-03-20,Cliente B,Zona B,Lider 2,Jefe 2,MacroZona 2,Jurisdicción 2,Sector 2
```

**Obligatorios:**
- nombre_completo
- dni (debe ser único)

### 4. Carga el Archivo
- Haz clic en "Selecciona archivo CSV"
- Elige tu archivo .csv
- Haz clic en "Cargar Asignados"

### 5. Verifica los Resultados
Verás un mensaje con:
- ✨ Registros insertados
- 🔄 Registros actualizados
- ⚠️ Errores (si hay)

Y la tabla se actualizará automáticamente con los datos cargados.

## 📋 Límites
- Máximo 100,000 filas por carga
- Máximo 50 MB por archivo
- Velocidad: ~179 registros/segundo

## 🆘 Si algo no funciona

### El botón "Asignados" no aparece
✅ Ya está agregado. Recarga la página (Ctrl+F5)

### No puedo cargar el archivo
- Verifica que sea un archivo .csv
- Verifica que esté logueado (token válido)
- Verifica la conexión con el servidor (http://127.0.0.1:8000)

### Los datos no se guardan
- Verifica que el servidor backend esté corriendo
- Verifica la conexión a MongoDB
- Revisa la consola del navegador (F12)

## 📚 Documentación Completa

- `INTERFAZ_FRONTEND_ASIGNADOS.md` - Detalles técnicos
- `CARGA_CSV_ASIGNADOS.md` - Especificación del API
- `RESUMEN_FRONTEND_ASIGNADOS.md` - Resumen de implementación

## ✅ Lo que se implementó

✅ Botón de navegación "Asignados"
✅ Formulario de carga CSV
✅ Validación de archivos
✅ Tabla de resultados
✅ Integración con backend
✅ Manejo de errores
✅ Autenticación JWT

## 🎯 Próximos Pasos

1. Abre Live Server en `frontend/` (si aún no está abierto)
2. Login en la aplicación
3. ¡Carga tus asignados!

---

¿Problemas? Revisa los logs:
- Backend: http://127.0.0.1:8000/docs (Swagger)
- Frontend: F12 en navegador (Consola)
- MongoDB: nexus.liderman.net.pe:27017
