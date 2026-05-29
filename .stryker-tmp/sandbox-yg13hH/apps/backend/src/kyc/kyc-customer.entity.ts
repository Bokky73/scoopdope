import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm';
export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';
@Entity('kyc_customers')
export class KycCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    unique: true
  })
  stellarPublicKey: string;
  @Column({
    default: 'none'
  })
  status: KycStatus;
  @Column({
    nullable: true
  })
  providerId: string; // external ID from KYC provider

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}