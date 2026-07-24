// src/upload/storage.service.interface.ts
// 스토리지 구현체가 공통으로 지켜야 할 계약
// 지금은 LocalStorageService가 이걸 구현하고, 나중에 S3StorageService로 교체 가능

export interface IStorageService {
  // 파일 버퍼를 받아서 저장하고, 접근 가능한 URL을 반환
  upload(file: Express.Multer.File): Promise<string>;
}

// DI 토큰: 인터페이스는 런타임에 사라지므로 문자열 토큰으로 주입 지점을 표시
export const STORAGE_SERVICE = 'STORAGE_SERVICE';