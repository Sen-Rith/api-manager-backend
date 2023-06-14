import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { UserModule } from './users/user.module';
import { PrismaService } from './prisma/prisma.service';
import { FirebaseService } from './firebase/firebase.service';
import { PubSubModule } from './pub-sub/pub-sub.module';
import { FirebaseModule } from './firebase/firebase.module';
import { PrismaModule } from './prisma/prisma.module';
import { PreauthMiddleware } from './auth/preauth.middleware';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [FirebaseModule, PrismaModule],
      inject: [FirebaseService, PrismaService],
      driver: ApolloDriver,
      useFactory: (
        firebaseService: FirebaseService,
        prismaService: PrismaService,
      ) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: false,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        subscriptions: {
          'graphql-ws': {
            onConnect: async (context) => {
              const { connectionParams, extra } = context;
              const authToken = connectionParams.Authorization;
              if (!authToken || typeof authToken !== 'string') {
                return false;
              }
              try {
                const decodedToken = await firebaseService
                  .auth()
                  .verifyIdToken(authToken.replace('Bearer ', ''));
                const user = await prismaService.user.findUnique({
                  where: { email: decodedToken.email },
                });
                if (!user) return false;
                extra['user'] = user;
              } catch (error) {
                return false;
              }
            },
          },
        },
      }),
    }),
    PubSubModule,
    FirebaseModule,
    PrismaModule,
    UserModule,
    WorkspacesModule,
  ],
  controllers: [],
  providers: [PrismaService, FirebaseService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreauthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.POST,
    });
  }
}
