# Project memory

## Product intent & audience

- Plataforma de reserva/gerenciamento de quadras esportivas e organização de partidas.
- Usuários podem criar partidas; donos de quadra podem cadastrar e gerenciar quadras (preços, horários de funcionamento).
- Perfis: usuário comum e dono de quadra (perfil de dono).
- Público: jogadores que buscam partidas e donos que alugam quadras.

## Brand personality & voice

- Usuário comunica em português; respostas e terminologia de domínio em português (quadra, partida, dono, horários).
- Visual deve ser bonito, não genérico, nível produção (conforme `.bolt/prompt`).

## Visual design & UX direction

- Stack visual: Tailwind CSS + ícones lucide-react; React hooks; JSX.
- Importações via alias `@/` → `src/`.
- Evitar pacotes adicionais de UI/temas/ícones salvo necessidade estrita.
- Ações de dono (editar quadra, horários, preços) exibidas condicionalmente conforme permissão.
- Dados de demonstração sem dono → somente leitura (sem botões de edição).
- Formulário de quadra: preços + horário de funcionamento por dia da semana com seleção de período (início/fim).
- Formulário de partida: sem campos de preço; valor exibido automaticamente ao escolher a quadra.

## Decisions, constraints & rationale

- Preço definido na quadra, não na partida: dono define valor normal por pessoa e valor pelo app ao cadastrar/editar quadra.
- Criar partida não tem campos de preço; valores vêm da quadra escolhida (ou aviso se a quadra não cobra).
- Horários gerados automaticamente a partir do período de funcionamento informado por dia (slots de 1 em 1 hora). Ex.: 18:00–22:30 → 18:00, 19:00, 20:00, 21:00, 22:00.
- Ao editar o período de um dia, os horários daquele dia são recriados.
- Migração aplicada para mover preço para a quadra.
- Permissões: criar partida exige login; cadastrar quadra exige perfil de dono.
- Botões de edição/horários/preços visíveis apenas para o dono da quadra.
- Verificação de segurança do banco (RLS/políticas) executada sem achados.
- Projeto compila e passa no lint.
- Fluxo não testado no navegador (recomendado validar manualmente).

## Open questions & assumptions

- Não implementado: convites; busca de partidas abertas; observações; notificação ao dono.
- Assumido: sistema de autenticação já existe; perfil de dono é um campo/flag no perfil do usuário.
- Demo data sem dono intencionalmente somente leitura.
- Pendente validar fluxo completo: login como dono → cadastrar quadra com período 18:00–22:30 → ver horários gerados → criar partida e conferir valor herdado da quadra.