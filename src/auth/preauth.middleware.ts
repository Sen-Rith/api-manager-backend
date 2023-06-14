import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PreauthMiddleware implements NestMiddleware {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async use(req: Request, res: Response, next: () => void) {
    const token = req.headers.authorization;
    const theme = req.cookies.theme;

    if (!token) return next();

    try {
      const decodedToken = await this.firebaseService
        .auth()
        .verifyIdToken(token.replace('Bearer ', ''));
      const authUser = await this.firebaseService
        .auth()
        .getUser(decodedToken.uid);
      const user = await this.prismaService.user.findUnique({
        where: { email: authUser.email },
      });

      if (!user) {
        req['user'] = await this.prismaService.user.create({
          data: {
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            theme: ['light', 'dark'].includes(theme) ? theme : 'light',
          },
        });
      } else {
        req['user'] = user;
      }

      next();
    } catch (error) {
      this.accessDenied(req.url, res);
    }
  }

  private accessDenied(url: string, res: Response) {
    res.status(403).json({
      statusCode: 403,
      timestamp: new Date().toISOString(),
      path: url,
      message: 'Access Denied',
    });
  }
}
