# Supabase Edge Functions – Contact flow (Email + WhatsApp)

These functions power the marketplace "Contact Seller" flow: create leads, send email from your verified domain, and handle inbound replies for history and forwarding.

## Functions

| Function | Purpose |
|----------|---------|
| `create-lead-email` | Creates a lead + first message (buyer), rate-limits by IP, optional CAPTCHA. Sends email to seller with **From**: `noreply@<EMAIL_DOMAIN>`, **Reply-To**: `lead-<id>@<EMAIL_DOMAIN>` so replies are captured. |
| `create-lead-whatsapp` | Creates a lead when buyer clicks WhatsApp; rate-limits by IP. No message proxy. |
| `email-reply-webhook` | Inbound webhook from Resend when someone replies to `lead-<id>@<domain>`. Stores message in DB, determines sender (buyer/seller), forwards to the other party. |

## Prerequisites

1. **Database**: Run `src/app/features/marketplace/docs/supabase-schema-leads-messages.sql` and `supabase-migration-seller-phone.sql` so tables `leads`, `messages`, and `rate_limit` exist, and `listings.seller_phone` exists.
2. **Secrets**: Set the following in Supabase Dashboard → Project Settings → Edge Functions → Secrets (or via CLI `supabase secrets set`).

## Secrets (Environment variables)

| Secret | Required | Description |
|--------|----------|-------------|
| `SUPABASE_URL` | Yes | Set automatically by Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Set automatically. Used to bypass RLS for leads/messages/rate_limit. |
| `TURNSTILE_SECRET_KEY` | For email | Cloudflare Turnstile secret key (verify CAPTCHA). If omitted, CAPTCHA is skipped. |
| `EMAIL_DOMAIN` | For email | Your domain verified in Resend (e.g. `yourmarketplace.com`). Used as **From** (`noreply@<domain>`) and for reply addresses (`lead-<id>@<domain>`). |
| `RESEND_API_KEY` | For email | Resend.com API key to send and receive email. |
| `SITE_URL` | Optional | Public URL of your site (e.g. `https://yoursite.com`). Used for the "Ver anúncio" link in the email. |

**Note:** `EMAIL_RELAY_DOMAIN` is still supported in `email-reply-webhook` as a fallback if `EMAIL_DOMAIN` is not set.

## Rate limiting

- **create-lead-email**: 1 request per 60 seconds per IP (hashed).
- **create-lead-whatsapp**: 1 request per 20 seconds per IP (hashed).

Stored in table `rate_limit` (columns `ip_hash`, `endpoint`, `last_at`). Upsert uses composite primary key.

## Email workflow (simplified)

1. **Outbound (create-lead-email)**  
   - **From**: `Marketplace <noreply@<EMAIL_DOMAIN>>` (verified domain = better deliverability).  
   - **To**: listing’s `seller_email`.  
   - **Reply-To**: `lead-<lead_id>@<EMAIL_DOMAIN>` so when the seller (or buyer) replies, the email goes to your domain and triggers the webhook.  
   - First message is stored in `messages` (sender: `buyer`).

2. **Inbound (email-reply-webhook)**  
   - Resend sends a webhook when an email is received at `lead-<id>@<EMAIL_DOMAIN>`.  
   - The function fetches the full content via Resend Receiving API, determines sender (buyer or seller) from the **From** address, stores the message in `messages`, and forwards the email to the other party (seller → buyer or buyer → seller).  
   - All replies keep **Reply-To**: `lead-<id>@<EMAIL_DOMAIN>` so the thread stays in the system and history is complete.

3. **Result**  
   - Buyer and seller can reply normally; each reply is stored and forwarded.  
   - Full thread history is in the `messages` table.  
   - You use a single verified domain for both sending and receiving.

## Resend Inbound setup

1. In **Resend Dashboard**:  
   - **Domains** → Select your domain (`EMAIL_DOMAIN`).  
   - Enable **Inbound Email**.  
   - **Webhooks** → Add webhook:  
     - **URL**: `https://<your-project-ref>.supabase.co/functions/v1/email-reply-webhook`  
     - **Events**: **email.received**  
     - **Method**: POST  

2. Verify: send a test email to `lead-<any-uuid>@<your-domain>` and check Supabase Edge Function logs for `email-reply-webhook`.

3. Common issues:  
   - No logs → Webhook URL or events wrong.  
   - "Invalid recipient" → `EMAIL_DOMAIN` (or `EMAIL_RELAY_DOMAIN`) must match the Resend domain.  
   - "Failed to fetch email content" → Check `RESEND_API_KEY` and Resend Receiving API access.  
   - "Lead not found" → The UUID in the address must exist in the `leads` table.

## CAPTCHA (Cloudflare Turnstile)

- Frontend: Add Turnstile widget to the email form; send the token as `captchaToken` in the request body.  
- Backend: In `create-lead-email`, POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `secret` and `response` (token). If `TURNSTILE_SECRET_KEY` is not set, verification is skipped.

## CORS and calling from the browser

- Functions return CORS headers and respond to `OPTIONS` with status 200.  
- If you get CORS errors from `localhost:4200`:  
  1. Redeploy the functions after CORS/handler changes.  
  2. Ensure the function allows unauthenticated access if needed (e.g. `verify_jwt = false` in `config.toml`).  
  3. Confirm the frontend uses the correct Supabase project and keys.

## Deploy

From the project root:

```bash
supabase functions deploy create-lead-email
supabase functions deploy create-lead-whatsapp
supabase functions deploy email-reply-webhook
```

Or deploy all:

```bash
supabase functions deploy
```

---

## Modo manual (instruções passo a passo)

### 1. Configurar secrets manualmente

No **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**, adicionar:

| Nome | Valor (exemplo) |
|------|-----------------|
| `EMAIL_DOMAIN` | Domínio verificado no Resend (ex: `brivel-sport.pt`) |
| `RESEND_API_KEY` | Chave da API do Resend |
| `SITE_URL` | URL pública do site (ex: `https://brivel-sport.pt`) |
| `TURNSTILE_SECRET_KEY` | (opcional) Chave secreta Turnstile |

Ou via CLI (na raiz do projeto):

```bash
npx supabase secrets set EMAIL_DOMAIN="teu-dominio.com"
npx supabase secrets set RESEND_API_KEY="re_xxxx"
npx supabase secrets set SITE_URL="https://teu-site.com"
```

### 2. Deploy manual das funções

Na raiz do projeto:

```bash
npx supabase functions deploy create-lead-email
npx supabase functions deploy create-lead-whatsapp
npx supabase functions deploy email-reply-webhook
```

### 3. Resend Inbound (configuração manual)

1. Entrar em [Resend](https://resend.com) → **Domains** → selecionar o domínio (`EMAIL_DOMAIN`).
2. Ativar **Inbound Email**.
3. Ir a **Webhooks** → **Add webhook**.
4. **URL:** `https://<TEU-PROJECT-REF>.supabase.co/functions/v1/email-reply-webhook`  
   (substituir `<TEU-PROJECT-REF>` pelo ID do projeto Supabase).
5. **Events:** selecionar **email.received**.
6. Guardar.

### 4. Verificar

- Enviar uma mensagem de contacto por email a partir do site.
- Confirmar que o vendedor recebe o email com link para o anúncio.
- Responder ao email e confirmar que a resposta chega ao comprador e que os logs da função `email-reply-webhook` aparecem no Supabase.
