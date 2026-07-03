// src/users/dto/create-user.dto.ts
// entity 무결성 보호 및 Validation 기능을 해주는 곳이라고 생각하면 편할듯
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({message: '아이디는 필수 입력 값입니다.'})
  @IsString({message: '아이디는 문자열이어야 합니다.'})
  userId: string;
  // @IsEmail() : 들어온 문자열이 올바른 이메일 형식(예: test@ex.com)인지 검증
  // 형식에 맞지 않는 경우 비즈니스 로직이 실행되지 않고 400 Bad Request 에러 발생
  @IsEmail({}, {message: '올바른 이메일 형식이 아닙니다.'})
  @IsNotEmpty({message: '이메일은 필수 입력 값입니다.'})
  email: string;

  // @Length(min, max): 문자열의 최소 길이와 최대 길이를 동시에 제한
  // PE에서도 검증하겠지만 BE에서 한 번 더 잡아주는 것이 정석 보안 아키텍쳐
  @IsString({message: '비밀번호는 문자열이어야 합니다.'})
  @Length(6, 20, {message: '비밀번호는 최소 6자에서 최대 20자 사이여야 합니다.'})
  password: string;

  @IsString({ message: '닉네임은 문자열이여야 합니다.'})
  @IsNotEmpty({message: '닉네임은 필수 입력 값입니다.'})
  nickname: string;

  @IsString({message: '등급은 문자열이여야 합니다.'})
  @IsNotEmpty({message: '등급 정보는 필수 입력 항목입니다.'})
  grade: string;
}

