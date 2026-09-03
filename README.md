# RankeandoUp

Plataforma de subastas publicitarias en tiempo real. Los anunciantes crean tarjetas, compiten por posiciones mediante pujas y reciben notificaciones cuando son superados.

## Stack

- Next.js 16 con App Router, React, TypeScript y Tailwind CSS.
- Prisma 7 con PostgreSQL en Supabase.
- Mercado Pago para checkout y confirmación segura mediante webhook.
- Resend para avisos transaccionales.
- Vitest para pruebas y k6 para carga HTTP controlada.

## Desarrollo

1. Instala dependencias: `npm install`.
2. Copia `.env.example` a `.env`.
3. Configura `DATABASE_URL` con la cadena pooled de Supabase (puerto 6543) y `DIRECT_URL` para migraciones (puerto 5432).
4. Genera el cliente: `npm run db:generate`.
5. Valida el esquema: `npm run db:validate`.
6. Inicia la aplicación: `npm run dev`.

La aplicación ya no usa SQLite. No se deben guardar credenciales reales en el repositorio.

`.env` y todos los archivos `.env.*` (excepto `.env.example`) están excluidos de Git. Las claves secretas de Supabase, Mercado Pago y Resend deben configurarse únicamente como variables privadas en Vercel o en el entorno local. Nunca uses una clave `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` con el prefijo `NEXT_PUBLIC_`.

## Variables de entorno

Nunca subas `.env` ni claves reales. Consulta `.env.example` para conocer los nombres esperados.

- `ADMIN_SECRET_KEY`: clave secreta del panel de administración. No debe quedar con valor por defecto ni vacío en producción.
- `MP_ACCESS_TOKEN`: token privado de Mercado Pago.
- `MP_WEBHOOK_SECRET`: secreto compartido de webhook de Mercado Pago cuando lo habilites para validación del callback.
- `MP_WEBHOOK_URL`: URL pública de `/api/webhook`; Mercado Pago consulta el pago directamente antes de actualizar la grilla.
- `NEXT_PUBLIC_SITE_URL`: URL pública usada en retornos, correos y widget. Debe ser HTTPS y apuntar al dominio de producción.
- `RESEND_API_KEY`: API key de Resend. Si falta, los correos se muestran en consola durante desarrollo.

Las variables `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_SECRET_KEY` son exclusivamente de servidor. Nunca deben llevar el prefijo `NEXT_PUBLIC_`.

## Despliegue

En el proveedor de hosting:

```bash
npm ci
npm run db:generate
npm run db:migrate
npm run build
npm start
```

Configura el webhook de Mercado Pago después de publicar la URL. Verifica que el endpoint acepte `POST` y que `MP_ACCESS_TOKEN`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` y `RESEND_API_KEY` estén configuradas como secretos. `DIRECT_URL` debe configurarse también si ejecutas migraciones desde Vercel; el build puede generar el cliente usando `DATABASE_URL`.

## Pruebas

```powershell
npm run test
npm run lint
npm run build
```

Para carga HTTP local, instala k6 y ejecuta:

```powershell
$env:BASE_URL="http://localhost:3000"
k6 run tests/load-test.k6.js
```

## Rutas principales

- `/`: grilla y posiciones activas.
- `/crear`: wizard de creación o re-puja.
- `/crear/exito`: confirmación, descarga del kit de Instagram y código iframe.
- `/widget?cardId=...`: widget embebible.
