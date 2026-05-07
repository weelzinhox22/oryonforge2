# 🏛️ Oryon Forge — Database Documentation (Supabase)

Esta documentação descreve a estrutura completa do banco de dados para o projeto Oryon Forge, incluindo tabelas, tipos, políticas de segurança (RLS), funções RPC e triggers.

## 1. Tipos Customizados (Enums)
*   `group_role`: `['admin', 'manager', 'member']` — Define o nível de permissão do usuário dentro de um grupo.
*   `activity_status`: `['pending', 'approved', 'rejected']` — Estado de uma atividade registrada para moderação.

## 2. Estrutura de Tabelas

### `public.profiles`
Armazena os dados de perfil dos usuários vinculados ao `auth.users` do Supabase.
*   `id`: UUID (PK, FK auth.users)
*   `username`: TEXT (Nome de exibição)
*   `full_name`: TEXT (Nome completo)
*   `avatar_url`: TEXT (Link da foto)
*   `created_at`: TIMESTAMPTZ

### `public.groups` (Desafios/Grupos)
Armazena as configurações dos desafios competitivos.
*   `id`: UUID (PK)
*   `name`: TEXT (Nome do grupo)
*   `description`: TEXT (Descrição)
*   `admin_id`: UUID (FK profiles - Criador do grupo)
*   `period_days`: INTEGER (Duração do desafio em dias)
*   `start_date`: TIMESTAMPTZ
*   `end_date`: TIMESTAMPTZ
*   `invite_code`: TEXT (Código único de 6 caracteres para convite)
*   `activity_config`: JSONB (Pontuação por tipo de atividade, ex: `{"gym": 10, "run": 5}`)
*   `rules_text`: TEXT (Regras do grupo)
*   `is_private`: BOOLEAN (Se o grupo é listado publicamente)

### `public.group_members`
Relacionamento Many-to-Many entre usuários e grupos.
*   `id`: UUID (PK)
*   `group_id`: UUID (FK groups)
*   `user_id`: UUID (FK profiles)
*   `role`: group_role (Papel no grupo)
*   `joined_at`: TIMESTAMPTZ

### `public.activity_logs`
Registro de todas as atividades físicas enviadas.
*   `id`: UUID (PK)
*   `user_id`: UUID (FK profiles)
*   `group_id`: UUID (FK groups)
*   `activity_type`: TEXT (Tipo: Corrida, Musculação, etc)
*   `duration_minutes`: INTEGER
*   `distance_km`: NUMERIC
*   `points`: INTEGER (Pontos calculados no envio)
*   `proof_url`: TEXT (URL da imagem de prova no Storage)
*   `status`: activity_status (Estado da moderação)

## 3. Funções RPC (Lógica de Servidor)

### `join_group_by_code(invite_code_param)`
Permite que um usuário entre em um grupo usando o código de convite. Garante que o usuário logado seja adicionado como `member`.

### `create_group(...)`
Função centralizada para criar um grupo. Ela:
1.  Gera um `invite_code` aleatório de 6 dígitos.
2.  Insere o registro na tabela `groups`.
3.  Insere automaticamente o criador na tabela `group_members` com a role `admin`.

## 4. Segurança (RLS - Row Level Security)
*   **Profiles**: Visualização pública; Edição apenas pelo dono do perfil.
*   **Groups**: Visíveis apenas para membros do grupo ou para o administrador.
*   **Activity Logs**: Visíveis apenas para membros do mesmo grupo (para ranking/feed). Inserção permitida apenas para o dono da atividade.
*   **Storage**: Bucket `proofs` configurado para visualização pública e upload restrito a usuários autenticados.

## 5. Triggers
*   `on_auth_user_created`: (Opcional/Configurado) Cria automaticamente um registro na tabela `public.profiles` quando um novo usuário se cadastra via Supabase Auth, extraindo metadados como `username`.

---
# Complementos recomendados para o banco

## groups
Adicionar:
- `max_points_per_day`: INTEGER DEFAULT 4
- `status`: TEXT CHECK ('draft', 'active', 'finished')
- `cover_url`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## group_members
Adicionar:
- `total_points`: INTEGER DEFAULT 0
- `current_streak`: INTEGER DEFAULT 0
- `last_activity_date`: DATE
- `status`: TEXT CHECK ('active', 'removed', 'left')

## activity_logs
Adicionar:
- `created_at`: TIMESTAMPTZ
- `activity_date`: DATE
- `approved_by`: UUID FK profiles
- `approved_at`: TIMESTAMPTZ
- `rejection_reason`: TEXT
- `proof_type`: TEXT CHECK ('image', 'video')
- `metadata`: JSONB

## Nova tabela: activity_rules
Melhor do que deixar tudo em JSONB no grupo.

Campos:
- `id`: UUID
- `group_id`: UUID
- `activity_type`: TEXT
- `unit`: TEXT CHECK ('minutes', 'km')
- `required_amount`: NUMERIC
- `points_per_unit`: INTEGER
- `is_active`: BOOLEAN

Exemplo:
- Musculação | minutes | 60 | 1
- Corrida | km | 3 | 1
- Caminhada | km | 5 | 1