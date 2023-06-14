import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Theme } from '@prisma/client';

registerEnumType(Theme, {
  name: 'Theme',
});

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  photoURL?: string;

  @Field(() => Theme)
  theme: Theme;
}
