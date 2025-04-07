import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Clarity VM environment
const mockClarity = {
  txSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  blockHeight: 100,
  artisans: new Map(),
  
  // Mock contract functions
  registerArtisan(name, credentials) {
    if (this.txSender !== this.admin) {
      return { err: 100 };
    }
    
    this.artisans.set(this.txSender, {
      name,
      verified: false,
      'verification-date': 0,
      credentials
    });
    
    return { ok: true };
  },
  
  verifyArtisan(artisan) {
    if (this.txSender !== this.admin) {
      return { err: 100 };
    }
    
    const artisanData = this.artisans.get(artisan);
    if (!artisanData) {
      return { err: 101 };
    }
    
    artisanData.verified = true;
    artisanData['verification-date'] = this.blockHeight;
    this.artisans.set(artisan, artisanData);
    
    return { ok: true };
  },
  
  isVerifiedArtisan(artisan) {
    const artisanData = this.artisans.get(artisan);
    return artisanData ? artisanData.verified : false;
  },
  
  getArtisanDetails(artisan) {
    return this.artisans.get(artisan);
  },
  
  transferAdmin(newAdmin) {
    if (this.txSender !== this.admin) {
      return { err: 100 };
    }
    
    this.admin = newAdmin;
    return { ok: true };
  }
};

describe('Artisan Verification Contract', () => {
  beforeEach(() => {
    // Reset the mock state
    mockClarity.txSender = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockClarity.admin = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    mockClarity.artisans = new Map();
    mockClarity.blockHeight = 100;
  });
  
  it('should register a new artisan', () => {
    const result = mockClarity.registerArtisan('John Doe', 'Master Jeweler with 10 years experience');
    expect(result).toEqual({ ok: true });
    
    const artisanData = mockClarity.getArtisanDetails(mockClarity.txSender);
    expect(artisanData).toEqual({
      name: 'John Doe',
      verified: false,
      'verification-date': 0,
      credentials: 'Master Jeweler with 10 years experience'
    });
  });
  
  it('should not allow non-admin to register artisans', () => {
    mockClarity.txSender = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const result = mockClarity.registerArtisan('Jane Smith', 'Gemstone Expert');
    expect(result).toEqual({ err: 100 });
  });
  
  it('should verify an artisan', () => {
    // First register the artisan
    mockClarity.registerArtisan('John Doe', 'Master Jeweler with 10 years experience');
    
    // Then verify them
    const result = mockClarity.verifyArtisan(mockClarity.txSender);
    expect(result).toEqual({ ok: true });
    
    // Check if they're verified
    const isVerified = mockClarity.isVerifiedArtisan(mockClarity.txSender);
    expect(isVerified).toBe(true);
    
    // Check verification date
    const artisanData = mockClarity.getArtisanDetails(mockClarity.txSender);
    expect(artisanData['verification-date']).toBe(100);
  });
  
  it('should transfer admin rights', () => {
    const newAdmin = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const result = mockClarity.transferAdmin(newAdmin);
    expect(result).toEqual({ ok: true });
    expect(mockClarity.admin).toBe(newAdmin);
  });
});
