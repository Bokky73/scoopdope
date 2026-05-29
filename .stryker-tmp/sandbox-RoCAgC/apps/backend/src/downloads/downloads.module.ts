// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadItem } from './download-item.entity';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
@Module({
  imports: [TypeOrmModule.forFeature([DownloadItem])],
  providers: [DownloadsService],
  controllers: [DownloadsController]
})
export class DownloadsModule {}