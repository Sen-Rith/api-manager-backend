import { ObjectType, Field } from '@nestjs/graphql';
import { Workspace } from './workspace.model';
import { SubscriptionPayload } from 'src/global-models/subscription-payload.model';

@ObjectType()
export class WorkspaceSubscriptionPayload extends SubscriptionPayload {
  @Field(() => Workspace)
  workspace: Workspace;
}
