import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

export type KycStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type KycDocumentType = 'id_card' | 'passport' | 'drivers_license';

@Entity('kyc_customers')
export class KycCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  stellarPublicKey: string;

  @Column({ default: 'none' })
  status: KycStatus;

  @Column({ nullable: true })
  providerId: string | null;

  /** Encrypted additional identity field data from SEP-0012 submissions */
  @Column({ nullable: true, type: 'text' })
  documentData: string | null;

  /** Type of document uploaded for verification */
  @Column({ nullable: true, type: 'varchar', length: 30 })
  documentType: KycDocumentType | null;

  /** URL/path to the uploaded identity document (ID, passport, license) */
  @Column({ nullable: true, type: 'text' })
  documentUrl: string | null;

  /** URL/path to the uploaded selfie photo */
  @Column({ nullable: true, type: 'text' })
  selfieUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
