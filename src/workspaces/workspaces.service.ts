import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWorkspaceInput } from './dto/create-workspace.input';
import { UpdateWorkspaceInput } from './dto/update-workspace.input';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/users/models/user.model';
import { PaginationArgs } from 'src/global-dto/pagination.args';
import { WorkspaceList } from './models/workspace-list.model';
import { Workspace } from './models/workspace.model';
import { MutationType } from 'src/global-models/subscription-payload.model';
import { WorkspaceSubscriptionPayload } from './models/workspace-subscription.model';

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject('PUB_SUB') private pubSub: RedisPubSub,
    private readonly prismaService: PrismaService,
  ) {}

  async create(
    user: User,
    createWorkspaceInput: CreateWorkspaceInput,
  ): Promise<Workspace> {
    const newWorkspace = await this.prismaService.workspace.create({
      data: {
        ...createWorkspaceInput,
        workspaceUsers: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return newWorkspace;
  }

  async findAll(user: User, args: PaginationArgs): Promise<WorkspaceList> {
    const workspaces = await this.prismaService.workspace.findMany({
      where: {
        workspaceUsers: {
          some: {
            userId: user.id,
          },
        },
      },
      skip: args.skip,
      take: args.take,
    });

    const total = await this.prismaService.workspace.count({
      where: {
        workspaceUsers: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    return {
      workspaces,
      hasMore: total > args.skip + args.take,
    };
  }

  async findOne(user: User, id: string): Promise<Workspace> {
    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        id,
        workspaceUsers: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(
    user: User,
    updateWorkspaceInput: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        id: updateWorkspaceInput.id,
        workspaceUsers: {
          some: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const updatedWorkspace = await this.prismaService.workspace.update({
      where: {
        id: updateWorkspaceInput.id,
      },
      data: updateWorkspaceInput,
    });

    this.pubSub.publish(`WORKSPACE_${updatedWorkspace.id}_UPDATED`, {
      subscribeToWorkspace: {
        mutation: MutationType.UPDATE,
        workspace: updatedWorkspace,
      } as WorkspaceSubscriptionPayload,
    });

    return updatedWorkspace;
  }

  async remove(user: User, id: string) {
    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        id,
        workspaceUsers: {
          some: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const deletedWorkspace = await this.prismaService.workspace.delete({
      where: { id },
    });

    this.pubSub.publish(`WORKSPACE_${id}_DELETED`, {
      subscribeToWorkspace: {
        mutation: MutationType.DELETE,
        workspace: deletedWorkspace,
      } as WorkspaceSubscriptionPayload,
    });

    return deletedWorkspace;
  }

  async isUserInWorkspace(user: User, id: string): Promise<boolean> {
    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        id,
        workspaceUsers: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    return !!workspace;
  }

  async isWorkspaceSlugAvailable(slug: string): Promise<boolean> {
    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        slug,
      },
    });

    return !workspace;
  }
}
