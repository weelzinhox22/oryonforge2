import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ---------------------------------------------------------------------------
// LEADER fallback messages (1st place)
// Placeholders: {name}, {streak}, {pts}, {second}
// ---------------------------------------------------------------------------
const MESSAGES_LEADER = [
  "{name}, você está em 1º lugar. Líderes não relaxam — eles ampliam a vantagem.",
  "Topo do ranking é seu, {name}. Continue treinando como se estivesse em 2º.",
  "Você lidera o grupo. {second} está atrás, mas a classificação muda rápido.",
  "1º lugar conquistado com treino. Mantém-se da mesma forma. Continue.",
  "Você está na frente agora. A consistência que te trouxe aqui vai te manter.",
  "O grupo inteiro está de olho em você, {name}. Bom motivo para não parar.",
  "Liderar o ranking é bom. Liderar com consistência é melhor ainda.",
  "Você está no topo porque apareceu quando outros não apareceram. Não mude isso.",
  "{name}, {streak} dias de consistência te trouxeram ao 1º lugar. Continue contando.",
  "Quem persiste, lidera. Você está provando isso todos os dias.",
  "O 1º lugar é uma escolha renovada a cada treino. Renove a sua hoje.",
  "Você conquistou a liderança treino a treino. Defenda-a da mesma forma.",
  "Estar em 1º é um resultado. Permanecer em 1º é um hábito.",
  "O grupo está treinando para te alcançar, {name}. Que isso seja motivação extra.",
  "{second} está monitorando sua pontuação. Continue adicionando distância.",
  "Liderança sem consistência é provisória. Você entende isso — por isso está no topo.",
  "Você abriu caminho no ranking. Agora é ampliar a margem.",
  "1º lugar hoje. Com {streak} dias de sequência, amanhã também.",
  "Ninguém chega ao topo por acidente, {name}. Continue com o que te trouxe aqui.",
  "O ranking fala por você. Mas é o próximo treino que vai confirmar.",
  "Você provou que consegue liderar. Agora prove que consegue manter.",
  "A vantagem no ranking só existe enquanto você continua treinando. Simples assim.",
  "Você está em 1º. Isso é resultado de escolhas consistentes. Faça mais uma hoje.",
  "Top 1 não é um ponto de chegada. É uma motivação para não desacelerar.",
  "Você lidera com {pts} pontos. Cada registro conta para manter a posição.",
];

// ---------------------------------------------------------------------------
// CHASING fallback messages (2nd place or below)
// The gap+userAbove data is ALWAYS injected deterministically.
// These templates have {gap} and {userAbove} guaranteed.
// ---------------------------------------------------------------------------
const MESSAGES_CHASING_PREFIX = [
  "Tá na hora de subir no ranking, {name}!",
  "Ei, {name}, bora ganhar pontos agora!",
  "Vamos registrar esses treinos e subir, {name}!",
  "Foco no topo, {name}!",
  "A consistência é o caminho, {name}.",
  "O pódio está te esperando, {name}.",
  "Não para agora, {name}!",
  "Bora buscar quem está na frente, {name}!",
  "Cada ponto te deixa mais perto, {name}.",
  "Ritmo de campeão, {name}!",
];

const MESSAGES_CHASING_SUFFIX = [
  "Continue treinando e essa distância some.",
  "Você fecha isso com consistência.",
  "Um bom treino já começa a mudar isso.",
  "É uma meta concreta. Persiga.",
  "Você sabe o que fazer.",
  "Treino a treino você chega lá.",
  "Continue aparecendo e o ranking vai refletir.",
  "Cada ponto conta para fechar essa diferença.",
  "Não subestime o poder do acúmulo.",
  "Você está no caminho certo.",
];

// ---------------------------------------------------------------------------
// GENERIC fallback (ranking unavailable)
// ---------------------------------------------------------------------------
const MESSAGES_GENERIC = [
  "Consistência bate talento quando o talento não aparece. Você está aparecendo.",
  "Cada treino registrado é uma prova de que você é maior do que a sua preguiça.",
  "O hábito que você está formando agora vai durar anos. Vale cada minuto.",
  "Não é sobre o treino perfeito. É sobre o treino feito. E você está fazendo.",
  "A disciplina que você constrói hoje é a liberdade que você vai ter amanhã.",
  "Todo mundo quer resultado. Poucos querem o processo. Você escolheu o processo.",
  "Uma série de cada vez. Um dia de cada vez. É assim que montanhas são escaladas.",
  "O melhor momento para treinar foi ontem. O segundo melhor é agora.",
  "Progresso imperfeito sempre vai superar a perfeição que nunca acontece.",
  "Você está construindo algo que ninguém pode tirar de você: disciplina.",
  "Movimento é medicamento. E você tomou a dose hoje.",
  "Não espere motivação. Aja e a motivação vem atrás.",
  "Sua preguiça ficou esperando você no sofá. Você foi treinar. Boa escolha.",
  "O grupo está melhor com você participando. Sério.",
  "Continue. Os resultados vêm para quem não para.",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pickFrom(bank: string[], seed: number): string {
  return bank[Math.abs(seed) % bank.length];
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`
  );
}

/**
 * Builds the chasing message deterministically.
 * Format: "[prefix] faltam {gap} pontos para alcançar {userAbove}. [suffix]"
 * The gap and userAbove are ALWAYS present — no LLM can omit them.
 */
function buildChasingFallback(
  seed: number,
  vars: Record<string, string | number>
): string {
  const prefix = interpolate(pickFrom(MESSAGES_CHASING_PREFIX, seed), vars);
  const suffix = pickFrom(MESSAGES_CHASING_SUFFIX, seed + 1);
  
  let core = `faltam ${vars.gap} pontos para alcançar ${vars.userAbove}.`;
  if (Number(vars.gap) <= 0) {
    core = `você empatou com ${vars.userAbove}! O próximo registro te coloca na frente.`;
  }
  
  return `${prefix} ${core} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, avatarUrl, streak, dailyPoints, dailyGoal, ranking } = body;

    console.log('[Greeting API] Generating for:', username);

    const isWoman =
      avatarUrl?.toLowerCase().includes('mulher') ||
      avatarUrl?.toLowerCase().includes('female');

    const hour = new Date().getHours();
    let period = 'noite';
    if (hour >= 5 && hour < 12) period = 'manhã';
    else if (hour >= 12 && hour < 18) period = 'tarde';

    // ------------------------------------------------------------------
    // Ranking context — computed deterministically
    // ------------------------------------------------------------------
    const rankingArr: { username: string; points: number }[] = ranking ?? [];
    const normalizedUsername = (username ?? '').trim().toLowerCase();

    // 1. Try exact match (case-insensitive + trimmed)
    let userIdx = rankingArr.findIndex(
      (r) => r.username.trim().toLowerCase() === normalizedUsername
    );

    // 2. Fallback: Try partial match if exact match fails
    if (userIdx === -1 && normalizedUsername) {
      userIdx = rankingArr.findIndex(
        (r) => {
          const rName = r.username.trim().toLowerCase();
          return rName.includes(normalizedUsername) || normalizedUsername.includes(rName);
        }
      );
    }

    const userRankNum: number = userIdx >= 0 ? userIdx + 1 : 0;
    const userRank: number | string = userRankNum > 0 ? userRankNum : '?';
    const userPoints: number = rankingArr[userIdx]?.points ?? dailyPoints ?? 0;

    const aboveEntry = userIdx > 0 ? rankingArr[userIdx - 1] : null;
    const userAbove: string = aboveEntry?.username ?? '';
    const pointsGap: number =
      aboveEntry != null ? Math.max(0, Math.ceil(aboveEntry.points - userPoints)) : 0;

    const leader: string = rankingArr[0]?.username ?? '';
    const second: string = rankingArr[1]?.username ?? '';

    console.log(
      `[Greeting API] Rank context → user=${username} normalized=${normalizedUsername} idx=${userIdx} rank=${userRankNum} pts=${userPoints} above=${userAbove} gap=${pointsGap}`
    );

    const seed = Date.now() + (username?.charCodeAt(0) ?? 0);

    const interpolateVars = {
      name: username ?? 'Atleta',
      rank: userRank,
      streak: streak ?? 0,
      pts: userPoints,
      goal: dailyGoal ?? 4,
      leader,
      second,
      userAbove: userAbove || 'o líder',
      gap: pointsGap,
    };

    // ------------------------------------------------------------------
    // Try Groq — but we APPEND the ranking data ourselves after,
    // so Groq only needs to generate a short motivational sentence.
    // ------------------------------------------------------------------
    if (GROQ_API_KEY) {
      const genderContext = isWoman ? 'usuária (feminino)' : 'usuário (masculino)';

      // For chasing users: Groq generates ONLY the motivational sentence.
      // We inject the gap/userAbove data ourselves after.
      const groqTask =
        userRankNum === 1
          ? `Gere UMA frase motivacional curta (máx 100 caracteres) para ${genderContext} chamado(a) ${username}, que está em 1º lugar no ranking do grupo. Mencione que ${second || 'o segundo colocado'} está logo atrás e encoraje a não relaxar. Tom: positivo, direto, como um coach.`
          : userRankNum >= 2 && aboveEntry
          ? `Gere UMA frase motivacional curta (máx 80 caracteres) para ${genderContext} chamado(a) ${username}, que está em ${userRankNum}º lugar. A frase deve encorajar a fechar a distância para ${userAbove}. Tom: positivo, direto. NÃO inclua números de pontos — isso será adicionado separadamente.`
          : `Gere UMA frase motivacional curta (máx 100 caracteres) para ${genderContext} chamado(a) ${username} que pratica fitness. Tom: positivo, direto, como um coach.`;

      const prompt = `${groqTask}

Regras absolutas:
- Retorne APENAS a frase, sem aspas, sem explicações.
- Termine a frase sempre com um ponto final (ou exclamação).
- NUNCA use palavrões, xingamentos ou CAIXA ALTA excessiva.
- NUNCA mencione "Oryon Forge" ou termos medievais.
- Use gírias naturais (ex: "tá on", "mandou bem") apenas se encaixarem organicamente no fluxo da frase. Evite frases que terminem abruptamente com a gíria sem conexão.`;

      try {
        const tryGroq = async (model: string) => {
          return fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: prompt }],
              model,
              temperature: 0.85,
              max_tokens: 80,
            }),
          });
        };

        let response = await tryGroq('llama-3.3-70b-versatile');

        if (!response.ok && (response.status === 404 || response.status === 400)) {
          console.log('[Greeting API] Retrying with fallback model...');
          response = await tryGroq('llama-3.1-8b-instant');
        }

        if (response.ok) {
          const data = await response.json();
          const raw = data.choices?.[0]?.message?.content ?? '';
          const groqSentence = raw.replace(/"/g, '').trim();

          if (groqSentence.length > 5) {
            let finalMessage: string;

            if (userRankNum === 1) {
              finalMessage = groqSentence;
            } else if (userRankNum >= 2 && aboveEntry) {
              const gapInfo = pointsGap <= 0 
                ? `Você empatou com ${userAbove}! O próximo registro te coloca na frente.`
                : `Faltam ${pointsGap} pontos para alcançar ${userAbove}.`;
              finalMessage = `${groqSentence} ${gapInfo}`;
            } else {
              finalMessage = groqSentence;
            }

            console.log('[Greeting API] Groq + ranking composite:', finalMessage);
            return NextResponse.json({ message: finalMessage });
          }
        } else {
          console.warn('[Greeting API] Groq error:', response.status);
        }
      } catch (groqErr) {
        console.warn('[Greeting API] Groq failed, using local bank:', groqErr);
      }
    }

    // ------------------------------------------------------------------
    // Fallback: fully deterministic ranked messages
    // ------------------------------------------------------------------
    let message: string;

    if (userRankNum === 1) {
      message = interpolate(pickFrom(MESSAGES_LEADER, seed), interpolateVars);
    } else if (userRankNum >= 2 && aboveEntry) {
      message = buildChasingFallback(seed, interpolateVars);
    } else {
      message = pickFrom(MESSAGES_GENERIC, seed);
    }

    console.log('[Greeting API] Local bank fallback:', message);
    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('[Greeting API] Critical Error:', error);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}
