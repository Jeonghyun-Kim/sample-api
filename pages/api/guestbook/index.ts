import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import withErrorHandler from '@utils/withErrorHandler';
import connectMongo from '@utils/connectMongo';

const handler: (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void> = async (req, res) => {
  if (req.method === 'GET') {
    const { db } = await connectMongo();

    const boards = await db
      .collection('guestBook')
      .find(
        {},
        {
          projection: {
            password: 0,
          },
        },
      )
      .sort({ created: -1 })
      .toArray();

    return res.json(boards);
  }

  if (req.method === 'POST') {
    const { title, content, name, password } = req.body;
    if (!title || !content || !name || !password)
      return res.status(400).send('missing required fields.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const { db } = await connectMongo();

    const { result, insertedId } = await db.collection('guestBook').insertOne({
      title: title || null,
      content: content || null,
      name: name || null,
      password: hashedPassword,
      created: new Date(),
      lastUpdated: new Date(),
    });

    if (!result.ok) return res.status(500).send('db connection failed.');

    return res.json({ guestBookId: insertedId });
  }

  res.statusCode = 404;
  throw new Error('Method not found.');
};

export default withErrorHandler(handler);
