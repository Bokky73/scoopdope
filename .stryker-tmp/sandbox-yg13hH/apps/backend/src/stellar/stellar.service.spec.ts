import { StellarService } from './stellar.service';
import { Horizon, Keypair, TransactionBuilder, Operation } from '@stellar/stellar-sdk';

type MockServer = {
  loadAccount: jest.Mock;
  submitTransaction: jest.Mock;
};

type MockTx = {
  sign: jest.Mock;
};

jest.mock('@stellar/stellar-sdk', () => {
  const actual = jest.requireActual('@stellar/stellar-sdk');
  return {
    ...actual,
    Horizon: {
      Server: jest.fn(),
    },
    Keypair: {
      fromSecret: jest.fn(),
    },
    Networks: {
      TESTNET: 'TESTNET',
      PUBLIC: 'PUBLIC',
    },
    TransactionBuilder: jest.fn(),
    BASE_FEE: 100,
    Operation: {
      manageData: jest.fn(),
    },
  };
});

describe('StellarService', () => {
  let service: StellarService;
  let mockServer: MockServer;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STELLAR_NETWORK = 'testnet';
    process.env.STELLAR_SECRET_KEY = 'SXXXX';

    mockServer = {
      loadAccount: jest.fn(),
      submitTransaction: jest.fn(),
    };

    (Horizon.Server as jest.Mock).mockImplementation(() => mockServer);

    service = new StellarService();
  });

  it('getAccountBalance should return balances from horizon account', async () => {
    const balances = [{ asset_type: 'native', balance: '100' }];
    mockServer.loadAccount.mockResolvedValue({ balances });

    await expect(service.getAccountBalance('GDEST')).resolves.toEqual(balances);
    expect(mockServer.loadAccount).toHaveBeenCalledWith('GDEST');
  });

  it('issueCredential should submit a transaction and return hash', async () => {
    const issuerKeypair = {
      publicKey: jest.fn().mockReturnValue('GISSUER'),
    };
    (Keypair.fromSecret as jest.Mock).mockReturnValue(issuerKeypair);

    const issuerAccount = { accountId: 'GISSUER' };
    mockServer.loadAccount.mockResolvedValue(issuerAccount);

    const signMock = jest.fn();
    const builtTx = { sign: signMock } as MockTx;

    const addOperation = jest.fn().mockReturnThis();
    const setTimeout = jest.fn().mockReturnThis();
    const build = jest.fn().mockReturnValue(builtTx);

    (TransactionBuilder as unknown as jest.Mock).mockImplementation(() => ({
      addOperation,
      setTimeout,
      build,
    }));

    (Operation.manageData as jest.Mock).mockImplementation((input) => input);

    mockServer.submitTransaction.mockResolvedValue({ hash: 'FAKE_HASH' });

    const result = await service.issueCredential('GDEST', 'course-1');

    expect(result).toBe('FAKE_HASH');
    expect(mockServer.loadAccount).toHaveBeenCalledWith('GISSUER');
    expect(TransactionBuilder).toHaveBeenCalledWith(issuerAccount, {
      fee: 100,
      networkPassphrase: 'TESTNET',
    });
    expect(addOperation).toHaveBeenCalledWith({
      name: 'scoopdope:credential:course-1',
      value: 'GDEST',
    });
    expect(setTimeout).toHaveBeenCalledWith(30);
    expect(build).toHaveBeenCalled();
    expect(signMock).toHaveBeenCalledWith(issuerKeypair);
    expect(mockServer.submitTransaction).toHaveBeenCalledWith(builtTx);
  });
});
