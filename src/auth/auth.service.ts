import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

function convertBigIntToString(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      profile_id: user.profile_id.toString(),
      institution_id: user.institution_id.toString(),
    };

    const access_token = await this.jwtService.signAsync(payload);

    return convertBigIntToString({
      access_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_id: user.profile_id,
        institution_id: user.institution_id,
      },
    });
  }
}