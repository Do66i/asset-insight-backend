// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { LocalStorageService } from './local-storage.service';
import { STORAGE_SERVICE } from './storage.service.interface';

@Module({
  controllers: [UploadController],
  providers: [
    // 나중에 S3StorageService로 바꿀 땐 이 한 줄만 교체하면 됨
    { provide: STORAGE_SERVICE, useClass: LocalStorageService },
  ],
})
export class UploadModule {}
