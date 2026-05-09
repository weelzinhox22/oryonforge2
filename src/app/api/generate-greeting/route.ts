import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, streak, dailyPoints, dailyGoal, ranking } = body;

    console.log('[Groq API] Generating greeting for:', username);

    const hour = new Date().getHours();
    let period = 'noite';
    if (hour >= 5 && hour < 12) period = 'manhã';
    else if (hour >= 12 && hour < 18) period = 'tarde';

    // Get group summary for context
    const groupContext = ranking?.slice(0, 5).map((r: any, i: number) =>
      `${i + 1}º: ${r.username} (${r.points} pts)`
    ).join(', ');

    const userRank = ranking?.findIndex((r: any) => r.username === username) + 1 || '?';

    const prompt = `Você é um assistente de motivação fitness sarcástico, engraçado e fofoqueiro.
Gere uma saudação curta (máx 120 caracteres) para o usuário brasileiro.
Contexto:
- Usuário: ${username} (está em ${userRank}º lugar)
- Streak: ${streak} dias
- Pontos hoje: ${dailyPoints}/${dailyGoal}
- Top 5 do Grupo: ${groupContext}

Regras:
1. Seja engraçado, use gírias brasileiras (pai, mãe (se o usuario for mulher), da pra saber pelo nome do icone dela), brabo, ou braba, off, shape, bota pra fuder, bora pra cima, EAIII VAI DEIXAR TE PASSAR É)
2. Comente algo sobre a posição dele no ranking ou sobre quem está na frente dele se ele não for o 1º.
3. Se ele for o 1º, peça para ele não relaxar.
4. Sarcasmo sobre o sedentarismo é obrigatório.
5. NÃO use termos medievais ou o nome 'Oryon Forge'.
6. Resposta curta, direta e impactante.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.9,
        max_tokens: 150,
      }, null, 2),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Groq API] External Error:', errorData);
      return NextResponse.json({ error: 'Groq API error' }, { status: response.status });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "";

    console.log('[Groq API] Success:', message);

    return NextResponse.json({ message: message.replace(/"/g, '') });
  } catch (error: any) {
    console.error('[Groq API] Critical Error:', error);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}
