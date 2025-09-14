import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.body?.type === 'url_verification') return res.status(200).send(req.body.challenge);
  // handle app_mention/message.im → proxy to /api/search
  return res.status(200).json({ ok: true });
}
