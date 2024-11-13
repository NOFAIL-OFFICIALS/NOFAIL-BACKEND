import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { BcryptService } from '../hashing/bcrypt.hash';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashingService: BcryptService,

    @Inject(jwtConfig.KEY)
    private readonly jwtconfigurations: ConfigType<typeof jwtConfig>,
  ) {}

  async createUser(createUser: CreateUserDto) {
    try {
      const { email, password, confirmPassword, cacNumber, businessName } =
        createUser;

      const comparePassword =
        password.toString().toLowerCase() ===
        confirmPassword.toString().toLowerCase();

      if (!comparePassword) {
        throw new UnauthorizedException('Passsword do not mathc');
      }

      //   const h
    } catch (error) {}
  }
}
