import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { WorkspacesService } from './workspaces.service';
import { Workspace } from './models/workspace.model';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { CurrentUser } from 'src/users/user.decorator';
import { User } from 'src/users/models/user.model';
import { PaginationArgs } from 'src/global-dto/pagination.args';
import { WorkspaceList } from './models/workspace-list.model';
import { WorkspaceSubscriptionPayload } from './models/workspace-subscription.model';
import { Inject } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { UpdateWorkspaceInput } from './dto/update-workspace.input';

@Resolver(() => Workspace)
export class WorkspacesResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: RedisPubSub,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @Mutation(() => Workspace)
  async createWorkspace(
    @CurrentUser() user: User,
    @Args('input') input: CreateWorkspaceInput,
  ) {
    return await this.workspacesService.create(user, input);
  }

  @Query(() => Boolean)
  async isWorkspaceSlugAvailable(@Args('slug') slug: string) {
    return await this.workspacesService.isWorkspaceSlugAvailable(slug);
  }

  @Query(() => WorkspaceList, { name: 'workspaceList' })
  async findAll(@CurrentUser() user: User, @Args() args: PaginationArgs) {
    return await this.workspacesService.findAll(user, args);
  }

  @Query(() => Workspace, { name: 'workspace' })
  async findOne(@CurrentUser() user: User, @Args('id') id: string) {
    return await this.workspacesService.findOne(user, id);
  }

  @Mutation(() => Workspace)
  async updateWorkspace(
    @CurrentUser() user: User,
    @Args('input') input: UpdateWorkspaceInput,
  ) {
    return await this.workspacesService.update(user, input);
  }

  @Mutation(() => Workspace)
  removeWorkspace(@CurrentUser() user: User, @Args('id') id: string) {
    return this.workspacesService.remove(user, id);
  }

  @Subscription(() => WorkspaceSubscriptionPayload, {
    async filter(
      this: WorkspacesResolver,
      payload: WorkspaceSubscriptionPayload & { filter: { userIds: string[] } },
      variables,
      context,
    ) {
      if (payload.workspace.id !== variables.id) return false;
      if (!payload.filter.userIds.includes(context.req.extra.user.id)) {
        return false;
      }
      return true;
    },
    resolve: (value) => ({
      ...value,
      payload: { subscribeToWorkspace: value.payload },
    }),
  })
  subscribeToWorkspace(@Args('id') id: string) {
    return this.pubSub.asyncIterator([
      `WORKSPACE_${id}_UPDATED`,
      `WORKSPACE_${id}_DELETED`,
    ]);
  }
}
