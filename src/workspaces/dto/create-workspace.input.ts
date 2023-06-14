import { InputType, Field } from '@nestjs/graphql';
import { IsHexColor } from 'class-validator';

@InputType()
export class CreateWorkspaceInput {
  @Field()
  name: string;

  @Field()
  icon: string;

  @Field()
  @IsHexColor()
  color: string;

  @Field()
  slug: string;
}
