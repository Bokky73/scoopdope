import { NotFoundException } from '@nestjs/common';
import { CertificatesService } from './certificates.service';

describe('CertificatesService verification', () => {
  let service: CertificatesService;
  let repo: any;
  let stellarService: any;
  let configService: any;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
    };

    stellarService = {
      getTransactions: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'stellar.network') return 'testnet';
        return undefined;
      }),
    };

    service = new CertificatesService(repo, {} as any, stellarService, configService);
  });

  it('returns a public verification payload with student/course details for a valid certificate', async () => {
    const cert = {
      id: 'cert-123',
      userId: 'user-456',
      courseId: 'course-789',
      certificateHash: 'abc123',
      stellarTransactionId: 'tx-abc',
      status: 'minted',
      revokedAt: null,
      issuedAt: new Date('2024-03-08T12:00:00.000Z'),
      user: { username: 'alice', email: 'alice@example.com' },
      course: { title: 'Blockchain Basics' },
    };

    repo.findOne.mockResolvedValue(cert);
    stellarService.getTransactions.mockResolvedValue([
      { hash: 'tx-abc', successful: true, createdAt: '2024-03-08T12:00:05.000Z' },
    ]);

    await expect(service.verifyById('cert-123')).resolves.toMatchObject({
      certificateId: 'cert-123',
      studentName: 'alice',
      courseName: 'Blockchain Basics',
      status: 'valid',
      verified: true,
      revoked: false,
      transactionHash: 'tx-abc',
    });
  });

  it('marks a revoked certificate as revoked even when the blockchain lookup succeeds', async () => {
    const cert = {
      id: 'cert-333',
      userId: 'user-222',
      courseId: 'course-777',
      certificateHash: 'revokedhash',
      stellarTransactionId: 'tx-revoked',
      status: 'minted',
      revokedAt: new Date('2024-05-11T00:00:00.000Z'),
      issuedAt: new Date('2024-05-01T00:00:00.000Z'),
      user: { username: 'bob', email: 'bob@example.com' },
      course: { title: 'Smart Contracts' },
    };

    repo.findOne.mockResolvedValue(cert);
    stellarService.getTransactions.mockResolvedValue([
      { hash: 'tx-revoked', successful: true, createdAt: '2024-05-01T00:00:01.000Z' },
    ]);

    await expect(service.verifyById('cert-333')).resolves.toMatchObject({
      status: 'revoked',
      verified: false,
      revoked: true,
      studentName: 'bob',
      courseName: 'Smart Contracts',
    });
  });

  it('accepts a Stellar transaction hash as the public identifier', async () => {
    const cert = {
      id: 'cert-444',
      userId: 'user-111',
      courseId: 'course-333',
      certificateHash: 'hash-444',
      stellarTransactionId: 'tx-lookup',
      status: 'minted',
      revokedAt: null,
      issuedAt: new Date('2024-02-01T00:00:00.000Z'),
      user: { username: 'carol', email: 'carol@example.com' },
      course: { title: 'NFT Basics' },
    };

    repo.findOne.mockResolvedValue(cert);
    stellarService.getTransactions.mockResolvedValue([
      { hash: 'tx-lookup', successful: true, createdAt: '2024-02-01T00:00:05.000Z' },
    ]);

    await expect(service.verifyById('tx-lookup')).resolves.toMatchObject({
      certificateId: 'cert-444',
      status: 'valid',
      verified: true,
      transactionHash: 'tx-lookup',
    });
  });

  it('throws when the certificate cannot be found by id or hash', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.verifyById('missing-cert')).rejects.toBeInstanceOf(NotFoundException);
  });
});
