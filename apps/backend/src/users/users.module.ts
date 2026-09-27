import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController, AdminUsersController } from './users.controller';
import { StellarModule } from '../stellar/stellar.module';
import { AuditModule } from '../audit/audit.module';
import { Post } from '../forums/post.entity';
import { Review } from '../courses/review.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Review, Enrollment, Course]),
    forwardRef(() => StellarModule),
    AuditModule,
  ],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
