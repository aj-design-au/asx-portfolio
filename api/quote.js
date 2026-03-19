export default async function handler(req, res) {
  const { ticker, range = '1y' } = req.query;
  if (!ticker) return res.status(400).json({ error: 'ticker required' });

  const symbol = ticker.toUpperCase().endsWith('.AX') ? ticker.toUpperCase() : ticker.toUpperCase() + '.AX';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}&includePrePost=false`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://finance.yahoo.com/',
      },
    });

    if (!r.ok) {
      // Try query2 as fallback
      const r2 = await fetch(url.replace('query1', 'query2'), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://finance.yahoo.com/',
        },
      });
      if (!r2.ok) return res.status(r2.status).json({ error: 'Failed to fetch from Yahoo Finance' });
      const data = await r2.json();
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.json(data);
    }

    const data = await r.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
