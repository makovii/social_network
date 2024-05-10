import { BadRequestException, Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserByPassDto } from './dto/create-user.dto';
import { User } from '../user/user.model';
import { ValidationPipe } from '../pipe/validation.pipe';

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
        res.json({ googleId, email, accessToken, id });
    }

    @Post('register')
    @UsePipes(ValidationPipe)
    async register(@Body() body: CreateUserByPassDto): Promise<User> {
        const { email, password } = body;
        if (!email || !password) {
            throw new BadRequestException('Email and password are required');
        }
        return await this.authService.register({ email, password });
    }

    @Post('login')
    @UsePipes(ValidationPipe)
    async login(@Body() body: CreateUserByPassDto, @Res() res) {
        const { email, password } = body;
        if (!email || !password) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email and password are required' });
        }
        
        try {
            const response = await this.authService.login(body);
            return res.status(HttpStatus.OK).json(response);
        } catch (error) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
        }
    }
}

