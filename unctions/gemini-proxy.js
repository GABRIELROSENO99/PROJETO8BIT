exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Método não permitido' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('Erro: Chave API não encontrada na variável de ambiente.');
    return { statusCode: 500, body: 'Chave API não configurada no servidor' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (error) {
    return { statusCode: 400, body: 'Payload inválido' };
  }

  const modelName = 'gemini-2.5-flash-preview-09-2025';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    console.log('Chamando API do Google com URL:', apiUrl); // Log para depurar
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('Erro na resposta da API:', errorBody);
      return { statusCode: response.status, body: errorBody };
    }

    const result = await response.json();
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error) {
    console.error('Erro na chamada API:', error);
    return { statusCode: 500, body: 'Erro interno no servidor: ' + error.message };
  }
};
