export const createTransport = jest.fn().mockReturnValue({
  sendMail: jest.fn().mockResolvedValue(true), // simula que el mail se envió bien
});