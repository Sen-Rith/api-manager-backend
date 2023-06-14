import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
  Context,
} from '@nestjs/graphql';
import { User } from './models/user.model';
import { CurrentUser } from './user.decorator';
import { UpdateUserInput } from './dto/update-user.input';
import { Inject } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { UserService } from './user.service';
import { UserSubscriptionPayload } from './models/user-subscription.model';

@Resolver(() => User)
export class UserResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: RedisPubSub,
    private readonly userService: UserService,
  ) {}

  @Query(() => User)
  async user(@CurrentUser() user: User) {
    return user;
  }

  @Mutation(() => User)
  async updateUser(
    @CurrentUser() user: User,
    @Args('input') input: UpdateUserInput,
  ) {
    return await this.userService.update(user.id, input);
  }

  @Subscription(() => UserSubscriptionPayload, {
    resolve: (value) => ({
      ...value,
      payload: { subscribeToUser: value.payload },
    }),
  })
  subscribeToUser(@Context() context) {
    return this.pubSub.asyncIterator(
      `USER_${context.req.extra.user.id}_UPDATED`,
    );
  }
}
