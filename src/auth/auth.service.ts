import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signin(dto: AuthDto) {
    //find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    //if user not found throw exp
    if (!user) {
      throw new ForbiddenException('credential incorrect');
    }
    //compare hash
    const pwMatchs = await argon.verify(user.hash, dto.password);
    //if pass dont match throw exp
    if (!pwMatchs) throw new ForbiddenException('credential incorrect');
    //send back the user
    delete user.hash;
    return user;
  }
  async signup(dto: AuthDto) {
    //hash password
    const hash = await argon.hash(dto.password);

    try {
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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
}
