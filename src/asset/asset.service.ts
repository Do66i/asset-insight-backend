import { ConflictException, Injectable } from '@nestjs/common';
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
    const { name, userId } = createAssetDto;

    const targetUser = await this.userRepository.findOne({ where: { userId } });

    if (!targetUser) {
      this.throwConflict({
        message: '존재하지 않는 유저입니다.',
      });
    }

    const newAsset = this.assetRepository.create({
      name,
      user: targetUser,
    });

    return await this.assetRepository.save(newAsset);
  }

  findAll() {
    return `This action returns all asset`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
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
