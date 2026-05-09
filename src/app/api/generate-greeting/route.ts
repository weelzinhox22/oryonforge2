import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, avatarUrl, streak, dailyPoints, dailyGoal, ranking } = body;

    console.log('[Groq API] Generating greeting for:', username, 'Avatar:', avatarUrl);

    const isWoman = avatarUrl?.toLowerCase().includes('mulher') || avatarUrl?.toLowerCase().includes('female');
    const genderRole = isWoman ? 'uma usuária mulher' : 'um usuário homem';
    const genderSlang = isWoman ? 'mãe, braba, ela' : 'pai, brabo, ele';

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
Gere uma saudação curta (máx 120 caracteres) para ${genderRole} no Brasil.
Contexto:
- Usuário: ${username} (está em ${userRank}º lugar)
- Streak: ${streak} dias
- Pontos hoje: ${dailyPoints}/${dailyGoal}
- Top 5 do Grupo: ${groupContext}

Regras:
1. Use gírias adequadas para o gênero (${genderSlang}). Ex: "A mãe tá on", "O pai tá brabo".
2. Seja engraçado e use termos como: shape, off, bota pra fuder, bora pra cima, EAIII VAI DEIXAR TE PASSAR É.
3. Comente sobre a posição dele no ranking ou sobre quem está na frente dele.
4. Se for o 1º lugar, mande não relaxar porque a concorrência tá vindo.
5. Sarcasmo sobre o sedentarismo é obrigatório.
6. JAMAIS use termos medievais ou o nome 'Oryon Forge'.`;

    console.log('[Groq API] Using Key:', GROQ_API_KEY ? `Present (${GROQ_API_KEY.substring(0, 8)}...)` : 'MISSING');

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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Groq API] External Error:', errorData);
      
      // Fallback for model access issues
      if (response.status === 404 || response.status === 400) {
        console.log('[Groq API] Retrying with fallback model...');
        const retryResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.9,
            max_tokens: 150,
          }),
        });
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          const msg = retryData.choices?.[0]?.message?.content || "";
          return NextResponse.json({ message: msg.replace(/"/g, '') });
        }
      }
      return NextResponse.json({ error: 'Groq API error', details: errorData }, { status: response.status });
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
