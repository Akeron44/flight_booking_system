import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { promisify } from 'util';
import { UserService } from '../user.service';
import { checkIfUserExist } from '../helper/checkUser';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signup(userObj: CreateUserDto) {
    const users = await this.userService.find(userObj.email);

    if (users.length) {
      throw new BadRequestException('User already registered.');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(userObj.password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    const user = await this.userService.create({
      ...userObj,
      password: result,
    });

    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.userService.find(email);
    checkIfUserExist(user);

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Invalid email or password.');
    }

    return user;
  }
}
