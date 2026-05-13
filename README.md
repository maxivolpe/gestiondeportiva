# Gym Sport — SaaS de Gestión Deportiva

Sistema web para la gestión integral de gimnasios y academias deportivas. Maneja alumnos, clases, asistencias, pagos y caja desde un solo lugar, con acceso diferenciado por rol.

## Roles

| Rol | Acceso |
|-----|--------|
| **Dueño** | Dashboard general, alumnos, clases, disciplinas, pagos, caja (solo lectura) |
| **Secretario/a** | Alumnos, recuperos, pagos, caja, registro de asistencia |
| **Profesor** | Sus clases, toma de asistencia |
| **Alumno** | Su horario semanal, historial de pagos |

## Funcionalidades

- **Alumnos** — alta, baja, perfil, plan de pago, estado de cuenta
- **Clases** — horario semanal por disciplina y espacio, capacidad
- **Disciplinas** — categorías (yoga, crossfit, natación, etc.)
- **Asistencias** — registro por clase y fecha, historial
- **Recuperos** — solicitud y gestión de clases recuperatorias
- **Pagos** — registro de cobros, vencimientos, deuda
- **Caja diaria** — resumen de ingresos del día
- **Dashboard** — métricas generales (alumnos activos, recaudación, ocupación)

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 (CDN), Tailwind CSS, Babel standalone |
| Backend | Node.js, Express 4 |
| Base de datos | PostgreSQL + Sequelize ORM |
| Auth | JWT (access + refresh tokens) |
| Deploy | Render.com (free tier) |

## Estructura

```
backend/
├── app.js                  # Entry point Express
├── public/                 # Frontend estático (servido por Express)
│   ├── index.html
│   └── gym-sport/src/      # Componentes React (JSX via CDN Babel)
├── src/
│   ├── config/             # DB, JWT, env
│   ├── controllers/        # Lógica de cada endpoint
│   ├── middleware/         # Auth, RBAC, validación, errores
│   ├── models/             # Sequelize models
│   ├── routes/             # Express routers
│   ├── services/           # Lógica de negocio
│   └── utils/
├── migrations/             # Sequelize migrations
├── seeders/                # Datos demo
└── render.yaml             # Config deploy Render
```

## Instalación local

```bash
# Requisitos: Node 18+, PostgreSQL

cp .env.example .env
# Editar .env con tu DATABASE_URL y JWT_SECRET

npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
node app.js
# → http://localhost:3000
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Secreto para access tokens |
| `JWT_REFRESH_SECRET` | Secreto para refresh tokens |
| `NODE_ENV` | `development` / `production` |
| `PORT` | Puerto del servidor (default 3000) |
| `ALLOWED_ORIGINS` | Orígenes CORS permitidos en producción |

## Deploy en Render (gratis)

1. Fork/push este repo a GitHub
2. Crear cuenta en [render.com](https://render.com)
3. New → Web Service → conectar repo
4. Render detecta `render.yaml` automáticamente
5. Crea el servicio web + PostgreSQL free tier
6. Primer deploy: `npm install` → migrate → seed → start (~3-5 min)

> **Nota:** La base de datos gratis de Render se elimina a los 90 días. Para uso continuo, migrar a un plan pago o exportar los datos.

## Usuarios demo (cargados por seeders)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| dueno@gym.com | demo1234 | Dueño |
| secretaria@gym.com | demo1234 | Secretario |
| profesor@gym.com | demo1234 | Profesor |
| alumno@gym.com | demo1234 | Alumno |

## API

Base URL: `/api/v1`

Autenticación: `Authorization: Bearer <token>`

Endpoints principales:
- `POST /auth/login` — login
- `POST /auth/refresh` — renovar token
- `GET /users` — listado de usuarios (dueño/secretario)
- `GET /classes` — clases con horarios
- `GET /disciplines` — disciplinas
- `GET /payments` — pagos
- `GET /attendances` — asistencias
- `GET /dashboard/summary` — métricas generales
