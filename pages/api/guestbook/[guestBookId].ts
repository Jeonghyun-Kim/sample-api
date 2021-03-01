import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import withErrorHandler from '@utils/withErrorHandler';
import connectMongo from '@utils/connectMongo';
import { ObjectId } from 'mongodb';

const handler: (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void> = async (req, res) => {
  if (req.method === 'PATCH') {
    const { guestBookId } = req.query;
    const { title, content, name, password } = req.body;

    if (!password) return res.status(400).send('missing password.');

    const { db } = await connectMongo();

    const guestBook = await db
      .collection('guestBook')
      .findOne({ _id: new ObjectId(guestBookId as string) });

    if (!guestBookId) return res.status(404).send('no such guestBook.');

    if (!(await bcrypt.compare(password, guestBook.password)))
      return res.status(401).send('password wrong.');

    const { result } = await db.collection('guestBook').updateOne(
      {
        _id: guestBook._id,
      },
      {
        title: title,
        content: content,
        name: name,
        lastUpdated: new Date(),
      },
    );

    if (!result.ok) return res.status(500).send('db connection failed.');

    return res.status(204).end();
  }

  return res.status(404).send('method not found.');
};

export default withErrorHandler(handler);
