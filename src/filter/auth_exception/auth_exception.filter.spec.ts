import { AuthExceptionFilter } from './auth_exception.filter';

describe('AuthExceptionFilter', () => {
  it('should be defined', () => {
    expect(new AuthExceptionFilter()).toBeDefined();
  });
});
