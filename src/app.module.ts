import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { AssetModule } from './asset/asset.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ConfigModule 설정 : 프로젝트 root의 env 파일 읽음
    ConfigModule.forRoot({
      isGlobal: true, // true : 다른 모듈에서 개별임포트 없이 사용가능,
      envFilePath: '.env',
    }),

    // TypeOrmModule 비동기 설정 : env가 먼저 로드된 후 DB연결 해야 하므로 'forRootAsync' 사용
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // ConfigModule 인터페이스에 의존하므로 명시적으로 주입
      inject: [ConfigService], // useFactory 함수 내부에서 env 값을 꺼내 쓸 수 있도록 ConfigService 주입

      // useFactory는 Nest.js가 컨테이넌를 구동할 때 동적으로 인서트 할 객체를 반환하는 팩토리 함수
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // DB 종류
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),

        // __dirname : 현재 파일의 위치를 뜻함
        // 프로젝트 내부의 모든 폴더에서 '.entity.ts'나 'entity.js'로  끝나는 파일들을 스캔 후 테이블로 인식하겠다는 선언
        entities: [__dirname + '/**/*.entity{.ts,.js}'],

        // synchronize가 true이면, entity 코드와 MySQL 데이터베이스의 스키마를 동기화
        // 하지만 서비스 운영(Production) 서버에서는 데이터가 날아갈 수 있으므로 절대 true로 두면 안 되는 속성
        synchronize: true,

        // 터미널 콘솔창에 백엔드가 실제로 MySQL로 던지는 row SQL 쿼리문을 실시간으로 출력해주는 옵션
        logging: true,
      }),
    }),

    UsersModule,

    AssetModule,

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer:MiddlewareConsumer):any {
    consumer
      .apply(LoggerMiddleware) // LoggerMiddleware를 모든 라우팅 경로에 적용
      .forRoutes('*'); // '*' : 모든 라우팅 경로에 적용
  }
}
