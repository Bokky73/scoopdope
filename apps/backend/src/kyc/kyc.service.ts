import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../common/encryption.service';
import { KycCustomer, KycStatus } from './kyc-customer.entity';
import { SubmitKycDocumentsDto } from './dto/submit-kyc-documents.dto';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);
  private readonly apiKey: string;

  constructor(
    @InjectRepository(KycCustomer) private repo: Repository<KycCustomer>,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
  ) {
    this.apiKey = this.configService.get<string>('kyc.providerApiKey') ?? '';
  }

  async getStatus(stellarPublicKey: string): Promise<KycCustomer> {
    const customer = await this.repo.findOne({ where: { stellarPublicKey } });
    if (!customer) {
      return Object.assign(new KycCustomer(), { stellarPublicKey, status: 'none' as KycStatus });
    }
    return this.decryptCustomer(customer);
  }

  async submitDocuments(dto: SubmitKycDocumentsDto): Promise<KycCustomer> {
    let customer = await this.repo.findOne({ where: { stellarPublicKey: dto.stellarPublicKey } });

    if (!customer) {
      customer = this.repo.create({
        stellarPublicKey: dto.stellarPublicKey,
        status: 'pending',
      });
    } else {
      customer.status = 'pending';
    }

    customer.documentType = dto.documentType;
    customer.documentUrl = dto.documentUrl;
    customer.selfieUrl = dto.selfieUrl ?? null;

    // Submit to KYC provider if configured
    if (this.apiKey) {
      try {
        const res = await fetch('https://api.synaps.io/v4/individual/session', {
          method: 'POST',
          headers: {
            'Client-Id': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alias: dto.stellarPublicKey,
            document_type: dto.documentType,
            document_url: dto.documentUrl,
            selfie_url: dto.selfieUrl,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const rawProviderId = data.session_id ?? data.id ?? null;
          customer.providerId = rawProviderId
            ? this.encryptionService.encrypt(String(rawProviderId))
            : null;
        } else {
          this.logger.warn(
            `KYC provider returned ${res.status} for ${dto.stellarPublicKey}`
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`KYC provider request failed: ${message}`);
      }
    }

    return this.repo.save(customer);
  }

  private decryptCustomer(customer: KycCustomer): KycCustomer {
    if (customer.providerId) {
      try {
        customer.providerId = this.encryptionService.decrypt(customer.providerId);
      } catch {
        this.logger.warn(`Failed to decrypt providerId for ${customer.stellarPublicKey}`);
      }
    }
    if (customer.documentData) {
      try {
        customer.documentData = this.encryptionService.decrypt(customer.documentData);
      } catch {
        this.logger.warn(`Failed to decrypt documentData for ${customer.stellarPublicKey}`);
      }
    }
    return customer;
  }

  async upsertCustomer(
    stellarPublicKey: string,
    fields: Record<string, string>
  ): Promise<KycCustomer> {
    let customer = await this.repo.findOne({ where: { stellarPublicKey } });

    if (!customer) {
      customer = this.repo.create({ stellarPublicKey, status: 'pending' });
    } else {
      customer.status = 'pending';
    }

    // Submit to KYC provider
    if (this.apiKey) {
      try {
        const res = await fetch('https://api.synaps.io/v4/individual/session', {
          method: 'POST',
          headers: {
            'Client-Id': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ alias: stellarPublicKey, ...fields }),
        });
        if (res.ok) {
          const data = await res.json();
          const rawProviderId = data.session_id ?? data.id ?? null;
          customer.providerId = rawProviderId
            ? this.encryptionService.encrypt(String(rawProviderId))
            : null;
        } else {
          this.logger.warn(`KYC provider returned ${res.status} for ${stellarPublicKey}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`KYC provider request failed: ${message}`);
      }
    }

    return this.repo.save(customer);
  }

  /** Called by the webhook endpoint when the provider sends a status update */
  async handleWebhook(payload: {
    alias?: string;
    session_id?: string;
    status: string;
  }): Promise<void> {
    if (!payload.alias) {
      this.logger.warn(`Webhook received without alias: ${JSON.stringify(payload)}`);
      return;
    }

    const customer = await this.repo.findOne({ where: { stellarPublicKey: payload.alias } });
    if (!customer) {
      this.logger.warn(`Webhook received for unknown customer: ${payload.alias}`);
      return;
    }

    const statusMap: Record<string, KycStatus> = {
      APPROVED: 'approved',
      VERIFIED: 'approved',
      REJECTED: 'rejected',
      DECLINED: 'rejected',
      PENDING: 'pending',
    };

    customer.status = statusMap[payload.status?.toUpperCase()] ?? 'pending';
    await this.repo.save(customer);
    this.logger.log(`KYC status updated: ${customer.stellarPublicKey} → ${customer.status}`);
  }

  async isApproved(stellarPublicKey: string): Promise<boolean> {
    const customer = await this.repo.findOne({ where: { stellarPublicKey } });
    return customer?.status === 'approved';
  }
}
