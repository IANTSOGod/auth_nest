import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './jwt.strategy';
import { UserInterface, UserService } from 'src/user/user.service';

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
    private readonly userService: UserService,
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
    const result = await this.generatePayload({ userId: userFound.id });
    return result.access_token;
  }

  async register({ email, mdp, firstname }: UserInterface) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      throw new Error('Utilisateur avec meme email existe déja');
    }
    const hashed = await this.userService.hashPassword(mdp);
    const createdUser = await this.prisma.user.create({
      data: {
        email: email,
        mdp: hashed,
        firstName: firstname,
      },
    });

    const access_token = (
      await this.generatePayload({ userId: createdUser.id })
    ).access_token;

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
