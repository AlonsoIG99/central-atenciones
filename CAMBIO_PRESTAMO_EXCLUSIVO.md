# ✅ CAMBIO: Préstamo Exclusivo (Aprobado O No Aprobado)

## 🎯 Descripción del Cambio

Anteriormente, en el formulario de incidencias, era posible seleccionar **ambas opciones** simultáneamente:
```
☑️ Aprobado: 5000
☑️ No aprobado: Razón X
```

**Ahora es exclusivo:** Solo puedes seleccionar UNA opción:
```
☑️ Aprobado: 5000
☐ No aprobado: (deshabilitado automáticamente)

O

☐ Aprobado: (deshabilitado automáticamente)
☑️ No aprobado: Razón X
```

---

## 🔧 Cambios Técnicos

### Archivo Modificado: `frontend/js/incidencias.js`

#### Función: `renderIncidenciaSchema(schema, container, parentLabel = '')`

**Antes:**
```javascript
function renderIncidenciaSchema(schema, container) {
  // No pasaba parámetro de parent
}
```

**Después:**
```javascript
function renderIncidenciaSchema(schema, container, parentLabel = '') {
  // Ahora acepta el label del padre para identificar si estamos en "Apoyo económico/Préstamo"
  if (value && value.children) {
    renderIncidenciaSchema(value.children, nested, key); // Pasa el key actual como parentLabel
  }
}
```

#### Lógica en el Event Listener:

```javascript
checkbox.addEventListener('change', () => {
  if (checkbox.checked) {
    nested.classList.remove('hidden');
    
    // ✨ NUEVO: Validación exclusiva
    if (parentLabel === 'Apoyo económico/Préstamo') {
      // Si estamos en "Apoyo económico/Préstamo", deselecciona hermanos
      const allCheckboxes = container.querySelectorAll(':scope > div > input[type="checkbox"]');
      allCheckboxes.forEach(sibling => {
        if (sibling !== checkbox && sibling.checked) {
          sibling.checked = false;
          // Limpia también los inputs de texto
          const siblingNested = sibling.closest('div').querySelector('.nested');
          if (siblingNested) {
            siblingNested.classList.add('hidden');
            siblingNested.querySelectorAll('input[type="text"]').forEach(input => {
              input.value = '';
            });
          }
        }
      });
    }
  }
});
```

---

## 🚀 Cómo Funciona

1. **Usuario selecciona "Aprobado":**
   - Se muestra el campo de texto "Monto aprobado"
   - Si "No aprobado" estaba seleccionado, se deselecciona automáticamente
   - El campo "Motivo de no aprobación" se oculta

2. **Usuario selecciona "No aprobado":**
   - Se muestra el campo de texto "Motivo de no aprobación"
   - Si "Aprobado" estaba seleccionado, se deselecciona automáticamente
   - El campo "Monto aprobado" se oculta

3. **Usuario deselecciona ambos:**
   - Los campos se limpian (vacíos)
   - Los nested se ocultan

---

## 📊 Flujo de Datos

```
Usuario marca "Aprobado"
    ↓
Sistema identifica parentLabel = "Apoyo económico/Préstamo"
    ↓
Sistema busca hermanos (otros checkboxes al mismo nivel)
    ↓
Sistema deselecciona "No aprobado" si estaba marcado
    ↓
Sistema oculta y limpia el campo "Motivo de no aprobación"
    ↓
✅ Solo "Aprobado" está marcado
```

---

## 🧪 Prueba en Navegador

1. Abre `frontend/index.html`
2. Login con `admin@central.com / admin123`
3. Ve a la pestaña "Incidencias"
4. Desplázate hasta "Apoyo económico/Préstamo"
5. **Prueba 1:** Marca "Aprobado" → Ingresa monto → Marca "No aprobado"
   - ✅ Esperado: "Aprobado" se deselecciona automáticamente
6. **Prueba 2:** Marca "No aprobado" → Ingresa motivo → Marca "Aprobado"
   - ✅ Esperado: "No aprobado" se deselecciona automáticamente
7. **Prueba 3:** Marca "Aprobado" → Desmarca "Aprobado"
   - ✅ Esperado: El campo "Monto aprobado" se limpia

---

## 📝 Notas

- **No requiere cambios en backend:** El backend sigue igual
- **No requiere cambios en BD:** La estructura de datos no cambió
- **Cambio solo en frontend:** Logic pura de JavaScript
- **Validación en tiempo real:** Se aplica mientras el usuario interactúa

---

## 🎯 Otras Secciones Afectadas

**Solo "Apoyo económico/Préstamo"** tiene este comportamiento exclusivo.

Otras secciones con checkboxes (como "Pago incorrecto" → "Bonos") siguen permitiendo múltiples selecciones.

---

## ❓ Preguntas Frecuentes

**P: ¿Afecta esto a las incidencias ya registradas?**
R: No. Las incidencias existentes no cambian. Solo el formulario nuevo tiene esta validación.

**P: ¿Puedo cambiar de "Aprobado" a "No aprobado" después de guardar?**
R: Sí. Al editar, la misma lógica exclusiva se aplica.

**P: ¿Qué pasa si intento enviar "ambas" mediante API directa?**
R: El backend aceptaría ambas (no hay validación en backend). Si quieres validación en backend, debemos agregar una verificación en `routes/incidencias.py`.

**P: ¿Puedo hacer lo mismo con otras secciones?**
R: Sí. Cualquier sección puede tener comportamiento exclusivo si pasamos su nombre como `parentLabel`.

---

## ✨ Mejoras Futuras

Si necesitas:
- ✅ Validación en backend (asegurar que solo 1 esté guardado)
- ✅ Otros campos exclusivos
- ✅ Radio buttons en lugar de checkboxes

Avísame y lo implemento. 🚀
