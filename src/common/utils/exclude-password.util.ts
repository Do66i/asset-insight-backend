// src/common/utils/exclude-password.util.ts
import { User } from 'src/users/entities/user.entity';

// Omit: 특정필드 제외한 나머지부분 다 들고오기
export function excludePassword(user: User): Omit<User, 'password'> {
  const { password: _, ...rest } = user;
  return rest;
}