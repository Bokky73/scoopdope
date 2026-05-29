import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
export enum SecretType {
  JWT_SIGNING_KEY = 'jwt_signing_key',
  DATABASE_PASSWORD = 'database_password',
  API_KEY = 'api_key',
  STELLAR_KEY = 'stellar_key',
}
@Entity('secret_rotations')
export class SecretRotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  secretType: string;
  @Column({
    nullable: true
  })
  identifier: string | null; // e.g., API key ID, user ID

  @Column()
  rotatedAt: Date;
  @Column({
    nullable: true
  })
  rotatedBy: string | null; // user ID who triggered rotation

  @Column({
    default: false
  })
  automated: boolean;
  @CreateDateColumn()
  createdAt: Date;
}