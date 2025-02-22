import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { Roles } from '@modules/auth/decorators/roles.decorator';
import { UserService } from '@modules/user/service/user.service';

import { CurrentUser } from '../../auth/decorators/user.decorator';
import { Role } from '../../auth/enums/role.enum';
import { UserInput } from '../model/user-input';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // User endpont
  @Get('profile')
  @Roles(Role.USER)
  async getProfile(@CurrentUser() currentUserDto: UserInput) {
    const existingUser = await this.userService.getExistingUser(
      currentUserDto.uuid,
    );

    return existingUser;
  }

  @HttpCode(HttpStatus.OK)
  @Get('app-init')
  @Roles(Role.USER, Role.ADMIN)
  getAppInit(@CurrentUser() currentUserDto: UserInput) {
    return this.userService.getAppInit(currentUserDto);
  }
}
