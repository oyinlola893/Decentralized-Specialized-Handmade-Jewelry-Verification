import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity VM environment
const mockClarity = {
  txSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  blockHeight: 100,
  materials: new Map(),
  materialIdCounter: 0,
  
  // Mock contract functions
  certifyMaterial(name, type, purity, origin) {
    if (this.txSender !== this.admin) {
      return { err: 100 };
    }
    
    const newId = this.materialIdCounter + 1;
    this.materialIdCounter = newId;
    
    this.materials.set(newId, {
      name,
      type,
      purity,
      origin,
      'certification-date': this.blockHeight,
      certifier: this.txSender
    });
    
    return { ok: true };
  },
  
  getMaterialDetails(materialId) {
    return this.materials.get(materialId);
  },
  
  getMaterialCount() {
    return this.materialIdCounter;
  },
  
  transferAdmin(newAdmin) {
    if (this.txSender !== this.admin) {
      return { err: 100 };
    }
    
    this.admin = newAdmin;
    return { ok: true };
  }
};

describe('Material Certification Contract', () => {
  beforeEach(() => {
    // Reset the mock state
    mockClarity.txSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockClarity.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockClarity.materials = new Map();
    mockClarity.materialIdCounter = 0;
    mockClarity.blockHeight = 100;
  });
  
  it('should certify a new material', () => {
    const result = mockClarity.certifyMaterial('Gold', 'Metal', '24K', 'South Africa');
    expect(result).toEqual({ ok: true });
    
    const materialData = mockClarity.getMaterialDetails(1);
    expect(materialData).toEqual({
      name: 'Gold',
      type: 'Metal',
      purity: '24K',
      origin: 'South Africa',
      'certification-date': 100,
      certifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
    });
  });
  
  it('should not allow non-admin to certify materials', () => {
    mockClarity.txSender = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const result = mockClarity.certifyMaterial('Silver', 'Metal', '925', 'Mexico');
    expect(result).toEqual({ err: 100 });
  });
  
  it('should increment material ID counter', () => {
    mockClarity.certifyMaterial('Gold', 'Metal', '24K', 'South Africa');
    mockClarity.certifyMaterial('Diamond', 'Gemstone', 'VS1', 'Botswana');
    
    expect(mockClarity.getMaterialCount()).toBe(2);
    
    const material1 = mockClarity.getMaterialDetails(1);
    const material2 = mockClarity.getMaterialDetails(2);
    
    expect(material1.name).toBe('Gold');
    expect(material2.name).toBe('Diamond');
  });
  
  it('should transfer admin rights', () => {
    const newAdmin = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const result = mockClarity.transferAdmin(newAdmin);
    expect(result).toEqual({ ok: true });
    expect(mockClarity.admin).toBe(newAdmin);
  });
});
