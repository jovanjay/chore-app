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
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChoreService } from './chore.service';
import { CreateChoreDto } from './dto/create-chore.dto';
import { UpdateChoreDto } from './dto/update-chore.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { AssignKidsDto } from './dto/assign-kids.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chores')
@UseGuards(JwtAuthGuard)
export class ChoreController {
  constructor(private readonly choreService: ChoreService) {}

  // Parent creates a chore
  @Post()
  create(@Body() createChoreDto: CreateChoreDto, @Request() req) {
    return this.choreService.create(createChoreDto, req.user.sub);
  }

  // Get all chores (parent or kid)
  @Get()
  findAll(@Request() req) {
    return this.choreService.findAll(req.user.sub);
  }

  // Get a specific chore
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.choreService.findOne(id, req.user.sub);
  }

  // Parent updates chore details
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChoreDto: UpdateChoreDto,
    @Request() req,
  ) {
    return this.choreService.update(id, updateChoreDto, req.user.sub);
  }

  // Change chore status (parent or kid)
  @Put(':id/status')
  changeStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeStatusDto,
    @Request() req,
  ) {
    return this.choreService.changeStatus(id, changeStatusDto, req.user.sub);
  }

  // Kid uploads photo proof
  @Put(':id/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Photo file is required');
    }

    // Validate file type (images only)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.',
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    return this.choreService.uploadPhoto(id, file, req.user.sub);
  }

  // Parent assigns kids to chore
  @Put(':id/assign')
  assignKids(
    @Param('id') id: string,
    @Body() assignKidsDto: AssignKidsDto,
    @Request() req,
  ) {
    return this.choreService.assignKids(id, assignKidsDto, req.user.sub);
  }

  // Parent unassigns a kid from chore
  @Delete(':id/assign/:kidId')
  unassignKid(
    @Param('id') id: string,
    @Param('kidId') kidId: string,
    @Request() req,
  ) {
    return this.choreService.unassignKid(id, kidId, req.user.sub);
  }

  // Parent deletes chore
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.choreService.remove(id, req.user.sub);
  }
}

