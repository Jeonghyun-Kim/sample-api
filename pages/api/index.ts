import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandler from '@utils/withErrorHandler';

const handler: (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void> = async (req, res) => {
  if (req.method === 'GET') {
    // Making 1sec delay for better practice.
    await new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });

    return res.json({ status: 'ok' });
  }

  return res.status(404).send('method not found.');
};

export default withErrorHandler(handler);
