import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandler from '@utils/withErrorHandler';
import connectMongo from '@utils/connectMongo';
import { ObjectId } from 'mongodb';

const handler: (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void> = async (req, res) => {
  if (req.method === 'PUT') {
    const { boardId } = req.query;
    const { title, name, content } = req.body;

    const { db } = await connectMongo();

    const { result } = await db.collection('board').updateOne(
      { _id: new ObjectId(boardId as string) },
      {
        $set: {
          title,
          name,
          content,
          lastUpdated: new Date(),
        },
      },
    );

    if (!result.ok)
      return res.status(500).json({ status: 'db connection error.' });

    return res.json({ status: 'ok' });
  }

  res.statusCode = 404;
  throw new Error('Method not found.');
};

export default withErrorHandler(handler);
