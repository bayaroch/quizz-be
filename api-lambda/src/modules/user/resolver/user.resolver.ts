import { Args, Query, Resolver } from '@nestjs/graphql';

import { User } from '@modules/user/model/user.model';
import { UserService } from '@modules/user/service/user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User)
  userByFbId(@Args('uuid') userId: string) {
    return this.userService.getExistingUser(userId);
  }
}
