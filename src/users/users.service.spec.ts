// src/users/users.service.spec.ts
// UsersService 단위 테스트 — 실제 DB/서버 없이 Repository를 가짜(mock)로 대체해서 로직만 검증함
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

// bcrypt.hash를 실제로 돌리면 느리고, 매 실행마다 값이 달라져서 검증이 어려움
// 그래서 해시 함수 자체를 가짜로 대체해서 "호출됐는지"만 확인함
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: userRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // 매 테스트 전에 bcrypt.hash mock을 원하는 값으로 초기화
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
  });

  describe('create', () => {
    it('아이디/이메일/닉네임이 모두 중복 없으면 정상 가입 처리한다', async () => {
      userRepository.findOne.mockResolvedValue(null); // 세 번의 중복 체크 findOne 모두 null 반환
      const savedUser = {
        id: 1,
        userId: 'doto1',
        email: 'doto1@test.com',
        password: 'hashed_password',
        nickname: '도토',
        grade: '병아리',
      };
      userRepository.create.mockReturnValue(savedUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await service.create({
        userId: 'doto1',
        email: 'doto1@test.com',
        password: 'plain_password',
        nickname: '도토',
        grade: '병아리',
      });

      // 저장 전에 비밀번호가 해싱됐는지 확인 (평문이 그대로 넘어가면 안 됨)
      expect(bcrypt.hash).toHaveBeenCalledWith('plain_password', 10);
      // 응답에 password 필드가 제외됐는지 확인 (excludePassword 동작 검증)
      expect(result).not.toHaveProperty('password');
    });

    it('아이디가 이미 존재하면 ConflictException을 던진다', async () => {
      // 첫 번째 findOne(아이디 체크)만 값 있음, 나머지는 null
      userRepository.findOne
        .mockResolvedValueOnce({ id: 99 }) // existingId
        .mockResolvedValueOnce(null) // existingEmail
        .mockResolvedValueOnce(null); // existingNickname

      await expect(
        service.create({
          userId: 'doto1',
          email: 'new@test.com',
          password: 'plain_password',
          nickname: '새닉네임',
          grade: '병아리',
        }),
      ).rejects.toThrow('이미 존재하는 아이디입니다.');

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('존재하지 않는 id면 NotFoundException을 던진다', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('존재하는 id면 비밀번호를 제외하고 반환한다', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
        userId: 'doto1',
        password: 'hashed_password',
        nickname: '도토',
      });

      const result = await service.findOne(1);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('update', () => {
    it('다른 유저가 이미 쓰는 닉네임으로 변경하려 하면 ConflictException을 던진다', async () => {
      const targetUser = { id: 1, userId: 'doto1', nickname: '기존닉네임' };
      userRepository.findOne
        .mockResolvedValueOnce(targetUser) // findUserOrFail 내부 조회
        .mockResolvedValueOnce({ id: 2, nickname: '중복닉네임' }); // 닉네임 중복 체크 (다른 유저 id=2)

      await expect(service.update(1, { nickname: '중복닉네임' })).rejects.toThrow('이미 존재하는 닉네임입니다.');
    });

    it('자기 자신의 기존 값으로 수정 요청해도 중복으로 판단하지 않는다', async () => {
      const targetUser = { id: 1, userId: 'doto1', nickname: '내닉네임' };
      userRepository.findOne
        .mockResolvedValueOnce(targetUser) // findUserOrFail
        .mockResolvedValueOnce({ id: 1, nickname: '내닉네임' }); // 조회된 게 자기 자신(id 동일)
      userRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.update(1, { nickname: '내닉네임' });

      // 자기 자신은 중복 취급 안 되므로 정상적으로 저장까지 진행됨
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
    });

    it('비밀번호를 수정 요청에 포함한 경우에만 재해싱한다', async () => {
      const targetUser = { id: 1, userId: 'doto1' };
      userRepository.findOne.mockResolvedValue(targetUser);
      userRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      await service.update(1, { password: 'new_plain_password' });

      expect(bcrypt.hash).toHaveBeenCalledWith('new_plain_password', 10);
    });
  });

  describe('remove', () => {
    it('존재하지 않는 id를 삭제하려 하면 NotFoundException을 던진다', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('존재하는 id면 삭제하고 id를 반환한다', async () => {
      const targetUser = { id: 1, userId: 'doto1' };
      userRepository.findOne.mockResolvedValue(targetUser);
      userRepository.remove.mockResolvedValue(targetUser);

      const result = await service.remove(1);

      expect(userRepository.remove).toHaveBeenCalledWith(targetUser);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('findByUserId', () => {
    it('존재하는 userId면 비밀번호 포함된 원본 유저를 반환', async () => {
      const mockUser = { id: 1, userId: 'doto1', password: 'hashed_password' };
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByUserId('doto1');

      // 비밀번호가 그대로 남아있어야 함 (findOne처럼 excludePassword 씌우면 안 됨)
      expect(result).toHaveProperty('password');
      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 userId면 null 반환', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUserId('no_such_user');

      expect(result).toBeNull();
    });
  });
});
