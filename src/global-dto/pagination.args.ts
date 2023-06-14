import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true })
  skip = 0;

  @Field(() => Int, { nullable: true })
  take = 10;
}
