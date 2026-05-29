// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CdnAsset } from './cdn-asset.entity';
import { CdnService } from './cdn.service';
import { CdnController } from './cdn.controller';
@Module({
  imports: [TypeOrmModule.forFeature([CdnAsset]), ConfigModule],
  providers: [CdnService],
  controllers: [CdnController],
  exports: [CdnService]
})
export class CdnModule {}