## 🚀 DESPLIEGUE EN VPS CON SQLite

**Contexto:** Tu VPS tiene MongoDB instalado, pero quieres usar SQLite. Es totalmente posible y mucho más simple.

---

## ✅ ¿POR QUÉ SQLITE EN VPS?

```
SQLite en VPS es perfectamente viable porque:

✅ No necesita servidor externo corriendo
✅ La BD es un archivo (central_atencion.db)
✅ Cero configuración
✅ Backup = copiar un archivo
✅ Usa mínimos recursos
✅ Excelente performance para <100k registros
✅ Ya está implementado en tu código
```

**Comparar con MongoDB:**

- MongoDB = Servidor + servicio corriendo = más recursos
- SQLite = Archivo en disco = más eficiente

---

## 📋 PASO A PASO: DESPLIEGUE EN VPS CON SQLITE

### FASE 1: PREPARAR TU VPS (SSH)

```bash
# 1. Conectar a tu VPS
ssh usuario@tu_vps_ip

# 2. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 3. Instalar Python3 y pip
sudo apt install python3 python3-pip python3-venv -y

# 4. Instalar git (para clonar tu proyecto)
sudo apt install git -y

# 5. Crear directorio del proyecto
mkdir -p /home/usuario/proyectos
cd /home/usuario/proyectos

# 6. Clonar tu repositorio
git clone https://github.com/AlonsoIG99/central-atenciones.git
cd central-atenciones
```

---

### FASE 2: CONFIGURAR ENTORNO PYTHON

```bash
# 1. Crear entorno virtual
python3 -m venv venv

# 2. Activar entorno
source venv/bin/activate  # En Linux/Mac
# O en Windows: venv\Scripts\activate

# 3. Instalar dependencias (FastAPI, SQLAlchemy, etc.)
pip install -r requirements.txt

# Si no tienes requirements.txt, instalar manualmente:
pip install fastapi uvicorn sqlalchemy python-jose passlib bcrypt python-dotenv
```

---

### FASE 3: INICIALIZAR BASE DE DATOS EN VPS

```bash
# 1. Desde el directorio backend/
cd backend

# 2. Ejecutar script de inicialización
python init_db.py

# Esto creará:
# ✅ central_atencion.db (archivo de BD)
# ✅ Tablas: usuarios, incidencias, trabajadores
# ✅ Usuario admin: admin@central.com / admin123
# ✅ 8 trabajadores para testing
```

---

### FASE 4: CONFIGURAR VARIABLES DE ENTORNO

```bash
# Crear archivo .env en backend/
cat > backend/.env << EOF
DATABASE_URL=sqlite:///./central_atencion.db
SECRET_KEY=tu-clave-secreta-muy-larga-y-aleatoria-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
```

**Importante:** Cambiar `SECRET_KEY` por una clave aleatoria segura:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

### FASE 5: EJECUTAR SERVIDOR EN VPS

#### OPCIÓN A: Ejecución Manual (Testing)

```bash
# En el directorio backend/
python -m uvicorn app:app --host 0.0.0.0 --port 8000

# Acceder a:
# http://tu_vps_ip:8000
# http://tu_vps_ip:8000/docs (Swagger)
```

#### OPCIÓN B: Usar PM2 (Recomendado - Permanente)

```bash
# 1. Instalar PM2 globalmente (Node.js requerido)
sudo apt install nodejs npm -y
sudo npm install -g pm2

# 2. Crear archivo de configuración pm2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'central-atencion',
    script: './venv/bin/python',
    args: '-m uvicorn app:app --host 0.0.0.0 --port 8000',
    cwd: '/home/usuario/proyectos/central-atenciones/backend',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    error_file: './logs/error.log',
    out_file: './logs/out.log'
  }]
};
EOF

# 3. Iniciar con PM2
pm2 start ecosystem.config.js

# 4. Configurar PM2 para iniciar en reboot
pm2 startup
pm2 save

# 5. Ver logs
pm2 logs central-atencion
```

#### OPCIÓN C: Usar systemd (Alternativa a PM2)

```bash
# 1. Crear archivo de servicio
sudo nano /etc/systemd/system/central-atencion.service
```

Contenido:

```ini
[Unit]
Description=Central de Atención - FastAPI
After=network.target

[Service]
Type=notify
User=usuario
WorkingDirectory=/home/usuario/proyectos/central-atenciones/backend
ExecStart=/home/usuario/proyectos/central-atenciones/venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 2. Habilitar y iniciar
sudo systemctl daemon-reload
sudo systemctl enable central-atencion
sudo systemctl start central-atencion

# 3. Ver estado
sudo systemctl status central-atencion

# 4. Ver logs
sudo journalctl -u central-atencion -f
```

---

### FASE 6: CONFIGURAR NGINX (Proxy Inverso)

```bash
# 1. Instalar Nginx
sudo apt install nginx -y

# 2. Crear configuración
sudo nano /etc/nginx/sites-available/central-atencion
```

Contenido:

```nginx
server {
    listen 80;
    server_name tu_dominio.com;  # O tu_vps_ip

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 3. Habilitar sitio
sudo ln -s /etc/nginx/sites-available/central-atencion /etc/nginx/sites-enabled/

# 4. Probar configuración
sudo nginx -t

# 5. Reiniciar Nginx
sudo systemctl restart nginx
```

---

### FASE 7: SSL CERTIFICATE (HTTPS - Opcional pero Recomendado)

```bash
# 1. Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. Obtener certificado gratuito (Let's Encrypt)
sudo certbot --nginx -d tu_dominio.com

# 3. Renovación automática
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📁 ESTRUCTURA DE CARPETAS EN VPS

```
/home/usuario/proyectos/
└── central-atenciones/
    ├── backend/
    │   ├── venv/                 (entorno virtual)
    │   ├── models/
    │   ├── routes/
    │   ├── schemas/
    │   ├── app.py
    │   ├── auth.py
    │   ├── database.py
    │   ├── config.py
    │   ├── init_db.py
    │   ├── central_atencion.db   ⭐ TU BASE DE DATOS
    │   └── .env                  ⭐ VARIABLES SECRETAS
    │
    ├── frontend/
    │   ├── index.html
    │   ├── js/
    │   └── style.css
    │
    └── logs/
        ├── error.log             (si usas PM2)
        └── out.log
```

---

## 🔒 CONSIDERACIONES DE SEGURIDAD EN VPS

### 1. Proteger Archivo .env

```bash
# Restringir permisos
chmod 600 backend/.env

# Verificar que .env no esté en git
echo ".env" >> .gitignore
```

### 2. Backup de la Base de Datos

```bash
# Crear script de backup automático
cat > backup_db.sh << EOF
#!/bin/bash
BACKUP_DIR="/home/usuario/backups"
mkdir -p \$BACKUP_DIR
cp /home/usuario/proyectos/central-atenciones/backend/central_atencion.db \
   \$BACKUP_DIR/central_atencion_\$(date +%Y%m%d_%H%M%S).db
EOF

chmod +x backup_db.sh

# Programar con cron (diario a las 2am)
crontab -e
# Agregar línea:
# 0 2 * * * /home/usuario/backup_db.sh
```

### 3. Firewall

```bash
# Permitir solo puertos necesarios
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
```

### 4. Cambiar Contraseña Admin

Una vez que levantes el servidor:

1. Login con admin@central.com / admin123
2. Cambiar contraseña inmediatamente
3. Crear usuario gestor adicional

---

## 🧪 VERIFICAR QUE FUNCIONA

```bash
# Desde tu máquina local

# 1. API disponible
curl http://tu_vps_ip:8000/docs

# 2. Crear incidencia
curl -X POST http://tu_vps_ip:8000/incidencias \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dni":"12345678","titulo":"Prueba","descripcion":"Funciona"}'

# 3. Ver en reportes
http://tu_vps_ip/frontend/index.html
```

---

## 📊 RESUMEN: SQLITE EN VPS

```
Instalación:      ✅ 10 minutos
Configuración:    ✅ 5 minutos
Base de datos:    ✅ 1 segundo (init_db.py)
Código necesario: ✅ CERO cambios (ya funciona)
Mantenimiento:    ✅ Mínimo (solo backups)
Costos:           ✅ Cero (SQLite es gratuito)
```

---

## ⚡ OPCIÓN RÁPIDA: SCRIPT TODO EN UNO

Si quieres, puedo crear un script bash que automatice todo este proceso en tu VPS:

```bash
# Executa una sola vez en VPS
bash setup_vps.sh
```

Este script haría:

- ✅ Actualizar sistema
- ✅ Instalar dependencias
- ✅ Clonar repo
- ✅ Crear entorno virtual
- ✅ Instalar paquetes
- ✅ Inicializar BD
- ✅ Configurar PM2
- ✅ Configurar Nginx
- ✅ Todo listo

---

## 🎯 RESPUESTA A TU PREGUNTA

**"Si mi VPS tiene MongoDB, qué debo hacer para que funcione?"**

**Respuesta:**
No necesitas hacer nada con MongoDB. SQLite funciona perfecto en VPS porque:

1. **Es un archivo** - central_atencion.db se almacena en disco
2. **No necesita servidor** - no requiere que MongoDB esté corriendo
3. **Tu código ya lo soporta** - cambios cero
4. **Mejor performance** - menos recursos consumidos
5. **Backup fácil** - copias el archivo y ya

**Lo único que haces:**

1. Clonar repositorio en VPS
2. `python init_db.py` (crea BD)
3. `python -m uvicorn app:app --host 0.0.0.0 --port 8000`
4. ¡Listo!

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Puedo usar MongoDB si quiero?**
R: Sí, pero no es necesario. SQLite es más simple y eficiente.

**P: ¿Qué pasa con los datos en actualizaciones?**
R: central_atencion.db persiste. Siempre está ahí.

**P: ¿Cuántos usuarios simultáneos soporta?**
R: SQLite maneja bien hasta 100-200 usuarios simultáneos. Para más, considerar PostgreSQL.

**P: ¿Cómo hago backup?**
R: `cp backend/central_atencion.db backup/central_atencion_YYYYMMDD.db`

**P: ¿Necesito cambiar frontend?**
R: No. El frontend no sabe si usas SQLite o MongoDB.

---

## ✅ CHECKLIST DESPLIEGUE

- [ ] SSH conectado a VPS
- [ ] Python3 instalado
- [ ] Repositorio clonado
- [ ] Entorno virtual creado
- [ ] Dependencias instaladas
- [ ] init_db.py ejecutado
- [ ] .env configurado
- [ ] Servidor corriendo
- [ ] Nginx configurado
- [ ] SSL instalado
- [ ] Backup script creado
- [ ] Firewall configurado
- [ ] Probado desde navegador

**¿Necesitas ayuda con alguno de estos pasos?** 🚀
