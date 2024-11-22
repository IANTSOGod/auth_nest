import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
export interface UserInterface {
  email: string;
  mdp: string;
  firstname: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser({ email, mdp, firstname }: UserInterface) {
    const truePassword = await this.hashPassword(mdp);
    return this.prisma.user.create({
      data: {
        email: email,
        mdp: truePassword,
        firstName: firstname,
      },
    });
  }

  private async hashPassword(password: string) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

  async listUser() {
    return this.prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
      },
    });
  }
}
