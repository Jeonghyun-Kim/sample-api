import { NextApiResponse } from 'next';
import Cors from 'cors';
import runMiddleware from './runMiddleware';

const withErrorHandler: (
  handler: (req: never, res: NextApiResponse) => void | Promise<void>,
) => (req: never, res: NextApiResponse) => Promise<void> = (handler) => {
  const newHandler = async (req: never, res: NextApiResponse) => {
    try {
      await runMiddleware(req, res, Cors());
      await handler(req, res);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(err);
      }
      return res.status(res.statusCode || 500).send(err.message);
    }
  };

  return newHandler;
};

export default withErrorHandler;
