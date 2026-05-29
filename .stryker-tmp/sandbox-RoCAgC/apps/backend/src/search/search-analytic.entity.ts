// @ts-nocheck
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity('search_analytics')
export class SearchAnalytic {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  query: string;
  @Column({
    nullable: true
  })
  userId: string | null;
  @Column({
    default: 0
  })
  resultsCount: number;
  @Column({
    nullable: true
  })
  clickedResultId: string | null;
  @Column({
    nullable: true
  })
  clickedResultType: string | null;
  @CreateDateColumn()
  createdAt: Date;
}