import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';

export enum MutationType {
  CREATE,
  UPDATE,
  DELETE,
}

registerEnumType(MutationType, {
  name: 'MutationType',
});

@ObjectType()
export class SubscriptionPayload {
  @Field(() => MutationType)
  mutation: MutationType;
}
