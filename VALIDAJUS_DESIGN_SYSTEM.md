# ValidaJus UI/UX Design System (AI Legal Platform)

Este documento serve como o guia definitivo de design e arquitetura visual para a plataforma ValidaJus. **Qualquer IA ou agente de desenvolvimento deve ler e seguir ESTAS REGRAS ESTRITAMENTE ao criar ou modificar componentes, telas ou sistemas (incluindo o novo Sistema de Desafios de Academia/Gamificação) para manter o alinhamento visual.**

## 🚫 O Que NÃO Fazer
- **NÃO** crie layouts de SaaS genéricos (tabelas brancas, fundos cinzas, botões azuis padrão do Bootstrap).
- **NÃO** use "Loading spinners" crus. Sempre prefira *High-End Skeleton States*.
- **NÃO** use cores primárias abertas. A plataforma usa uma paleta sofisticada "Ocean" e "Shield".

## 👑 Identidade Visual Central: High-Tech Legal & Glassmorphism
A plataforma tem uma estética *clean*, tecnológica, segura e imersiva. 

- **Tema Base (Ocean Palette):** Dark Mode sofisticado em tons de azul profundo/carbono. O fundo primário utiliza `bg-ocean-950` ou `bg-ocean-900`.
- **Bordas e Divisórias:** Bordas sutis em `border-ocean-800` ou `border-ocean-700`.
- **Cores de Texto:** Textos principais em `text-white`, textos secundários e parágrafos em `text-ocean-300` ou `text-ocean-400`.
- **Cor de Destaque Primária (Shield Green):** Verde Esmeralda/Segurança (`shield-500` para botões/fundos, `shield-400` para textos/ícones). Transmite validação, sucesso e segurança.
- **Cores de Suporte (Bento Grid / Ações):** 
  - *Blue* (`blue-500/400`) para ações de informação/monitoramento.
  - *Amber* (`amber-500/400`) para alertas ou kanban.
  - *Gold* (`gold-500/400`) para validação/premium.
  - *Danger* (`danger-500/400`) para revogações ou erros.
- **Tipografia:** Fontes limpas. Uso extensivo de letras maiúsculas com espaçamento largo (`uppercase tracking-widest text-[10px]`) para *badges* e rótulos pequenos. `font-mono` para números e dados.

## 📱 Filosofia de UX e Estética
- **Glassmorphism & Blurs:** Uso de cartões de vidro (`bg-ocean-900/40 backdrop-blur-sm`).
- **Glow Effects Ambientais:** Uso de formas desfocadas no fundo para criar atmosfera. Exemplo: `absolute w-64 h-64 bg-shield-500/10 rounded-full blur-3xl pointer-events-none`.
- **Cantos Extremamente Arredondados:** `rounded-3xl` ou `rounded-[2rem]` para cartões principais (Bento Grid, Modais), `rounded-2xl` para botões/cards internos.
- **Sombras Brilhantes:** Sombras coloridas para destacar elementos importantes, ex: `shadow-[0_0_50px_rgba(16,185,129,0.15)]`.

## 🏆 Padrões de Componentes

### 1. Cards do Sistema (Bento Grid Cards)
- Fundo `bg-ocean-900/40`, borda `border-ocean-800`.
- No hover: `hover:border-shield-500/50 hover:shadow-2xl hover:shadow-shield-500/10 group`.
- Ícones grandes e translúcidos no canto superior direito (`opacity-5 group-hover:opacity-10 transition-opacity`).
- Um container de ícone com fundo semitransparente (ex: `bg-shield-500/10 text-shield-400`).

### 2. Modais e Painéis Centrais
- Backdrop: `bg-slate-950/80 backdrop-blur-sm`.
- Container do Modal: `bg-ocean-900 border-ocean-700 rounded-3xl shadow-[0_0_50px_rgba(x,x,x,0.15)]`.
- Cabeçalhos de painéis com `bg-ocean-950/40` e borda inferior `border-ocean-800`.

### 3. Ações e Botões
- Botões de ação primária com `bg-shield-500 text-ocean-950 font-black rounded-xl`. No hover: `hover:bg-shield-400`.
- Adicionar efeitos de micro-interação: `hover:scale-105 active:scale-95 transition-all`.
- *Badges* estilizadas: `bg-shield-500/10 border-shield-500/20 text-shield-400`.

### 4. Sistema de Desafios de Academia (Adaptação para ValidaJus)
Como vamos construir um sistema de desafios de academia dentro ou alinhado a essa estética:
- Os "Cards de Desafio" não serão listagens genéricas. Use o padrão *Bento Grid* ou cartões "Glass".
- Barras de progresso devem usar `bg-ocean-800` como trilha e `bg-shield-500` (verde) ou `bg-blue-500` como preenchimento.
- Em vez de design agressivo esportivo, use a abordagem *High-Tech Tracker* (estilo painel de monitoramento forense ou biometria), usando ícones do Lucide-react (Activity, HeartPulse, Trophy).

---

## 🤖 Prompt Injector para a IA (Como pedir o novo sistema)
*Envie este texto para a IA ao pedir o código:*

> **"Aja como um Engenheiro Frontend Sênior. Crie o novo 'Sistema de Desafios de Academia', mas ele DEVE seguir estritamente a identidade visual do ValidaJus conforme documentado no `VALIDAJUS_DESIGN_SYSTEM.md`. Utilize a paleta 'Ocean' (`bg-ocean-950/900`), acentos em 'Shield' (`shield-500/400`), bordas `border-ocean-800`, e estética Glassmorphism com glows sutis (`blur-3xl`). Os cards de desafio devem usar cantos bem arredondados (`rounded-3xl`, `rounded-2xl`) e micro-interações (hover:scale). Rejeite qualquer layout SaaS genérico e traga a vibe High-Tech limpa e sofisticada do ValidaJus para o contexto fitness."**
