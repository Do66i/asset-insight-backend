// src/upload/upload.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors, Inject, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { memoryStorage } from 'multer';
import type { IStorageService } from './storage.service.interface';
import { STORAGE_SERVICE } from './storage.service.interface';

@Controller('upload')
export class UploadController {
  // 인터페이스 토큰으로 주입받음 -> 구현체가 뭐든 컨트롤러는 신경 안 씀
  constructor(@Inject(STORAGE_SERVICE) private readonly storageService: IStorageService) {}

  // 에디터에서 이미지 업로드 시 호출되는 엔드포인트
  @UseGuards(AuthGuard('jwt'))
  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // 디스크에 바로 안 쓰고 메모리 버퍼로만 받음
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.storageService.upload(file);
    return { success: true, message: '업로드 완료', data: { url } };
  }
}
