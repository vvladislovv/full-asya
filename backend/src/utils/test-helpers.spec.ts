describe('Test Configuration', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to Node.js environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  it('should be able to work with JSON', () => {
    const testData = { test: true, number: 42 };
    const serialized = JSON.stringify(testData);
    const parsed = JSON.parse(serialized);
    
    expect(parsed.test).toBe(true);
    expect(parsed.number).toBe(42);
  });

  it('should be able to work with async operations', async () => {
    const result = await Promise.resolve('async test');
    expect(result).toBe('async test');
  });

  it('should be able to handle dates', () => {
    const now = new Date();
    const timestamp = now.getTime();
    const fromTimestamp = new Date(timestamp);
    
    expect(fromTimestamp.getTime()).toBe(now.getTime());
  });
});
