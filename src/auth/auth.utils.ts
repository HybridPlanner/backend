import { User } from '@prisma/client';

export const removePassword = (user: User): Partial<User> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...result } = user;
  return result;
};
