// src/upload/local-storage.service.ts

import { Injectable } from '@nestjs/common';
import { IStorageService } from './storage.service.interface';
import { promises as fs } from 'fs';
// fs.promises가 Promise 버전인데, 그걸 fs라는 이름으로 다시 가져온 것(as fs)
// 그냥 import * as fs from 'fs'로 가져왔으면 콜백 방식이라 await를 못 씀
import { v4 as uuidv4 } from 'uuid';
// uid 패키지에서 버전 4 알고리즘으로 랜덤 고유 ID를 만드는 함수 v4를 가져오는 건데,
// 이름이 너무 짧아서 헷갈리니까 uuidv4라는 이름으로 바꿔서(as uuidv4) 사용
// 파일명 지어줄 때 이걸 써서, 두 사람이 동시에 photo.jpg를 업로드해도 저장되는 실제 파일명은 서로 겹치지 않게 만드는 용도
import { join } from 'path';
//

@Injectable()
export class LocalStorageService implements IStorageService {
  // implements : 클래스가 특정 인터페이스의 "계약"을 반드시 지키도록 강제하는 키워드
  // class LocalStorageService implements IStorageService라고 쓰면,
  // IStorageService가 요구하는 메서드(upload)를 이 클래스가 반드시 구현해야 하고 시그니처(파라미터/리턴 타입)도 똑같이 맞춰야함.

  // 저장 디렉토리: 프로젝트 루트 기준 uploads/board
  // join : 경로 조각들을 OS에 맞게 안전하게 이어붙여주는 Node.js 내장 함수
  private readonly uploadDir = join(process.cwd(), 'uploads', 'board');

  async upload(file: Express.Multer.File): Promise<string> {
    // 디렉토리 없으면 생성 (재귀적으로)
    await fs.mkdir(this.uploadDir, { recursive: true });
    // recursive : fs.mkdir(경로, { recursive: true })에서 쓰는 옵션
    // 기본값은 false인데, 이러면 uploads 폴더가 없는 상태에서 uploads/board를 만들려고 하면 에러가 남
    // true를 주면 중간에 없는 폴더까지 다 알아서 만들어줌 — mkdir -p랑 같은 동작

    // 파일명 충돌 방지: uuid + 원본 확장자
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const filePath = join(this.uploadDir, filename);

    // memoryStorage로 받은 버퍼를 디스크에 직접 씀
    // -> 나중에 S3 구현체는 이 부분만 PutObjectCommand로 바뀌면 됨
    await fs.writeFile(filePath, file.buffer);

    // main.ts에서 /uploads 경로로 정적 서빙할 예정이므로 그 경로 기준 URL 반환
    return `/uploads/board/${filename}`;
  }
}