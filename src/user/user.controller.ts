import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  async getUserByEmail(@Param('email') email: any): Promise<{ email: string }> {
    return this.userService.getUserByEmail(email);
  }
}
