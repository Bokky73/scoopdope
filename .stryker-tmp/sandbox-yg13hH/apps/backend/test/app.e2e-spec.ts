import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { CoursesModule } from '../src/courses/courses.module';
import { UsersModule } from '../src/users/users.module';
import { StellarModule } from '../src/stellar/stellar.module';
import { User } from '../src/users/user.entity';
import { Course } from '../src/courses/course.entity';
import { RefreshToken } from '../src/auth/refresh-token.entity';
import { PasswordResetToken } from '../src/auth/password-reset-token.entity';

describe('App E2E', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    process.env.EMAIL_ENABLED = 'false';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, Course, RefreshToken, PasswordResetToken],
          synchronize: true,
          dropSchema: true,
        }),
        AuthModule,
        CoursesModule,
        UsersModule,
        StellarModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  it('register -> login -> courses flow', async () => {
    const email = 'e2e-register@example.com';
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    const user = await userRepo.findOne({ where: { email } });
    expect(user).toBeDefined();

    await userRepo.save({ ...user!, isVerified: true });

    const loginResp = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    expect(loginResp.body.access_token).toBeDefined();

    await request(app.getHttpServer())
      .get('/courses')
      .set('Authorization', `Bearer ${loginResp.body.access_token}`)
      .expect(200);
  });

  it('protected route returns 401 without token', async () => {
    await request(app.getHttpServer()).get('/users/admin-only').expect(401);
  });

  it('role guard returns 403 for insufficient role', async () => {
    const email = 'student-role@example.com';
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password })
      .expect(201);

    const user = await userRepo.findOne({ where: { email } });
    await userRepo.save({ ...user!, isVerified: true, role: 'student' });

    const loginResp = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    await request(app.getHttpServer())
      .get('/users/admin-only')
      .set('Authorization', `Bearer ${loginResp.body.access_token}`)
      .expect(403);
  });
});
