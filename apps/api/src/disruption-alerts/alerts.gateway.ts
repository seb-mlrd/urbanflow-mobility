import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/jwt-payload.type.js';
import { ProfileService } from '../profile/profile.service.js';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
  namespace: '/alerts',
})
export class AlertsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AlertsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly profileService: ProfileService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const profile = await this.profileService.findByUserId(payload.sub);
      await client.join(`user:${profile.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect() {
    // Les rooms socket.io sont nettoyées automatiquement par la déconnexion.
  }

  notifyUser(profileId: string, payload: unknown): void {
    this.server.to(`user:${profileId}`).emit('disruption', payload);
  }
}
