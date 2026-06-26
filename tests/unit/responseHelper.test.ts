import { Response } from 'express';
import { sendSuccess, sendError } from '../../src/utils/responseHelper';

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('responseHelper', () => {
  it('sendSuccess sets status 200 and success: true', () => {
    const res = mockRes();
    sendSuccess(res, { id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
  });

  it('sendError sets status 400 and success: false', () => {
    const res = mockRes();
    sendError(res, 'Bad request');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Bad request' });
  });
});
