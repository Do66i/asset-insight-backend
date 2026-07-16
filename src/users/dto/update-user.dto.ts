// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
/*
 * note: PartialType(CreateUserDto)
 * CreateUserDto에 이미 정의된 필드들과 데코레이터(예: @IsString() 등)를 모두 자동으로 가져와서 Optional로 바꿔줌
 * 즉 CreateUserDto에 있던 검증 규칙이 그대로 재사용
 *  */