# Fernanda Rabelo — Psicologia Online

Aplicação Next.js para apresentação profissional, contato e solicitação de consultas online.

## O que já está funcional

- Página profissional responsiva.
- Botões de WhatsApp, telefone e e-mail.
- Seleção de datas úteis e horários.
- Consulta de disponibilidade pelo backend.
- Registro de solicitação de agendamento pelo backend.
- Bloqueio de duplicidade para o mesmo horário.
- Fallback para WhatsApp quando o banco ainda não estiver configurado.
- Dados do Supabase mantidos somente no servidor.

## Configurar o banco de agendamentos

1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute `supabase/schema.sql`.
3. No Google AI Studio / ambiente de deploy, cadastre os secrets:

```env
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE
```

A `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser criada como variável `NEXT_PUBLIC_*`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Para verificar a versão de produção:

```bash
npm run build
npm run start
```

## Próximas integrações

O fluxo de pagamento e a sala de videochamada devem ser conectados a provedores reais antes de serem liberados ao paciente. O projeto não marca pagamento como aprovado e não informa que uma chamada é criptografada sem uma integração real configurada.
