import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers.authorization !== `Bearer ${process.env.REINDEX_TOKEN}`) return res.status(401).end();
  // trigger your ETL webhook/queue here
  // e.g., await fetch(process.env.ETL_WEBHOOK!, { method: 'POST' })
  return res.status(202).json({ ok: true });
}
