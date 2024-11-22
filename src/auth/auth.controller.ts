import { Body, Controller, Post } from '@nestjs/common';
import { AuthService, UserInterfaceLog } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/authentify')
  async login(@Body() user: UserInterfaceLog) {
    return this.authService.authentify(user);
  }
}
