import { Controller, Get, UseGuards, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Publication } from '../publication/publication.model';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Post('getUserByEmail')
  @UseGuards(JwtAuthGuard)
  async getUserByEmail(@Body('email') email: string, @Req() req): Promise<{ email: string }> {
    return this.userService.getUserByEmail(email);
  }

  @Post('searchUsersByEmail')
  @UseGuards(JwtAuthGuard)
  async searchUsersByEmail(@Body('email') email: string, @Req() req): Promise<{ email: string }[]> {
    return this.userService.searchUsersByEmail(email);
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribe(@Body('email') emailToFollow: string, @Req() req, @Res() res): Promise<void> {
    const { googleId, email: userEmail, uuid } = req.user;
    const user = new User({ email: userEmail, googleId, uuid });
    const result = await this.userService.subscribe(user, emailToFollow);
    if (result) {
        return res.status(HttpStatus.OK).json();
    } else {
        return res.status(HttpStatus.BAD_REQUEST).json();
    }
  }

  @Post('unsubscribe')
  @UseGuards(JwtAuthGuard)
  async unsubscribe(@Body('email') emailToFollow: string, @Req() req, @Res() res): Promise<void> {
    const { googleId, email: userEmail, uuid } = req.user;
    const user = new User({ email: userEmail, googleId, uuid });
    const result = await this.userService.unsubscribe(user, emailToFollow);
    if (result) {
        return res.status(HttpStatus.OK).json();
    } else {
        return res.status(HttpStatus.BAD_REQUEST).json();
    }
  }


  @Post('createPublication')
  @UseGuards(JwtAuthGuard)
  async createPublication(@Body('text') text: string, @Req() req): Promise<Publication> {
    const { googleId, email: userEmail, uuid } = req.user;

    const user = new User({ email: userEmail, googleId, uuid, password: ''});

    return await this.userService.createPublication(user, text);
  }

  @Get('getNews')
  @UseGuards(JwtAuthGuard)
  async getNews(@Req() req): Promise<{publication: Publication; creator: User;}[]> {
    const { googleId, email: userEmail, uuid } = req.user;

    const user = new User({ email: userEmail, googleId, uuid, password: ''});

    return await this.userService.getNews(user);
  }

  @Get('getSubscriptions')
  @UseGuards(JwtAuthGuard)
  async getSubscriptions(@Req() req): Promise<User[]> {
    const { googleId, email: userEmail, uuid } = req.user;

    const user = new User({ email: userEmail, googleId, uuid, password: ''});

    return await this.userService.getSubscriptions(user);
  }
}
