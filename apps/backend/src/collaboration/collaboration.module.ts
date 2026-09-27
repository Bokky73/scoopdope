import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { CollaborationGateway } from './collaboration.gateway';

@Module({
  providers: [PresenceService, CollaborationGateway],
  exports: [PresenceService, CollaborationGateway],
})
export class CollaborationModule {}
