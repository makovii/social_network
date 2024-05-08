import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

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
        const { googleId, email } = req.user;

        res.json({ googleId, email });
    }

    @Post('register')
    async register(@Body() body: { email: string; password: string }, @Res() res) {
        const { email, password } = body;
        if (!email || !password) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email and password are required' });
        }
        return this.authService.register({ email, password });

    }
}

