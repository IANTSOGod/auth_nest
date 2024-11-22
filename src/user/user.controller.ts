import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserInterface, UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/create')
  async createUser(@Body() body: UserInterface) {
    return this.userService.createUser(body);
  }

  @Get('/list')
  async listUser() {
    return this.userService.listUser();
  }
}
