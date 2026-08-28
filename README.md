# rankinguponline

rankinguponline es una plataforma de subastas publicitarias en tiempo real construida con Next.js, Prisma y PostgreSQL (Supabase).

## Desarrollo

1. Instala dependencias: `npm install`.
2. Copia `.env.example` a `.env`.
3. Configura `DATABASE_URL` con la cadena pooled de Supabase. Usa `DIRECT_URL` para migraciones.
4. Genera el cliente: `npm run db:generate`.
5. Valida el esquema: `npm run db:validate`.
6. Inicia la aplicación: `npm run dev`.

La aplicación ya no usa SQLite. No se deben guardar credenciales reales en el repositorio.

`.env` y todos los archivos `.env.*` (excepto `.env.example`) están excluidos de Git. Las claves secretas de Supabase, Mercado Pago y Resend deben configurarse únicamente como variables privadas en Vercel o en el entorno local. Nunca uses una clave `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY` con el prefijo `NEXT_PUBLIC_`.

## Servicios externos

- `MP_ACCESS_TOKEN`: token privado de Mercado Pago.
- `MP_WEBHOOK_URL`: URL pública de `/api/webhook`; Mercado Pago consulta el pago directamente antes de actualizar la grilla.
- `NEXT_PUBLIC_SITE_URL`: URL pública usada en retornos, correos y widget.
- `RESEND_API_KEY`: API key de Resend. Si falta, los correos se muestran en consola durante desarrollo.

## Despliegue

En el proveedor de hosting:

```bash
npm ci
npm run db:generate
npm run db:migrate
npm run build
npm start
```

Configura el webhook de Mercado Pago después de publicar la URL. Verifica que el endpoint acepte `POST` y que `MP_ACCESS_TOKEN`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` y `RESEND_API_KEY` estén configuradas como secretos.

## Rutas principales

- `/`: grilla y posiciones activas.
- `/crear`: wizard de creación o re-puja.
- `/crear/exito`: confirmación, descarga del kit de Instagram y código iframe.
- `/widget?cardId=...`: widget embebible.
