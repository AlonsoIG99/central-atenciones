# Central de Atención

Proyecto de gestión de incidencias con FastAPI, PostgreSQL y Vanilla JavaScript.

## Estructura del Proyecto

```
proyecto-central-atencion/
├── backend/          # API FastAPI
├── frontend/         # Interfaz Vanilla JS
├── .env             # Variables de entorno
└── README.md        # Este archivo
```

## Requisitos

- Python 3.9+
- PostgreSQL

## Instalación

### Backend

1. Navega a la carpeta backend:
```bash
cd backend
```

2. Crea un entorno virtual:
```bash
python -m venv venv
```

3. Activa el entorno virtual:
```bash
# Windows (bash)
source venv/Scripts/activate
```

4. Instala las dependencias:
```bash
pip install -r requirements.txt
```

5. Configura el archivo `.env` con tu conexión a PostgreSQL:
```
DATABASE_URL=postgresql://usuario:contraseña@localhost/central_atencion
```

6. Ejecuta la aplicación:
```bash
python app.py
```

La API estará disponible en: `http://localhost:8000`

### Frontend

Abre `frontend/index.html` en tu navegador.

## API Endpoints

### Usuarios
- `GET /usuarios` - Obtener todos los usuarios
- `GET /usuarios/{id}` - Obtener un usuario
- `POST /usuarios` - Crear un usuario
- `PUT /usuarios/{id}` - Actualizar un usuario
- `DELETE /usuarios/{id}` - Eliminar un usuario

### Incidencias
- `GET /incidencias` - Obtener todas las incidencias
- `GET /incidencias/{id}` - Obtener una incidencia
- `POST /incidencias` - Crear una incidencia
- `PUT /incidencias/{id}` - Actualizar una incidencia
- `DELETE /incidencias/{id}` - Eliminar una incidencia

## Documentación Interactiva

Visita `http://localhost:8000/docs` para ver la documentación interactiva de Swagger.
