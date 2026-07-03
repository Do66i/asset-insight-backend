// src/users/entities/user.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// @Entity()
// 클래스 바로 위에 붙어서 이 클래스가 단순한 객체가 아니라, 데이터베이스의 '테이블'과 1:1로 연결된다는 것을 선언
// 기본적으로 클래스 이름인 User을 소문자로 변환한 'user'이라는 이름의 테이블이 MySql에 생셩되게 만들어줌
@Entity()
export class User {
  // @PrimaryGeneratedColumn() 데코레이터
  // 관계셩 DB에서 가장 중요한 '기본키 (Primary Key)'를 지정하는 문법
  // DB 내부에서 이 값을 기준으로 특정 유저를 찾아낼 수 있음 (인덱싱 처리)
  // { type: 'int' }는 숫자가 저장되는 공간이라는 규격, 'increment' 방식은 데이터가 들어올 때 마다 자동으로 1, 2, 3... 증가하게 만듬
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  userId: string;
  // @Column() 데코레이터
  // 일반적인 데이터 열을 생성할 때 사용
  // type: 'varchar'는 가변 길이 문자열(Variable Character)을 뜻하는 표준 SQL타입. 글자 수에 맞춰 용량을 유연하게 가져감
  // length: 100은 최대 100글자만 받겠다는 제한. 무분별하게 큰 용량을 잡지 않기 위한 정석 설정
  // unique: true는 DB전체에 단 하나만 존재하도록 강제하는 제약 조건. 중복 방지
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  // 비밀번호의 경우 추후 bcrypt 라이브러리를 사용하여 긴 해시 문자열로 바꾼 후 저장할 예정
  // 그래서 length: 255로 넉넉하게 잡음
  @Column({ type: 'varchar', length: 255 })
  password: string;

  // nullable: false는 SQL의 'NOT NULL' 제약조건. 이 값이 비어있는 채로 데이터가 들어오면 저장하지 않고 에러 발생. 보통 명시하지 않는경우 false로 기본값 채택
  @Column({ type: 'varchar', length: 50 })
  nickname: string;

  @Column({ type: 'varchar', length: 50 })
  grade: string;

  // @CreateDateColumn() 데코레이터
  // MySQL DB가 새로운 row가 추가되는 순간 컴퓨터 서버 시간 자동기록
  @CreateDateColumn()
  createdAt: Date;

  // @UpdateDateColumn() 데코레이터
  // 수정이 발생할 때마다 자동으로 시간 기록
  @UpdateDateColumn()
  updatedAt: Date;
}
