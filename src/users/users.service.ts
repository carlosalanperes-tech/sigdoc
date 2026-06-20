import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function convertBigIntToString(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

 async findAll() {
  const users = await this.prisma.users.findMany({
    select: {
      id: true,
      institution_id: true,
      profile_id: true,
      name: true,
      email: true,
      position: true,
      phone: true,
      is_active: true,
      last_login_at: true,
      created_at: true,
      updated_at: true,
    },
  }); 

  return JSON.parse(
    JSON.stringify(users, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
}
}