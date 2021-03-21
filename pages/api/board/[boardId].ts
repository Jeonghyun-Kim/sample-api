import { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandler from '@utils/withErrorHandler';
import connectMongo from '@utils/connectMongo';
import { ObjectId } from 'mongodb';
import sha256 from 'sha256';

const handler: (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void> = async (req, res) => {
  if (req.method === 'PATCH') {
    const { boardId } = req.query;
    const { title, name, content, password } = req.body;

    if (!password) return res.status(403).send('Need password');

    const { db } = await connectMongo();

    const board = await db
      .collection('board')
      .findOne({ _id: new ObjectId(boardId as string) });

    if (!board) return res.status(404).end();

    if (board.password !== sha256(password))
      return res.status(401).send('Password wrong.');

    const { result } = await db.collection('board').updateOne(
      { _id: board._id },
      {
        $set: {
          title,
          name,
          content,
          lastUpdated: new Date(),
        },
      },
    );

    if (!result.ok) return res.status(500).send('db connection error.');

    return res.json({ status: 'ok' });
  }

  if (req.method === 'DELETE') {
    const { boardId } = req.query;

    const { password } = req.body;

    if (!password) return res.status(403).send('Need password');

    const { db } = await connectMongo();

    const board = await db
      .collection('board')
      .findOne({ _id: new ObjectId(boardId as string) });

    if (!board) return res.status(404).end();

    if (board.password !== sha256(password))
      return res.status(401).send('Password wrong.');

    const { result } = await db
      .collection('board')
      .deleteOne({ _id: board._id });

    if (!result.ok) return res.status(500).send('db connection error.');

    return res.json({ status: 'ok' });
  }

  return res.status(404).send('method not found.');
};

export default withErrorHandler(handler);
