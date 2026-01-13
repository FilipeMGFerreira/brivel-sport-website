# Configuração de Chaves Privadas (AppSettings)

Este projeto usa um arquivo `appsettings.ts` para armazenar chaves privadas e configurações sensíveis.

## ⚠️ Importante

O arquivo `src/app/appsettings.ts` está no `.gitignore` e **NÃO será commitado** no repositório. Isso protege suas chaves privadas.

## 📋 Como Configurar

1. **Copie o arquivo de exemplo:**
   ```bash
   cp src/app/appsettings.example.ts src/app/appsettings.ts
   ```

2. **Edite o arquivo `src/app/appsettings.ts`** e preencha com suas chaves reais:
   ```typescript
   export const appSettings = {
     instagram: {
       appId: 'SEU_APP_ID_AQUI',
       accessToken: 'SEU_ACCESS_TOKEN_AQUI',
       userId: 'SEU_USER_ID_AQUI'
     },
     formspree: {
       formId: 'SEU_FORM_ID_AQUI'
     }
   };
   ```

## 🔑 Onde Obter as Chaves

### Instagram API
- **App ID**: Obtenha em [Facebook Developers](https://developers.facebook.com/)
- **Access Token**: Gere um token de longa duração na [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- **User ID**: Use o endpoint `https://graph.instagram.com/me?fields=id,username&access_token=SEU_TOKEN`

### Formspree
- **Form ID**: Crie uma conta em [Formspree](https://formspree.io/) e crie um novo formulário
- O Form ID será algo como `xvgkqyzw`

## 📁 Estrutura de Arquivos

```
src/app/
├── appsettings.ts          # Arquivo real com suas chaves (GITIGNORED)
└── appsettings.example.ts   # Arquivo de exemplo (commitado no git)
```

## ✅ Verificação

Após configurar, execute:
```bash
npm run build
```

Se houver erros, verifique se todas as chaves foram preenchidas corretamente.

## 🔒 Segurança

- ✅ `appsettings.ts` está no `.gitignore`
- ✅ `appsettings.example.ts` contém apenas placeholders
- ✅ Nunca commite o arquivo `appsettings.ts` com chaves reais
- ✅ Compartilhe apenas o arquivo `appsettings.example.ts` com outros desenvolvedores
