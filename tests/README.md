# Pruebas de RankingUp

## Vitest

```powershell
npm run test
```

Estas pruebas validan el ranking, los empates, actualizaciones concurrentes simuladas e idempotencia de `paymentId`. No escriben en Supabase ni procesan pagos reales.

## k6

Instala k6 y ejecuta la carga sólo contra un entorno controlado:

```powershell
$env:BASE_URL="http://localhost:3000"
k6 run tests/load-test.k6.js
```

El script usa únicamente `/` y `/api/cards`. No incluye `/api/webhook` porque ese endpoint consulta Mercado Pago y no debe bombardearse con identificadores falsos.
