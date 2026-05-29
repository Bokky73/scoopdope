import { StellarController } from './stellar.controller';

describe('StellarController', () => {
  const mockService = {
    getAccountBalance: jest.fn(),
  };
  let controller: StellarController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new StellarController(mockService as any);
  });

  it('getBalance should return account balances', async () => {
    const balances = [{ asset_type: 'native', balance: '50' }];
    mockService.getAccountBalance.mockResolvedValue(balances);

    await expect(controller.getBalance('GABC')).resolves.toEqual(balances);
    expect(mockService.getAccountBalance).toHaveBeenCalledWith('GABC');
  });
});
