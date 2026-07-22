import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @UseGuards(AuthGuard('jwt')) // 로그인한 사람만 자산 등록 가능
  @Post()
  async create(@Body() createAssetDto: CreateAssetDto) {
    const result = await this.assetService.create(createAssetDto);
    return {
      success: true,
      message: '자산 등록 성공',
      data: result,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    const result = await this.assetService.findAll();
    return {
      success: true,
      message: '전체 자산 목록 조회 성공',
      data: result,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.assetService.findOne(+id);
    return {
      success: true,
      message: '자산 조회 성공',
      data: result,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto, @CurrentUser() user: { id: number; userId: string }) {
    // 소유자 확인 — 이 자산의 주인이 로그인한 사람이 맞는지 먼저 조회해서 검증
    const asset = await this.assetService.findOne(+id);
    if (asset.user.id !== user.id) {
      throw new ForbiddenException('본인 소유 자산만 수정할 수 있습니다.');
    }
    const result = await this.assetService.update(+id, updateAssetDto);
    return {
      success: true,
      message: '자산 정보 수정 성공',
      data: result,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: { id: number; userId: string }) {
    // 소유자 확인 — 이 자산의 주인이 로그인한 사람이 맞는지 먼저 조회해서 검증
    const asset = await this.assetService.findOne(+id);
    if (asset.user.id !== user.id) {
      throw new ForbiddenException('본인 소유 자산만 삭제할 수 있습니다.');
    }
    const result = await this.assetService.remove(+id);
    return {
      success: true,
      message: '자산 삭제 성공',
      data: result,
    };
  }
}
