import { MinLength } from 'class-validator';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { Theme } from '@prisma/client';

registerEnumType(Theme, {
  name: 'Theme',
});

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @MinLength(3)
  displayName?: string;

  @Field(() => Theme, { nullable: true })
  theme?: Theme;
}
