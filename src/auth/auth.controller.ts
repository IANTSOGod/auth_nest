import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService, UserInterfaceLog } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/authentify')
  async login(@Body() user: UserInterfaceLog) {
    return this.authService.authentify(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async authenticate(@Request() request: RequestWithUser) {
    return this.userService.getUser({ userId: request.user.userId });
  }
}
