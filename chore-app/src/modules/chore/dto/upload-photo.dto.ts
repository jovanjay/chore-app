import { IsString } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  photo: string; // Base64 encoded image or URL
}

