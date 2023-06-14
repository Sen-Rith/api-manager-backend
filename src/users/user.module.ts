import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { PubSubModule } from 'src/pub-sub/pub-sub.module';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PubSubModule, PrismaModule],
  providers: [UserResolver, UserService],
})
export class UserModule {}
