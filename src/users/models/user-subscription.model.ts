import { ObjectType, Field } from '@nestjs/graphql';
import { SubscriptionPayload } from 'src/global-models/subscription-payload.model';
import { User } from './user.model';

@ObjectType()
export class UserSubscriptionPayload extends SubscriptionPayload {
  @Field(() => User)
  user: User;
}
