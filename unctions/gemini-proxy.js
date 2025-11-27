exports.handler = async (event) => {
  // Verifique se é um POST (para segurança)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método não permitido' };
  }

  // Pegue a chave API da variável de ambiente (configurada no Netlify)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: 'Chave API não configurada no servidor' };
  }

  // Parseie o body da requisição (o payload que o frontend envia)
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (error) {
    return { statusCode: 400, body: 'Payload inválido' };
  }

  // Construa a URL da API do Gemini
  const modelName = 'gemini-2.5-flash-preview-09-2025'; // Mantenha como no seu código
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    // Faça a chamada proxy para a API do Gemini (usando fetch nativo)
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { statusCode: response.status, body: errorBody };
    }

    const result = await response.json();
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Erro na chamada API:', error);
    return { statusCode: 500, body: 'Erro interno no servidor' };
  }
};
