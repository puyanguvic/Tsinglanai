import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { verifyPassword } from '../common/utils/hash';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService) {}

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role, email: user.email, displayName: user.displayName };
    return {
      accessToken: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async weappLogin(dto: any) {
    // Placeholder for mini-program login; integrate with wx.login session.
    return this.login({ email: dto.email, password: dto.code });
  }
}
