import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { Asset } from './entities/asset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]), //note: Asset 리포지토리는 이 모듈에서 직접 등록
    UsersModule, //note: User 리포지토리는 UsersModule로부터 주입받음
  ],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
