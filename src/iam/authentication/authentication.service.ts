import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { BcryptService } from '../hashing/bcrypt.hash';
import { ActiveUserDTO } from './dto/activeUser.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/users/dto/loginDto.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashingService: BcryptService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtconfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async createUser(createUser: CreateUserDto) {
    try {
      const { email, password, confirmPassword, cacNumber, businessName } =
        createUser;

      const comparePassword =
        password.toString().toLowerCase() ===
        confirmPassword.toString().toLowerCase();

      const isEmailNotUnique = await this.userModel.findOne({ email });
      const isUsernameNotUnique = await this.userModel.findOne({
        name: businessName,
      });

      if (isEmailNotUnique) {
        throw new ConflictException('Email already exists');
      }
      if (isUsernameNotUnique) {
        throw new ConflictException(
          'businessName has already been used for another business. Kindly Use another username',
        );
      }
      if (!comparePassword) {
        throw new UnauthorizedException(
          'Passsword do not match. Kindly Check and try again',
        );
      }

      const hashedPassword = await this.hashingService.hash(password);
      const user = await this.userModel.create({
        password: hashedPassword,
        email,
        cacNumber,
        businessName,
      });

      const accessToken = await this.generateToken(user);
      return {
        status: 'success',
        message: 'Created User Successfully',
        data: { accessToken },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException({
          status: 'error',
          data: null,
          message: error.message || 'Authentication failed',
        });
      }

      if (error instanceof ConflictException) {
        throw new ConflictException({
          status: 'error',
          data: null,
          message: 'User already exists',
        });
      }

      throw new UnauthorizedException({
        status: 'error',
        data: null,
        message: 'Failed to create user',
      });
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('The email does not exist.');
      }

      const isPasswordValid = await this.hashingService.compare(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException(
          'Incorrect Password. Please input the correct password and try again',
        );
      }

      const accessToken = await this.generateToken(user);
      return {
        status: 'success',
        message: 'Login Successful',
        data: { accessToken },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException({
          status: 'error',
          data: null,
          message: error.message || 'Authentication failed',
        });
      }

      throw new UnauthorizedException({
        status: 'error',
        data: null,
        message: 'Failed to login',
      });
    }
  }

  //

  private async generateToken(user: User) {
    const accessToken = await this.signToken<Partial<ActiveUserDTO>>(
      user.id,
      this.jwtconfiguration.accessTokenTTL,
      { email: user.email, role: user.role, name: user.businessName },
    );
    // user.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000;
    return accessToken;
  }

  private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
    return await this.jwtService.sign(
      { sub: userId, ...payload },
      {
        issuer: this.jwtconfiguration.issuer,
        audience: this.jwtconfiguration.audience,
        secret: this.jwtconfiguration.secret,
        expiresIn,
      },
    );
  }
}
