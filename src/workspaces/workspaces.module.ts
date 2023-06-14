import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesResolver } from './workspaces.resolver';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PubSubModule, PrismaModule],
  providers: [WorkspacesResolver, WorkspacesService],
})
export class WorkspacesModule {}
