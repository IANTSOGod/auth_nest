import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';

export interface UserInterfaceLog {
  email: string;
  mdp: string;
}

export interface PasswordComparaison {
  mdp: string;
  hashedMdp: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async authentify(user: UserInterfaceLog) {
    const userFound = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!userFound) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const isValidPassword = await this.verifyPassword({
      mdp: user.mdp,
      hashedMdp: userFound.mdp,
    });

    if (!isValidPassword) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    // const result = await this.prisma.user.findUnique({
    //   where: {
    //     email: userFound.email,
    //   },
    //   select: {
    //     id: true,
    //     email: true,
    //     firstName: true,
    //   },
    // });
    const access_token = (await this.generatePayload({ userId: userFound.id }))
      .access_token;
    return access_token;
  }

  private async verifyPassword({
    mdp,
    hashedMdp,
  }: PasswordComparaison): Promise<boolean> {
    return compare(mdp, hashedMdp);
  }

  private async generatePayload({ userId }: UserPayload) {
    const payload: UserPayload = { userId };
    return {
      access_token: this.jwtService.signAsync(payload),
    };
  }
}
