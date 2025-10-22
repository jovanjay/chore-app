import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { KidsService } from './kids.service';
import { CreateKidDto } from './dto/create-kid.dto';
import { UpdateKidDto } from './dto/update-kid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('kids')
@UseGuards(JwtAuthGuard)
export class KidsController {
  constructor(private readonly kidsService: KidsService) {}

  @Post()
  create(@Body() createKidDto: CreateKidDto, @Request() req) {
    return this.kidsService.create(createKidDto, req.user.sub);
  }

  @Get()
  findAll(@Request() req) {
    return this.kidsService.findAll(req.user.sub);
  }

  @Get('me/profile')
  getMyProfile(@Request() req) {
    return this.kidsService.findMyProfile(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.kidsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateKidDto: UpdateKidDto,
    @Request() req,
  ) {
    return this.kidsService.update(id, updateKidDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.kidsService.remove(id, req.user.sub);
  }
}

