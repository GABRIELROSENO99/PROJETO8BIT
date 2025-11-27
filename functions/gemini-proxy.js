exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    console.log('Requisição não é POST - retornando 405');
    return { statusCode: 405, body: 'Método não permitido' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('Erro: Chave API não encontrada na variável de ambiente GEMINI_API_KEY');
    return { statusCode: 500, body: 'Chave API não configurada no servidor. Verifique as variáveis de ambiente no Netlify.' };
  }
  console.log('Chave API encontrada: ' + apiKey.substring(0, 10) + '... (parcial para log)'); // Log parcial para depurar sem expor a chave

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (error) {
    console.log('Erro ao parsear payload: ' + error.message);
    return { statusCode: 400, body: 'Payload inválido' };
  }

  const modelName = 'gemini-2.5-flash-preview-09-2025';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    console.log('Chamando API do Google com URL: ' + apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('Erro na resposta da API do Google: ' + errorBody);
      return { statusCode: response.status, body: errorBody };
    }

    const result = await response.json();
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Erro geral na chamada API: ' + error.message);
    return { statusCode: 500, body: 'Erro interno no servidor: ' + error.message };
  }
};
