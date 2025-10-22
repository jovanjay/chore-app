export class KidResponseDto {
  id: string;
  name: string;
  email: string;
  password?: string; // Only included when creating a new kid
  dateOfBirth?: Date;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
  parentId: string;
  userId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

