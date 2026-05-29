import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { User } from '../src/users/user.entity';
import { RefreshToken } from '../src/auth/refresh-token.entity';
import { PasswordResetToken } from '../src/auth/password-reset-token.entity';
import { SanitizationPipe } from '../src/common/pipes/sanitization.pipe';

describe('Input Sanitization (E2E)', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, RefreshToken, PasswordResetToken],
          synchronize: true,
          dropSchema: true,
        }),
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
      new SanitizationPipe(),
    );
    await app.init();

    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should strip HTML tags and trim whitespace from bio', async () => {
    // 1. Create a user
    const email = 'sanitization@example.com';
    const password = 'password123';
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ email, password })
      .expect(201);

    const user = await userRepo.findOne({ where: { email } });
    await userRepo.save({ ...user!, isVerified: true });

    // 2. Login
    const loginResp = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email, password })
      .expect(201);
    const token = loginResp.body.access_token;

    // 3. Update profile with malicious input
    const maliciousBio = '  Check this <script>alert("xss")</script> out! <b>Bold</b> and <i>Italic</i>.  ';
    const expectedBio = 'Check this  out! Bold and Italic.';

    const updateResp = await request(app.getHttpServer())
      .patch(`/v1/users/${user!.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: maliciousBio })
      .expect(200);

    // 4. Assert response is sanitized
    expect(updateResp.body.bio).toBe(expectedBio);

    // 5. Assert database is sanitized
    const updatedUser = await userRepo.findOne({ where: { email } });
    expect(updatedUser!.bio).toBe(expectedBio);
  });

  it('should trim username', async () => {
    const email = 'trim-test@example.com';
    const password = 'password123';
    await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ email, password })
      .expect(201);

    const user = await userRepo.findOne({ where: { email } });
    await userRepo.save({ ...user!, isVerified: true });

    const loginResp = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email, password })
      .expect(201);
    const token = loginResp.body.access_token;

    const usernameWithSpaces = '  cooluser  ';
    const updateResp = await request(app.getHttpServer())
      .patch(`/v1/users/${user!.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ username: usernameWithSpaces })
      .expect(200);

    expect(updateResp.body.username).toBe('cooluser');
  });
});
