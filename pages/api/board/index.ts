import { NextApiRequest, NextApiResponse } from 'next';
import sha256 from 'sha256';
import withErrorHandler from '@utils/withErrorHandler';
import connectMongo from '@utils/connectMongo';

const handler: (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void> = async (req, res) => {
  if (req.method === 'GET') {
    const { db } = await connectMongo();

    const boards = await db
      .collection('board')
      .find()
      .sort({ created: -1 })
      .toArray();

    return res.json(boards);
  }

  if (req.method === 'POST') {
    const { title, content, name, password } = req.body;
    if (!title || !content || !name || !password)
      return res.status(400).send('empty content.');

    const { db } = await connectMongo();

    const { result, insertedId } = await db.collection('board').insertOne({
      title: title || null,
      content: content || null,
      name: name || null,
      password: sha256(password),
      verified: true,
      created: new Date(),
      lastUpdated: new Date(),
    });

    if (!result.ok) return res.status(500).send('db connection failed.');

    return res.json({ boardId: insertedId });
  }

  return res.status(404).send('method not found.');
};

export default withErrorHandler(handler);
