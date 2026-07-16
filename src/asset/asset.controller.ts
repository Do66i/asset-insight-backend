import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  async create(@Body() createAssetDto: CreateAssetDto) {
    const result = await this.assetService.create(createAssetDto);
    return {
      success: true,
      message: '자산 등록 성공',
      data: result,
    };
  }

  @Get()
  async findAll() {
    const result = await this.assetService.findAll();
    return {
      success: true,
      message: '전체 자산 목록 조회 성공',
      data: result,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.assetService.findOne(+id);
    return {
      success: true,
      message: '자산 조회 성공',
      data: result,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto) {
    const result = await this.assetService.update(+id, updateAssetDto);
    return {
      success: true,
      message: '자산 정보 수정 성공',
      data: result,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.assetService.remove(+id);
    return {
      success: true,
      message: '자산 삭제 성공',
      data: result,
    };
  }
}
