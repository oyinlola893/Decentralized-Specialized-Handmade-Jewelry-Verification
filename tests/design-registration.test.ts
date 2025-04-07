import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity VM environment
const mockClarity = {
  txSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  blockHeight: 100,
  designs: new Map(),
  designIdCounter: 0,
  
  // Mock contract functions
  registerDesign(name, description, imageUri, materials) {
    const newId = this.designIdCounter + 1;
    this.designIdCounter = newId;
    
    this.designs.set(newId, {
      name,
      description,
      artisan: this.txSender,
      'image-uri': imageUri,
      'registration-date': this.blockHeight,
      materials
    });
    
    return { ok: true };
  },
  
  getDesignDetails(designId) {
    return this.designs.get(designId);
  },
  
  getDesignCount() {
    return this.designIdCounter;
  },
  
  transferAdmin(newAdmin) {
    if (this.txSender !== this.admin) {
      return { err: 100 };
    }
    
    this.admin = newAdmin;
    return { ok: true };
  }
};

describe('Design Registration Contract', () => {
  beforeEach(() => {
    // Reset the mock state
    mockClarity.txSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockClarity.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockClarity.designs = new Map();
    mockClarity.designIdCounter = 0;
    mockClarity.blockHeight = 100;
  });
  
  it('should register a new design', () => {
    const materials = [1, 2]; // Material IDs
    const result = mockClarity.registerDesign(
        'Celestial Pendant',
        'A moon and stars pendant with gold and diamonds',
        'ipfs://QmXyZ123456789',
        materials
    );
    expect(result).toEqual({ ok: true });
    
    const designData = mockClarity.getDesignDetails(1);
    expect(designData).toEqual({
      name: 'Celestial Pendant',
      description: 'A moon and stars pendant with gold and diamonds',
      artisan: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      'image-uri': 'ipfs://QmXyZ123456789',
      'registration-date': 100,
      materials: [1, 2]
    });
  });
  
  it('should increment design ID counter', () => {
    mockClarity.registerDesign(
        'Celestial Pendant',
        'A moon and stars pendant with gold and diamonds',
        'ipfs://QmXyZ123456789',
        [1, 2]
    );
    
    mockClarity.registerDesign(
        'Floral Ring',
        'A rose-inspired ring with rubies',
        'ipfs://QmABC987654321',
        [3, 4]
    );
    
    expect(mockClarity.getDesignCount()).toBe(2);
    
    const design1 = mockClarity.getDesignDetails(1);
    const design2 = mockClarity.getDesignDetails(2);
    
    expect(design1.name).toBe('Celestial Pendant');
    expect(design2.name).toBe('Floral Ring');
  });
  
  it('should record the artisan as the tx-sender', () => {
    mockClarity.txSender = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    
    mockClarity.registerDesign(
        'Ocean Bracelet',
        'Wave-inspired bracelet with sapphires',
        'ipfs://QmDEF123456789',
        [5, 6]
    );
    
    const designData = mockClarity.getDesignDetails(1);
    expect(designData.artisan).toBe('ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG');
  });
  
  it('should transfer admin rights', () => {
    const newAdmin = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const result = mockClarity.transferAdmin(newAdmin);
    expect(result).toEqual({ ok: true });
    expect(mockClarity.admin).toBe(newAdmin);
  });
});
