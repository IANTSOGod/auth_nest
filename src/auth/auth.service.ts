import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { compare } from 'bcrypt';

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
  constructor(private readonly prisma: PrismaService) {}

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

    const result = await this.prisma.user.findUnique({
      where: {
        email: userFound.email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });

    return result;
  }

  private async verifyPassword({
    mdp,
    hashedMdp,
  }: PasswordComparaison): Promise<boolean> {
    return compare(mdp, hashedMdp);
  }
}
