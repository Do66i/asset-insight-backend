import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Asset } from './entities/asset.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>, // asset repo
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // user repo (유저 검증)
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const { userId, name, quantity, avgPrice, category } = createAssetDto;

    const targetUser = await this.userRepository.findOne({ where: { userId } });

    if (!targetUser) {
      this.throwConflict({
        message: '존재하지 않는 유저입니다.',
      });
    }

    const newAsset = this.assetRepository.create({
      name,
      quantity,
      avgPrice,
      category,
      user: targetUser,
    });

    return await this.assetRepository.save(newAsset);
  }

  async findAll(): Promise<Asset[]> {
    return this.assetRepository.find();
  }

  async findOne(id: number): Promise<Asset> {
    return this.findAssetOrFail(id);
  }

  async update(id: number, updateAssetDto: UpdateAssetDto) {
    const asset = this.findAssetOrFail(id);
    const updatedAsset = await this.assetRepository.save({
      ...asset,
      ...updateAssetDto,
    });

    return updatedAsset;
  }

  async remove(id: number): Promise<{ id: number }> {
    const asset = await this.findAssetOrFail(id);

    await this.assetRepository.remove(asset);

    return { id };
  }

  // 내부 전용: ID로 자산 엔티티 원본 조회
  // update, remove에서도 재사용 — 존재 확인 + 엔티티 전체 필요
  private async findAssetOrFail(id: number): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ where: { id }, relations: { user: true } });

    if (!asset) {
      throw new NotFoundException(`존재하지 않는 자산입니다. (id: ${id})`);
    }

    return asset;
  }

  private throwConflict(customFields: { message: string }): never {
    const base = new ConflictException().getResponse() as object;
    console.log('>>>>>>>', new ConflictException().getResponse());
    throw new ConflictException({
      ...base,
      success: false,
      ...customFields,
    });
  }
}
