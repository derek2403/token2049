/**
 * Squid Router Status API Route
 * Check status of swap transactions
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const integratorId = process.env.SQUID_INTEGRATOR_ID;
  
  if (!integratorId) {
    return res.status(500).json({ 
      error: 'Squid Integrator ID not configured' 
    });
  }

  const { transactionId, requestId, fromChainId, toChainId } = req.body;

  try {
    const url = new URL('https://v2.api.squidrouter.com/v2/status');
    url.searchParams.append('transactionId', transactionId);
    url.searchParams.append('requestId', requestId);
    url.searchParams.append('fromChainId', fromChainId);
    url.searchParams.append('toChainId', toChainId);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-integrator-id': integratorId,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Squid Status API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to check swap status',
        details: errorData 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Error calling Squid Status API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

