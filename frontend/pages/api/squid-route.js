/**
 * Squid Router API Route
 * Get swap routes using Squid Router API
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const integratorId = process.env.SQUID_INTEGRATOR_ID;
  
  console.log('Squid Integrator ID present:', !!integratorId);
  
  if (!integratorId || integratorId === 'your_squid_integrator_id_here') {
    return res.status(500).json({ 
      error: 'Squid Integrator ID not configured',
      details: 'Please set SQUID_INTEGRATOR_ID in your .env.local file. Get one from https://v2.api.squidrouter.com/' 
    });
  }

  const params = req.body;
  console.log('Squid route request params:', params);

  try {
    const response = await fetch('https://v2.api.squidrouter.com/v2/route', {
      method: 'POST',
      headers: {
        'x-integrator-id': integratorId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const responseText = await response.text();
    console.log('Squid API response status:', response.status);
    console.log('Squid API response:', responseText);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }
      
      console.error('Squid API error:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      
      return res.status(response.status).json({ 
        error: 'Failed to get swap route from Squid',
        details: errorData 
      });
    }

    const data = JSON.parse(responseText);
    const requestId = response.headers.get('x-request-id');

    return res.status(200).json({
      route: data.route,
      requestId: requestId,
    });
    
  } catch (error) {
    console.error('Error calling Squid API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

