import * as bcrypt from 'bcryptjs';

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto, LoginResponseData } from './dto/auth.dto';
import { DbService } from 'src/db/db.service';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    private dbService: DbService,
    private jwtService: JwtService,
    // private readonly eventEmitter: EventEmitter2
  ) { }

  async login(userToLogin: LoginDto): Promise<LoginResponseData> {
    const user = await this.dbService.user.findUnique({
      where: {
        email: userToLogin.email
      }
    })
    if (!user) {
      // console.log(userToLogin.phone);
      throw new NotFoundException("Invalid email")
    }
    // Check credentials
    const isMatch = await bcrypt.compare(userToLogin.password, user.password);
    console.log(userToLogin.password, user.password)

    if (isMatch) {
      const { password, password_reset_token, ...otherDetails } = user;

      const jwtPayload = { sub: user.id, ...otherDetails };
      const access_token = await this.jwtService.signAsync(jwtPayload);
      const decodedToken = this.jwtService.decode(access_token) as any;
      const expiresIn = decodedToken.exp;

      return {
        access_token,
        user: {
          ...otherDetails
        }
      }
    }

    throw new UnauthorizedException("Invalid credentials")

  }
}
