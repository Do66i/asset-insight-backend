import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Asset } from './entities/asset.entity';
import { Repository } from 'typeorm';
import { excludePassword } from '../common/utils/exclude-password.util';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>, // asset repo
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // user repo (유저 검증)
  ) {}

  // userId는 더 이상 DTO(요청 body)가 아니라 컨트롤러가 토큰에서 뽑아 별도로 넘겨줌 (신뢰 문제 해결)
  async create(createAssetDto: CreateAssetDto, userId: string): Promise<Asset> {
    const { name, quantity, avgPrice, category } = createAssetDto;

    const targetUser = await this.userRepository.findOne({ where: { userId } });

    if (!targetUser) {
      throw new NotFoundException('존재하지 않는 유저입니다.'); // throwConflict(409) → NotFoundException(404)로 교체
    }

    const newAsset = this.assetRepository.create({
      name,
      quantity,
      avgPrice,
      category,
      user: targetUser,
    });

    const savedAsset = await this.assetRepository.save(newAsset);
    // 응답에 user 관계가 포함되므로, 비밀번호(해시 포함) 노출 방지
    return { ...savedAsset, user: excludePassword(savedAsset.user) } as Asset;
  }

  async findAll(): Promise<Asset[]> {
    return this.assetRepository.find();
  }

  async findOne(id: number): Promise<Asset> {
    const asset = await this.findAssetOrFail(id);
    return this.excludeUserPassword(asset);
  }

  async update(id: number, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findAssetOrFail(id);
    const updatedAsset = await this.assetRepository.save({
      ...asset,
      ...updateAssetDto,
    });

    return this.excludeUserPassword(updatedAsset);
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

  // 응답용: user 관계에서 비밀번호(해시 포함) 제외한 자산 반환
  // findOne, update, remove가 최종적으로 클라이언트에 내보낼 때 이걸 거침
  private excludeUserPassword(asset: Asset): Asset {
    return { ...asset, user: excludePassword(asset.user) } as Asset;
  }
}
