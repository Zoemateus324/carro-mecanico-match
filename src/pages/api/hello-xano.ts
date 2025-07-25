import type { NextApiRequest, NextApiResponse } from 'next';
import { xano } from '@/lib/xano';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await xano.get('/hello'); // endpoint padrão do Xano
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao conectar com Xano' });
  }
}
