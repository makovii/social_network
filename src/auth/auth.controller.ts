import { BadRequestException, Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../user/user.model';
import { ValidationPipe } from '../pipe/validation.pipe';
import { ErrorText } from '../constant/constant';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req, @Res() res) {
        const { googleId, email, accessToken, id } = req.user;
        console.log(accessToken)
        res.redirect(`http://localhost:5173/feed?accessToken=${accessToken}`);
    }

    @Post('register')
    @UsePipes(ValidationPipe)
    async register(@Body() body: CreateUserDto): Promise<User> {
        const { email, password } = body;
        if (!email || !password) {
            throw new BadRequestException(ErrorText.EMAIL_AND_PASS);
        }
        try {
            const result =  await this.authService.register({ email, password });
            return result;            
        } catch (e) {
            throw e;
        }

    }

    @Post('login')
    @UsePipes(ValidationPipe)
    async login(@Body() body: CreateUserDto, @Res() res) {
        const { email, password } = body;
        if (!email || !password) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: ErrorText.EMAIL_AND_PASS });
        }
        
        try {
            const response = await this.authService.login(body);
            return res.status(HttpStatus.OK).json(response);
        } catch (error) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
        }
    }
}

