# 📊 ANÁLISIS: CARGA DE CSV PARA TRABAJADORES

## 🎯 TU REQUERIMIENTO

```
El admin debe cargar un CSV semanal con:
- Trabajadores existentes
- Trabajadores nuevos
- Validar duplicados por DNI
- Actualizar solo si cambió
```

---

## 🏗️ ARQUITECTURA DE LA SOLUCIÓN

### **FLUJO RESUMIDO:**

```
CSV → Lectura → Validación → Agrupación por DNI → Procesamiento BD → Resumen

Procesamiento por DNI:
├─ Si existe en BD → UPDATE
├─ Si NO existe → INSERT
└─ Si hay duplicados en CSV → Usa última fila
```

---

## 🔑 DECISIONES CLAVE

### **1. ¿Cómo manejar duplicados en CSV?**

**Opción A:** Rechazar el CSV si hay DNI duplicados ❌
- Problema: El user debe "limpiar" antes
- Usuario: frustración

**Opción B:** Usar la ÚLTIMA fila si hay duplicados ✅
- Solución simple
- User puede tener una fila actualizada al final
- Lógica: `filas_por_dni[dni] = fila` (sobrescribe)

**→ RECOMENDACIÓN: Opción B**

---

### **2. ¿UPDATE o DELETE+INSERT?**

**Opción A:** UPDATE (si existe) ✅
```python
if dni_existe:
    trabajador.nombre = datos_nuevos
    trabajador.apellido = datos_nuevos
    trabajador.zona = datos_nuevos
```

**Ventaja:**
- Preserva ID
- Histórico intacto
- Más eficiente

**→ RECOMENDACIÓN: UPDATE**

---

### **3. ¿Validar antes o después?**

**Opción A:** Validar línea por línea, registrar errores, continuar ✅
```python
# Fila 5: DNI vacío → Error pero continúa
# Fila 6: Válida → Procesa
# Fila 7: Nombre vacío → Error pero continúa
# Resultado: 45 procesadas, 2 con error
```

**Ventaja:**
- No pierdes trabajo por una fila mala
- User ve exactamente dónde está el problema
- Más profesional

**→ RECOMENDACIÓN: Validar línea por línea, registrar errores**

---

### **4. ¿Qué tan grande puede ser el archivo?**

**Propuesta:**
```
Máximo: 5MB
Razón: Típicamente 5MB = ~100k trabajadores (más que suficiente)
Validación en frontend: Rechaza antes de enviar
Validación en backend: Double-check
```

---

### **5. ¿Logging y auditoría?**

**Básico (Fase 1):**
```
- Usuario: admin@company.com
- Timestamp: 2024-11-18 10:30:00
- Insertados: 5
- Actualizados: 45
- Errores: 0
```

**Avanzado (Fase 2):**
```
- Registrar qué cambió para cada trabajador
- Permite "deshacer" última carga
- Historial de cambios
```

---

## 📋 IMPLEMENTACIÓN TÉCNICA

### **Backend Stack:**

```python
# Dependencias nuevas:
from fastapi import UploadFile, File
import csv
from io import StringIO

# Endpoint:
POST /trabajadores/cargar-csv
├─ Input: File (CSV)
├─ Auth: Solo admin
└─ Output: {insertados: X, actualizados: Y, errores: Z, detalles: [...]}

# Validaciones:
1. ¿Es admin?
2. ¿Archivo es CSV?
3. ¿Encoding es UTF-8?
4. ¿Columnas correctas?
5. ¿Campos no vacíos?
6. ¿Tamaño <5MB?
```

### **Frontend Stack:**

```html
<!-- Nuevo HTML (solo visible para admin): -->
<form id="csv-form">
  <input type="file" accept=".csv" required>
  <button type="submit">Cargar CSV</button>
</form>
<div id="csv-resultado">
  Resumen: X insertados, Y actualizados, Z errores
</div>

<!-- JavaScript: -->
1. Validar archivo (tipo, tamaño)
2. Enviar con FormData
3. Mostrar progreso
4. Procesar respuesta
5. Mostrar resumen
6. Recargar lista
```

---

## 🚀 VENTAJAS DE ESTA SOLUCIÓN

```
✅ Simple de implementar (1-2 horas)
✅ Eficiente (procesa miles de registros en segundos)
✅ Flexible (tolera DNI duplicados en CSV)
✅ Seguro (validaciones en frontend y backend)
✅ Informativo (resumen detallado de cambios)
✅ Reversible (fácil exportar BD a CSV de vuelta)
✅ Escalable (puede procesar 100k+ registros)
✅ Admin-friendly (interfaz clara y errores descriptivos)
```

---

## ⚠️ CASOS EDGE

### **Caso 1: DNI duplicado en BD (constraint unique)**

**Solución:** Ya existe constraint en modelo:
```python
dni = Column(String, unique=True, index=True, nullable=False)
```

Si intenta INSERT con DNI duplicado → Error de BD
→ Pero esto NO pasa porque primero hacemos SELECT para verificar

---

### **Caso 2: CSV con saltos de línea raros**

**Solución:** Python csv.DictReader maneja esto automáticamente
```python
csv_reader = csv.DictReader(StringIO(file_content))
# Funciona con \n, \r\n, \r
```

---

### **Caso 3: Nombres con tildes o caracteres especiales**

**Solución:** UTF-8 encoding
```python
contenido = await file.read()
contenido_str = contenido.decode('utf-8')  # ← Maneja tildes, acentos, etc.
```

---

## 📊 EJEMPLO DE FLUJO REAL

```
CSV entrada (5 filas + header):
---
dni,nombre,apellido,zona
12345678,Juan,Pérez,Centro
87654321,María,López,Norte
11223344,Carlos,García,Sur
12345678,Juan,Pérez Actualizado,Centro Nuevo
55667788,Ana,Martínez,Este

BD antes:
---
id | dni      | nombre | apellido | zona
1  | 12345678 | Juan   | Pérez    | Centro
2  | 87654321 | María  | López    | Norte

PROCESAMIENTO:
---
Fila 1: dni=12345678
  → Existe en BD
  → UPDATE con (Juan, Pérez Actualizado, Centro Nuevo)
  → Contador actualizado: 1

Fila 2: dni=87654321
  → Existe en BD
  → UPDATE con (María, López, Norte) [sin cambios]
  → Contador actualizado: 2

Fila 3: dni=11223344
  → NO existe en BD
  → INSERT nuevo
  → Contador insertados: 1

Fila 4: dni=12345678 (DUPLICADO)
  → Sobrescribe la fila 1 en diccionario
  → Pero solo procesa una vez en BD

Fila 5: dni=55667788
  → NO existe en BD
  → INSERT nuevo
  → Contador insertados: 2

RESULTADO FINAL:
---
{
  "insertados": 2,
  "actualizados": 2,
  "errores": 0,
  "detalles": []
}

BD después:
---
id | dni      | nombre                | apellido | zona
1  | 12345678 | Juan                  | Pérez Actualizado | Centro Nuevo ← ACTUALIZADO
2  | 87654321 | María                 | López    | Norte
3  | 11223344 | Carlos                | García   | Sur        ← NUEVO
4  | 55667788 | Ana                   | Martínez | Este       ← NUEVO
```

---

## 🎯 DIFERENCIA: Este enfoque vs Alternativas

### **Alternativa 1: TRUNCATE + INSERT (Borrar todo)**
```python
# ❌ NO hacer esto:
db.query(Trabajador).delete()  # BORRA TODO
# Luego INSERT nuevos

Problemas:
- Pierdes datos históricos
- Si algo falla, pierdes todo
- IDs cambian
- Incidencias referenciadas se rompen
```

### **Alternativa 2: INSERT IGNORE (Ignorar duplicados)**
```python
# ❌ NO ideal:
INSERT OR IGNORE INTO trabajadores VALUES (...)

Problema:
- No actualiza trabajadores existentes
- Si el CSV tiene cambios, no se aplican
```

### **Alternativa 3: MERGE/UPSERT (Nuestro enfoque)**
```python
# ✅ PERFECTO:
IF dni EXISTS
  UPDATE
ELSE
  INSERT

Ventajas:
- Actualiza cambios
- Inserta nuevos
- Preserva histórico
- Sin pérdida de datos
```

---

## 🔐 SEGURIDAD

```
1. ✅ Autenticación: Verifica que sea admin
2. ✅ Validación: Verifica estructura CSV
3. ✅ Sanitización: Strip(), no inyección SQL
4. ✅ Transacciones: Rollback si falla
5. ✅ Límite de tamaño: Máx 5MB
6. ✅ Encoding: Solo UTF-8
7. ✅ Logging: Quién, cuándo, qué cambió
```

---

## 📈 PERFORMANCE

```
Procesamiento de 10,000 trabajadores:
├─ Lectura CSV: ~100ms
├─ Validación: ~200ms
├─ Procesamiento BD (UPDATE/INSERT): ~500ms
└─ Total: ~800ms (< 1 segundo)

Escalabilidad:
├─ 100 trabajadores: Instantáneo
├─ 10,000 trabajadores: ~1 segundo
├─ 100,000 trabajadores: ~10 segundos
└─ Límite práctico: 1-5 segundos (user experience)
```

**Si necesitas >100k registros:**
- Considerar batch processing
- O usar jobs asincronos (Celery)
- O paginar la carga

---

## ✅ CHECKLIST FINAL

```
IMPLEMENTACIÓN:
☐ Backend endpoint
☐ Validaciones frontend y backend
☐ HTML form
☐ JavaScript lógica
☐ Manejo de errores
☐ Resumen visual

TESTING:
☐ CSV válido
☐ CSV con errores
☐ Duplicados en CSV
☐ No-admin intenta acceder
☐ Archivo corrupto
☐ Archivo >5MB
☐ Encoding incorrecto

DOCUMENTACIÓN:
☐ Instrucciones para usuario
☐ Formato CSV esperado
☐ Errores comunes
☐ FAQ

DEPLOYMENT:
☐ .gitignore archivos CSV
☐ Logs de auditoría
☐ Backups automáticos
☐ Monitoreo de capacidad
```

---

## 🚀 PRÓXIMOS PASOS

**Cuando estés listo para implementar:**

1. Implementar backend endpoint (30 min)
2. Implementar frontend form (30 min)
3. Testing integral (30 min)
4. Refinamiento (30 min)

**Total: ~2 horas**

¿Listo para que empiece la implementación? 🎬
