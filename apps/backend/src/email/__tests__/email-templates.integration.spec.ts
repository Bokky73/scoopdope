import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { EmailService } from '../../src/email/email.service';
import { emailTemplates } from '../../src/email/email.templates';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailQueue } from '../../src/email/email-queue.entity';
import { EmailPreference } from '../../src/email/email-preference.entity';
import { ConfigService } from '@nestjs/config';

describe('Email Templates and Service (Integration)', () => {
  let app: INestApplication;
  let emailService: EmailService;
  let configService: ConfigService;

  const mockEmailQueueRepository = {
    save: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  const mockEmailPreferenceRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, any> = {
        'frontend.url': 'http://localhost:3001',
        'email.logoUrl': 'http://localhost:3000/logo.png',
        'mail.enabled': false, // Don't actually send emails in tests
      };
      return config[key];
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getRepositoryToken(EmailQueue),
          useValue: mockEmailQueueRepository,
        },
        {
          provide: getRepositoryToken(EmailPreference),
          useValue: mockEmailPreferenceRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    emailService = moduleFixture.get<EmailService>(EmailService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Email Templates', () => {
    it('should render welcome email template', () => {
      const template = emailTemplates.welcome({
        userName: 'Alice',
        verificationUrl: 'http://localhost:3001/verify?token=123',
        logo: 'http://localhost:3000/logo.png',
      });

      expect(template.subject).toBe('Welcome to scoopdope - Verify Your Email');
      expect(template.html).toContain('Welcome to scoopdope');
      expect(template.html).toContain('Alice');
      expect(template.html).toContain('http://localhost:3001/verify?token=123');
      expect(template.text).toBeDefined();
      expect(template.text).toContain('Welcome to scoopdope');
    });

    it('should render password reset email template', () => {
      const template = emailTemplates.passwordReset({
        userName: 'Bob',
        resetUrl: 'http://localhost:3001/reset?token=456',
        expiresIn: '1 hour',
        logo: 'http://localhost:3000/logo.png',
      });

      expect(template.subject).toBe('Reset Your scoopdope Password');
      expect(template.html).toContain('Reset Your Password');
      expect(template.html).toContain('Bob');
      expect(template.html).toContain('1 hour');
      expect(template.text).toBeDefined();
      expect(template.text).toContain('Reset Your Password');
    });

    it('should render certificate issued email template', () => {
      const template = emailTemplates.certificateIssued({
        userName: 'Charlie',
        courseTitle: 'Introduction to Stellar',
        certificateUrl: 'http://localhost:3001/certificates/789',
        txHash: 'abc123def456',
        logo: 'http://localhost:3000/logo.png',
      });

      expect(template.subject).toContain('Introduction to Stellar');
      expect(template.html).toContain('Certificate Issued');
      expect(template.html).toContain('Charlie');
      expect(template.html).toContain('abc123def456');
      expect(template.text).toBeDefined();
    });

    it('should include plain text version for all templates', () => {
      const templates = [
        emailTemplates.welcome({
          userName: 'Alice',
          verificationUrl: 'http://example.com',
        }),
        emailTemplates.passwordReset({
          userName: 'Bob',
          resetUrl: 'http://example.com',
          expiresIn: '1 hour',
        }),
        emailTemplates.certificateIssued({
          userName: 'Charlie',
          courseTitle: 'Course',
          certificateUrl: 'http://example.com',
          txHash: 'hash123',
        }),
      ];

      templates.forEach((template) => {
        expect(template.text).toBeDefined();
        expect(template.text.length).toBeGreaterThan(0);
        expect(template.text).not.toContain('<');
        expect(template.text).not.toContain('>');
      });
    });

    it('should render enrollment email template', () => {
      const template = emailTemplates.enrollment({
        userName: 'Dave',
        courseTitle: 'Soroban Basics',
        courseUrl: 'http://localhost:3001/courses/101',
        unsubscribeUrl: 'http://localhost:3001/unsubscribe',
      });

      expect(template.subject).toContain('Soroban Basics');
      expect(template.html).toContain('Dave');
      expect(template.html).toContain('enrolled');
    });

    it('should render completion email template', () => {
      const template = emailTemplates.completion({
        userName: 'Eve',
        courseTitle: 'Advanced Soroban',
        credentialUrl: 'http://localhost:3001/credentials',
        unsubscribeUrl: 'http://localhost:3001/unsubscribe',
      });

      expect(template.subject).toContain('Advanced Soroban');
      expect(template.html).toContain('Eve');
      expect(template.html).toContain('Congratulations');
    });
  });

  describe('Email Template Variables', () => {
    it('should properly escape and substitute user names', () => {
      const template = emailTemplates.welcome({
        userName: 'John O\'Brien',
        verificationUrl: 'http://example.com',
      });

      expect(template.html).toContain('John O\'Brien');
    });

    it('should properly handle URLs in templates', () => {
      const verificationUrl = 'http://localhost:3001/auth/verify?token=abc123&email=test@example.com';

      const template = emailTemplates.welcome({
        userName: 'User',
        verificationUrl,
      });

      expect(template.html).toContain(verificationUrl);
    });

    it('should handle special characters in course titles', () => {
      const template = emailTemplates.completion({
        userName: 'User',
        courseTitle: 'C++ & Rust Programming <Advanced>',
        credentialUrl: 'http://example.com',
        unsubscribeUrl: 'http://example.com',
      });

      // Should contain the title, either escaped or in a safe way
      expect(template.html).toContain('C++');
    });
  });

  describe('Email Service Integration', () => {
    it('should queue welcome email on user registration', async () => {
      mockEmailQueueRepository.create.mockReturnValue({
        to: 'alice@test.com',
        subject: 'Welcome to scoopdope - Verify Your Email',
        html: '<div>Welcome</div>',
      });

      mockEmailQueueRepository.save.mockResolvedValue({
        id: '1',
        to: 'alice@test.com',
        subject: 'Welcome to scoopdope - Verify Your Email',
        html: '<div>Welcome</div>',
      });

      const template = emailTemplates.welcome({
        userName: 'Alice',
        verificationUrl: 'http://localhost:3001/verify?token=123',
      });

      await emailService.enqueue('alice@test.com', template.subject, template.html);

      expect(mockEmailQueueRepository.create).toHaveBeenCalled();
      expect(mockEmailQueueRepository.save).toHaveBeenCalled();
    });

    it('should queue password reset email', async () => {
      const template = emailTemplates.passwordReset({
        userName: 'Bob',
        resetUrl: 'http://localhost:3001/reset?token=456',
        expiresIn: '1 hour',
      });

      mockEmailQueueRepository.save.mockResolvedValue({
        id: '2',
        to: 'bob@test.com',
        subject: template.subject,
        html: template.html,
      });

      await emailService.enqueue('bob@test.com', template.subject, template.html);

      expect(mockEmailQueueRepository.save).toHaveBeenCalled();
    });
  });

  describe('Email Template Styling', () => {
    it('should include proper styling in HTML templates', () => {
      const template = emailTemplates.welcome({
        userName: 'User',
        verificationUrl: 'http://example.com',
      });

      expect(template.html).toContain('style=');
      expect(template.html).toContain('font-family');
      expect(template.html).toContain('padding');
      expect(template.html).toContain('background');
    });

    it('should have proper button styling', () => {
      const template = emailTemplates.passwordReset({
        userName: 'User',
        resetUrl: 'http://example.com',
        expiresIn: '1 hour',
      });

      expect(template.html).toMatch(/style="[^"]*background:[^"]*color:\s*white/);
    });

    it('should use consistent colors across templates', () => {
      const templates = [
        emailTemplates.welcome({
          userName: 'User',
          verificationUrl: 'http://example.com',
        }),
        emailTemplates.passwordReset({
          userName: 'User',
          resetUrl: 'http://example.com',
          expiresIn: '1 hour',
        }),
      ];

      // Both should have primary color button
      templates.forEach((template) => {
        expect(template.html).toMatch(/background:\s*#[0-9a-f]+/i);
      });
    });
  });

  describe('Email Template Rendering Edge Cases', () => {
    it('should handle missing optional parameters', () => {
      const template = emailTemplates.welcome({
        userName: 'User',
        verificationUrl: 'http://example.com',
        // logo not provided
      });

      expect(template.subject).toBeDefined();
      expect(template.html).toBeDefined();
      expect(template.text).toBeDefined();
    });

    it('should handle very long user names', () => {
      const longName = 'A'.repeat(100);
      const template = emailTemplates.welcome({
        userName: longName,
        verificationUrl: 'http://example.com',
      });

      expect(template.html).toContain(longName);
    });

    it('should handle very long course titles', () => {
      const longTitle = 'Advanced Blockchain Development with Stellar and Soroban - '.repeat(5);
      const template = emailTemplates.completion({
        userName: 'User',
        courseTitle: longTitle,
        credentialUrl: 'http://example.com',
        unsubscribeUrl: 'http://example.com',
      });

      expect(template.html).toContain('Advanced Blockchain Development');
    });
  });
});
