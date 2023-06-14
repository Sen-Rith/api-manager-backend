import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { MutationType } from 'src/global-models/subscription-payload.model';
import { UserSubscriptionPayload } from './models/user-subscription.model';

@Injectable()
export class UserService {
  constructor(
    @Inject('PUB_SUB') private pubSub: RedisPubSub,
    private readonly prismaService: PrismaService,
  ) {}

  async update(id: string, updateUserInput: UpdateUserInput) {
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: updateUserInput,
    });

    this.pubSub.publish(`USER_${id}_UPDATED`, {
      mutation: MutationType.UPDATE,
      user: updatedUser,
    } as UserSubscriptionPayload);

    return updatedUser;
  }
}
