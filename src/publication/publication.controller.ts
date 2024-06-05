import { Controller, Get, Param, UseGuards, Post, Body, Req, Res, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { PublicationService } from './publication.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/user.model';
import { CommentPub } from './dto/commentPub.dto';

@Controller('publication')
export class PublicationController {
  constructor(private readonly publicationService: PublicationService) {}

  @Post('likePub')
  @UseGuards(JwtAuthGuard)
  async likePubPublication(@Body('uuidPub') uuidPub: string, @Req() req, @Res() res): Promise<void> {
    const { googleId, email: userEmail, uuid } = req.user;

    const user = new User({ email: userEmail, googleId, uuid, password: ''});

    const result = await this.publicationService.likePub(user, uuidPub);
    if (result) {
        return res.status(HttpStatus.OK).json();
    } else {
        return res.status(HttpStatus.BAD_REQUEST).json();
    }
  }

  @Post('unlikePub')
  @UseGuards(JwtAuthGuard)
  async unlikePubPublication(@Body('uuidPub') uuidPub: string, @Req() req, @Res() res): Promise<void> {
    const { googleId, email: userEmail, uuid } = req.user;

    const user = new User({ email: userEmail, googleId, uuid, password: ''});

    const result = await this.publicationService.unlikePub(user, uuidPub);
    if (result) {
        return res.status(HttpStatus.OK).json();
    } else {
        return res.status(HttpStatus.BAD_REQUEST).json();
    }
  }

  @Post('commentPub')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async commentPublication(@Body() pub: CommentPub, @Req() req, @Res() res): Promise<void> {
    const { googleId, email: userEmail, uuid } = req.user;

    const user = new User({ email: userEmail, googleId, uuid, password: ''});

    const result = await this.publicationService.commentPublication(user, pub);
    if (result) {
        return res.status(HttpStatus.OK).json();
    } else {
        return res.status(HttpStatus.BAD_REQUEST).json();
    }
  }
}
