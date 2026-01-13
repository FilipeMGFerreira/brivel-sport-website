# Configuração do Formspree para Envio de Emails

O formulário de contato está configurado para usar o **Formspree**, um serviço gratuito que permite enviar emails sem necessidade de backend.

## Passo a Passo

### 1. Criar Conta no Formspree

1. Acesse: https://formspree.io/
2. Clique em "Sign Up" (é gratuito)
3. Crie sua conta ou faça login com Google/GitHub

### 2. Criar um Novo Formulário

1. No painel do Formspree, clique em "New Form"
2. Dê um nome ao formulário: "Brivel Sport Contact"
3. Configure o email de destino: **brivelsport@hotmail.com**
4. Copie o **Form ID** que será gerado (algo como: `xvgkqyzw`)

### 3. Configurar no Código

1. Abra o arquivo: `src/app/components/pages/contact/contact.component.ts`
2. Encontre a linha:
   ```typescript
   this.http.post('https://formspree.io/f/YOUR_FORM_ID', formData).subscribe({
   ```
3. Substitua `YOUR_FORM_ID` pelo ID do seu formulário:
   ```typescript
   this.http.post('https://formspree.io/f/xvgkqyzw', formData).subscribe({
   ```

### 4. Testar

1. Execute `npm start`
2. Acesse a página de contato
3. Preencha e envie o formulário
4. Verifique se o email chegou em **brivelsport@hotmail.com**

## Limites do Plano Gratuito

- **50 envios por mês** (suficiente para a maioria dos sites)
- Sem necessidade de backend
- Fácil de configurar
- Suporte a reCAPTCHA (opcional)

## Alternativas

Se precisar de mais envios ou recursos adicionais, considere:
- **EmailJS** (https://www.emailjs.com/)
- **SendGrid** (https://sendgrid.com/)
- **Mailgun** (https://www.mailgun.com/)

## Nota de Segurança

⚠️ O Formspree gratuito não requer autenticação, então qualquer pessoa pode enviar emails através do seu formulário. Para produção, considere:
- Adicionar reCAPTCHA
- Implementar rate limiting
- Usar o plano pago do Formspree
