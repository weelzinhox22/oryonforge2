# Oryon Forge - Premium Fitness UI/UX Design System

Este documento serve como o guia definitivo de design e arquitetura visual para a plataforma Oryon Forge. **Qualquer IA ou agente de desenvolvimento deve ler e seguir ESTAS REGRAS ESTRITAMENTE ao criar ou modificar componentes, telas ou sistemas de desafios para a plataforma.**

## 🚫 O Que NÃO Fazer (O Fim do Design Genérico)
- **NÃO** crie layouts de SaaS genéricos (tabelas corporativas simples, listas com fundos brancos/cinzas, botões azuis padrão).
- **NÃO** use designs com baixa densidade de informação ("muito espaço em branco" ou telas vazias típicas de apps administrativos).
- **NÃO** use "Loading spinners" genéricos.
- **NÃO** use componentes de formulários HTML crus sem estilização imersiva.

## 👑 Identidade Visual Central: All-Black & Gold
A plataforma é voltada para atletas, "Gym Rats" e praticantes de academia competitivos. O design deve exalar luxo, alta performance, agressividade, intensidade e exclusividade.

- **Tema Base:** Dark Mode Nativo e Obrigatório (All-Black). O fundo deve ser predominantemente preto puro (`#000000`) ou tons de carvão muito escuros (`#111111`, `#1A1A1A`).
- **Cor de Destaque Primária (Brand Color):** Ouro/Dourado (`#CCCC00` ou gradientes dourados premium). Esta cor dita botões de ação principal, ícones de vitória, bordas de destaque em cards ativos e tipografia de impacto.
- **Cores de Suporte (Gamificação):** Em contextos de sucesso absoluto, recordes batidos ou status "Live", toques sutis de Neon Green (Verde Neon) podem ser usados para gamificação tática, mas o Dourado reina no layout.
- **Tipografia:** Fontes sans-serif modernas e arrojadas (como Inter, Roboto ou Outfit). Utilize itálico para sugerir movimento/velocidade (ex: textos de XP ou ritmos), e pesos *Black/Extrabold* para cabeçalhos (Hero Text).

## 📱 Filosofia de UX: Mobile-First "Feed-Style" & Alta Densidade
- **Navegação:** O layout deve ser inconfundível com um aplicativo nativo mobile premium de esportes (pense em Strava premium, Nike Training Club, apps de eSports).
- **Feed-Style:** Telas de desafios ou histórico de atividades não são "tabelas". São "Cards" ricos e independentes, roláveis horizontalmente (carrosséis de filtros/categorias) ou verticalmente em formato de feed de rede social.
- **Densidade de Informação:** Alta. Os cards devem condensar múltiplos pontos de dados de forma harmoniosa (Avatar do usuário, logo do esporte, posição no ranking, XP ganho, progresso em barra, tempo restante do desafio, calorias) sem parecer bagunçado.

## 🏆 Padrões de Componentes (Oryon Components)

### 1. Cards de Desafio (Challenge Cards)
- Fundo escuro texturizado com bordas sutis (`border-white/10` ou `border-gray-800`).
- Quando o usuário está liderando ou o desafio é "Épico", aplicar um *glow* sutil ou borda dourada intensa (`border-[#CCCC00]`).
- Integração de barras de progresso complexas (ex: "Faltam 3 treinos de perna").
- Tags/Badges em formato de "pílula" indicando a dificuldade ou status do desafio (ex: "Elite", "Em Andamento").

### 2. Hero Sections & Leaderboards
- O topo da tela (Hero) deve entregar impacto instantâneo. Exibir estatísticas vitais do usuário (XP total, Posição da Guilda/Grupo) em fontes gigantes e em destaque, possivelmente com gradientes metálicos ou dourados.
- **Leaderboards:** Placares de Líderes devem tratar o Top 3 como realeza, utilizando medalhas visuais ou cores específicas (Ouro, Prata, Bronze). O restante da lista deve manter o padrão escuro. O usuário atual deve ser "pinado" (fixado) em destaque com um painel inferior se não estiver no topo da tela.

### 3. Ações e Floating Action Buttons (FAB)
- O botão principal de "Registrar Atividade" ou "Aceitar Desafio" deve ser um FAB flutuante e imponente no mobile, ou um CTA largo na parte inferior da tela.
- **Micro-interações:** Todos os botões interativos devem parecer vivos. Adicione transições de *hover* suaves, efeitos de escala ao clicar (`active:scale-95`), e *Toasts* premium escuros com bordas douradas para mensagens de sucesso.

### 4. Skeleton States Imersivos
- Para carregamentos de dados ou transições de rota, utilize *High-End Skeleton States* escuros com animações de "shimmer" ou pulso sutis (`animate-pulse bg-gray-800`). Nunca rompa a imersão com telas brancas de carregamento.

---

## 🤖 Prompt Injector para a IA (Como pedir novos sistemas)
*Quando for solicitar um novo sistema ou tela para a IA, sempre inclua ou referencie este documento, além de enviar o trecho abaixo:*

> **"Aja como um Engenheiro Frontend Premium e Product Designer. Estamos construindo um novo [Nome do Sistema, ex: Sistema de Desafios de Academia] para o Oryon Forge. REJEITE qualquer design genérico de SaaS. Siga estritamente o `ORYON_DESIGN_GUIDELINES.md` criado: use Tailwind CSS para aplicar a identidade All-Black & Gold (#CCCC00), garanta uma experiência mobile-first 'feed-style' com extrema densidade de informações, crie 'Challenge Cards' luxuosos com barras de progresso, implemente um Hero Section impactante e inclua Skeleton States elegantes para loading."**
