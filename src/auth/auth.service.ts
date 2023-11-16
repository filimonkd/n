import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  signin() {
    return 'signin';
  }
  async signup(dto: AuthDto) {
    //hash password
    const hash = await argon.hash(dto.password);

    //save user to database
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash,
      },
      // select: {
      //   id: true,
      //   email: true,
      //   createdAt: true,
      // },
    });

    delete user.hash;
    return user;
  }
}
