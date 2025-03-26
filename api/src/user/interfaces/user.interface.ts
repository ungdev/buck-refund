import { Prisma } from '@prisma/client';
import { generateCustomModel, PrismaOptimize, RequestType } from '../../prisma/prisma.service';

const USER_SELECT_FILTER = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    balance: true,
    iban: true,
    ibanFoolproof: true,
    locker: true,
    processed: true,
  },
  orderBy: [{ firstName: 'asc' }],
} satisfies Partial<RequestType<'user'>>;

export type User = Prisma.UserGetPayload<typeof USER_SELECT_FILTER>;

export const generateCustomUserModel = (prisma: PrismaOptimize) =>
  generateCustomModel(prisma, 'user', USER_SELECT_FILTER, (_, u: User) => u);
