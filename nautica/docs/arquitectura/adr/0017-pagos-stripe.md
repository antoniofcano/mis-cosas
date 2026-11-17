# ADR 0017: Pagos con Stripe

- **Estado:** propuesta (la confirma el dueño con su asesor antes de F9)
- **Fecha:** 17 de noviembre de 2026

## Contexto

`PRODUCTO.md` plantea pases por tiempo sin renovación automática (9,90–79,90 €) y un canon trimestral por alumno
activo para centros, con meses de pausa. Proponía un comerciante de registro (≈ 5 % + 0,50 $), que pesa mucho en los
importes bajos. Los clientes previsibles están casi todos en España.

## Decisión

- **Stripe.** Particulares: Checkout en pago único (tarjeta, Bizum, carteras). Centros: liquidación trimestral
  calculada por el servidor y cobrada con Stripe Invoicing (tarjeta o adeudo SEPA).
- El acceso se concede **solo** por *webhook* firmado e idempotente (`eventos_pago`).
- Los derechos se calculan en el servidor y se entregan firmados y con caducidad, para funcionar sin conexión.
- El proveedor queda tras una interfaz `ProveedorPago`.
- No se guarda ningún dato de tarjeta ni de facturación en la base propia.

## Alternativas

- **Comerciante de registro (Paddle, o la modalidad equivalente de Stripe):** gestiona IVA y factura; comisión unas
  tres veces mayor. Es la alternativa si el dueño prefiere no llevar la facturación.
- **Solo transferencia o Bizum a mano:** válido para un piloto con 2–3 centros, no para particulares.
- **Tiendas de aplicaciones:** 15–30 % y exigen app nativa.

## Consecuencias

- El dueño es el vendedor: IVA, facturas y sus obligaciones formales son suyas. **Decisión pendiente del dueño con su
  asesor**; si prefiere delegarlo, se cambia a comerciante de registro sin tocar el modelo de datos.
- Pagar exige cuenta (correo).
- No se cobra hasta cumplir las puertas de `PRODUCTO.md` §10 (derechos del contenido, privacidad).
