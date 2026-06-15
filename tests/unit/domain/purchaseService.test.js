const createPurchaseService = require('../../../api/domain/purchaseService');

describe('Purchase Service Domain Layer', () => {
  let dbMock;
  let chainMock;
  let contractMock;
  let purchaseService;

  beforeEach(() => {
    dbMock = {
      getCategoryById: jest.fn(),
    };

    contractMock = {
      mint: jest.fn(),
    };

    chainMock = {
      getTicketContract: jest.fn().mockReturnValue(contractMock),
    };

    purchaseService = createPurchaseService(dbMock, chainMock);
  });

  it('performs off-chain checkout (card purchase) and mints tickets', async () => {
    const category = {
      id: 10,
      event_id: 1,
      name: 'Standard',
      price_eur: 40.00,
      contract_address: '0xcontract'
    };

    dbMock.getCategoryById.mockReturnValue(category);

    const txMock = {
      wait: jest.fn().mockResolvedValue({ hash: '0xtxhash' })
    };
    contractMock.mint.mockResolvedValue(txMock);

    const result = await purchaseService.purchaseWithEur(1, 10, {
      buyer_address: '0xbuyer',
      quantity: 2
    });

    expect(dbMock.getCategoryById).toHaveBeenCalledWith(10);
    expect(chainMock.getTicketContract).toHaveBeenCalledWith('0xcontract');
    expect(contractMock.mint).toHaveBeenCalledWith('0xbuyer', 2n);
    expect(txMock.wait).toHaveBeenCalled();
    expect(result).toEqual({
      tx_hash: '0xtxhash',
      buyer_address: '0xbuyer',
      quantity: 2,
      total_eur: 80.00,
      category_id: 10,
      event_id: 1,
    });
  });

  it('throws error if parameters are invalid', async () => {
    await expect(purchaseService.purchaseWithEur(1, 10, { buyer_address: '', quantity: 2 }))
      .rejects.toThrow('buyer_address and quantity (>=1) are required');

    await expect(purchaseService.purchaseWithEur(1, 10, { buyer_address: '0xbuyer', quantity: 0 }))
      .rejects.toThrow('buyer_address and quantity (>=1) are required');
  });

  it('throws error if category not found', async () => {
    dbMock.getCategoryById.mockReturnValue(null);

    await expect(purchaseService.purchaseWithEur(1, 10, { buyer_address: '0xbuyer', quantity: 1 }))
      .rejects.toThrow('Category not found');
  });

  it('throws error if contract not deployed', async () => {
    dbMock.getCategoryById.mockReturnValue({
      id: 10,
      event_id: 1,
      name: 'Standard',
      price_eur: 40.00,
      contract_address: null
    });

    await expect(purchaseService.purchaseWithEur(1, 10, { buyer_address: '0xbuyer', quantity: 1 }))
      .rejects.toThrow('Contract not yet deployed for this category');
  });
});
