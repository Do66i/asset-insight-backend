// src/asset/asset.service.spec.ts
// AssetService 단위 테스트 — 실제 DB/서버 없이 Repository를 가짜(mock)로 대체해서 로직만 검증함
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm'; // Nest가 Repository를 mock으로 바꿔치기할 때 쓰는 토큰
import { NotFoundException } from '@nestjs/common';
import { AssetService } from './asset.service';
import { Asset } from './entities/asset.entity';
import { User } from '../users/entities/user.entity';

describe('AssetService', () => {
  // 테스트 대상 서비스 인스턴스
  let service: AssetService;

  // 진짜 TypeORM Repository 대신 쓸 가짜 객체 — 메서드 호출 여부/인자까지 검증 가능
  let assetRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let userRepository: { findOne: jest.Mock };

  // 매 테스트(it)마다 실행됨 — mock을 매번 초기화해서 이전 테스트 결과가 다음 테스트에 영향 안 주게 함
  beforeEach(async () => {
    assetRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    userRepository = { findOne: jest.fn() };

    // 실제 앱처럼 DI 모듈을 조립하되, Repository 자리에 mock을 끼워넣음
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetService, { provide: getRepositoryToken(Asset), useValue: assetRepository }, { provide: getRepositoryToken(User), useValue: userRepository }],
    }).compile();

    service = module.get<AssetService>(AssetService);
  });

  describe('create', () => {
    it('존재하지 않는 유저로 등록 시도하면 NotFoundException을 던진다', async () => {
      userRepository.findOne.mockResolvedValue(null); // 유저 조회 결과가 없다고 가정

      await expect(
        service.create(
          {
            name: '테스트',
            quantity: 1,
            avgPrice: 1000,
            category: '테스트',
          },
          'no_such_user', // userId는 이제 두 번째 인자로 별도 전달 (토큰에서 온 값)
        ),
      ).rejects.toThrow(NotFoundException);

      // 유저 검증에서 막혔으면 저장 로직까지 가면 안 됨
      expect(assetRepository.save).not.toHaveBeenCalled();
    });

    it('존재하는 유저면 자산을 생성하고 저장한다', async () => {
      const mockUser = { id: 1, userId: 'doto1' } as User;
      userRepository.findOne.mockResolvedValue(mockUser); // 유저는 정상적으로 찾아진다고 가정

      const createdEntity = {
        name: '삼성전자',
        quantity: 10,
        avgPrice: 71500,
        category: '국내 주식',
        user: mockUser,
      };
      assetRepository.create.mockReturnValue(createdEntity); // repository.create()는 동기 함수라 mockReturnValue 사용
      assetRepository.save.mockResolvedValue({ id: 1, ...createdEntity }); // save()는 비동기라 mockResolvedValue 사용

      const result = await service.create(
        {
          name: '삼성전자',
          quantity: 10,
          avgPrice: 71500,
          category: '국내 주식',
        },
        'doto1', // 토큰 주인의 userId
      );
      // 회귀 테스트 핵심: 넘겨받은 userId로 정확히 유저를 조회했는지 확인
      // (신뢰 문제 해결의 핵심 — 다른 값이 넘어가면 이 assert가 실패해서 바로 잡아냄)
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { userId: 'doto1' } });

      // user 관계가 조회된 유저 엔티티로 정확히 연결됐는지 확인 (FK 연결 검증)
      expect(assetRepository.create).toHaveBeenCalledWith(expect.objectContaining({ user: mockUser }));
      expect(result).toEqual({ id: 1, ...createdEntity });
    });
  });

  describe('findOne', () => {
    it('존재하지 않는 id면 NotFoundException을 던진다', async () => {
      assetRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('존재하는 id면 user 관계를 포함해서 조회하고 비밀번호는 제외한다', async () => {
      // 실제 서비스에선 relations: { user: true }로 항상 user가 채워진 채 오므로 mock도 동일하게 구성
      const mockUser = { id: 1, userId: 'doto1', password: 'hashed_password' } as User;
      const mockAsset = { id: 1, name: '삼성전자', user: mockUser } as Asset;
      assetRepository.findOne.mockResolvedValue(mockAsset);

      const result = await service.findOne(1);

      // TypeORM 1.0 문법(relations 객체 형태)이 정확히 전달되는지 확인
      // 예전 문법(['user'])으로 되돌아가는 실수를 여기서 바로 잡아낼 수 있음
      expect(assetRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { user: true },
      });

      // 응답에서 user.password가 제외됐는지 확인 (보안 회귀 방지)
      expect(result.user).not.toHaveProperty('password');
      expect(result.id).toBe(1);
    });
  });

  describe('update', () => {
    it('존재하지 않는 id를 수정하려 하면 NotFoundException을 던진다', async () => {
      assetRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { quantity: 5 })).rejects.toThrow(NotFoundException);
      expect(assetRepository.save).not.toHaveBeenCalled();
    });

    it('기존 엔티티와 수정 필드를 병합해서 저장하고 비밀번호는 제외한다', async () => {
      const mockUser = { id: 1, userId: 'doto1', password: 'hashed_password' } as User;
      const existingAsset = {
        id: 1,
        name: '삼성전자',
        quantity: 10,
        avgPrice: 71500,
        user: mockUser,
      } as Asset;
      assetRepository.findOne.mockResolvedValue(existingAsset);
      // save에 전달된 값을 그대로 반환하도록 설정 — 병합 결과를 검증하기 위함
      assetRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { quantity: 15 });

      // 예전에 실제로 났던 버그(await 누락) 재발 방지용 회귀 테스트
      // asset이 Promise가 아니라 실제 엔티티 값으로 스프레드됐는지 확인 (name이 살아있어야 함)
      expect(assetRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: '삼성전자', quantity: 15 }));
      expect(result.quantity).toBe(15);

      // 응답에서 user.password가 제외됐는지 확인 (보안 회귀 방지)
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('remove', () => {
    it('존재하지 않는 id를 삭제하려 하면 NotFoundException을 던진다', async () => {
      assetRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(assetRepository.remove).not.toHaveBeenCalled();
    });

    it('존재하는 id면 삭제하고 id를 반환한다', async () => {
      const existingAsset = { id: 1, name: '삼성전자' } as Asset;
      assetRepository.findOne.mockResolvedValue(existingAsset);
      assetRepository.remove.mockResolvedValue(existingAsset);

      const result = await service.remove(1);

      expect(assetRepository.remove).toHaveBeenCalledWith(existingAsset);
      expect(result).toEqual({ id: 1 });
    });
  });
});
