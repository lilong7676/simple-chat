export interface UserDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  description?: string;
  isActive: boolean;
  created: Date;
  updated: Date;
  deleted: Date;
}

export interface CreateUserDto {
  name: string;
  password: string;
  email?: string;
  phone?: string;
  avatar?: string;
  description?: string;
}
