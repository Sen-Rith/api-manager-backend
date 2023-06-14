import { Field, ObjectType } from '@nestjs/graphql';
import { Pagination } from 'src/global-models/pagination.model';
import { Workspace } from './workspace.model';

@ObjectType()
export class WorkspaceList extends Pagination {
  @Field(() => [Workspace])
  workspaces: Workspace[];
}
