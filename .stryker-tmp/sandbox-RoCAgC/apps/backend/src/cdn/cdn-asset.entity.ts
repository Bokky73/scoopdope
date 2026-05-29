// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lesson } from '../courses/lesson.entity';
export enum ContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  IMAGE = 'image',
  AUDIO = 'audio',
}
@Entity('cdn_assets')
export class CdnAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  lessonId: string;
  @ManyToOne(() => Lesson, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'lessonId'
  })
  lesson: Lesson;
  @Column()
  fileName: string;
  @Column()
  cdnUrl: string;
  @Column({
    type: 'enum',
    enum: ContentType
  })
  contentType: ContentType;
  @Column({
    type: 'bigint'
  })
  fileSize: number;
  @Column({
    nullable: true
  })
  duration: number;
  @Column({
    default: false
  })
  isTranscoded: boolean;
  @Column('simple-array', {
    nullable: true
  })
  availableBitrates: string[];
  @Column({
    nullable: true
  })
  thumbnailUrl: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}