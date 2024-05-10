import { Controller, Get, Param, UseGuards, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    return this.userService.getUserById(+id);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  async getUserByEmail(@Param('email') email: string, @Req() req): Promise<{ email: string }> {
    console.log(req.user);
    return this.userService.getUserByEmail(email);
  }

  @Post('follow')
  @UseGuards(JwtAuthGuard)
  async follow(@Body('email') emailToFollow: string, @Req() req, @Res() res): Promise<void> {
    const { googleId, email: userEmail, id } = req.user;
    const user = new User({ email: userEmail, googleId, id, password: ''});
    const result = await this.userService.follow(user, emailToFollow);
    if (result) {
        return res.status(HttpStatus.OK).json();
    } else {
        return res.status(HttpStatus.BAD_REQUEST).json();
    }

  }
}
