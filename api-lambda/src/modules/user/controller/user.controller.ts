import { Controller, Get } from '@nestjs/common';

import { Roles } from '@modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@modules/auth/decorators/user.decorator';
import { Role } from '@modules/auth/enums/role.enum';

import { UserInput } from '@modules/user/model/user-input';
import { UserService } from '@modules/user/service/user.service';

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
}
