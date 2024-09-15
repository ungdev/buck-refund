import { Prisma, PrismaClient } from '@prisma/client';
import { generateCustomModel, RequestType } from '../../prisma/prisma.service';

const USER_SELECT_FILTER = {
  select: {
    id: true,
    firstName: true,
    balance: true,
    iban: true,
  },
  orderBy: [{ firstName: 'asc' }],
} satisfies Partial<RequestType<'user'>>;

export type User = Prisma.UserGetPayload<typeof USER_SELECT_FILTER>;

export const generateCustomUserModel = (prisma: PrismaClient) =>
  generateCustomModel(prisma, 'user', USER_SELECT_FILTER, (_, u) => u);
