import { RequestHandler } from 'express';

export const apiReference = (): RequestHandler => (_req, res) => {
  res.send('<html><body>Scalar docs (mocked)</body></html>');
};
