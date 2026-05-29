import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('ab_test_assignments')
export class AbTestAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @Column()
  experimentName: string;
  @Column({
    type: 'enum',
    enum: ['control', 'variant'],
    default: 'control'
  })
  variant: 'control' | 'variant';
  @Column({
    type: 'float',
    nullable: true
  })
  outcomeScore: number;
  @CreateDateColumn()
  createdAt: Date;
}