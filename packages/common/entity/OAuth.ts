import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class OAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  accessToken: string;

  @Column()
  accessTokenExpiresAt: Date;

  @Column()
  clientId: string;

  @Column()
  refreshToken: string;

  @Column()
  refreshTokenExpiresAt: Date;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
