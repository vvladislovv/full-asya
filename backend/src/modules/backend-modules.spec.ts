/**
 * Backend Modules Structure Tests
 * These tests verify that all backend modules are properly structured
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Backend Modules Structure', () => {
  const modulesPath = path.join(__dirname);
  const parentPath = path.dirname(modulesPath);

  it('should have all required module directories', () => {
    const expectedModules = [
      'auth',
      'users', 
      'tests',
      'consultations',
      'dementia-screening',
      'emotional-state',
      'history',
      'questionnaires',
      'test-scoring',
      'test-stages',
      'practices'
    ];

    expectedModules.forEach(moduleName => {
      const modulePath = path.join(modulesPath, moduleName);
      expect(fs.existsSync(modulePath)).toBe(true);
    });
  });

  it('should have core service files in each module', () => {
    const coreModules = ['auth', 'users', 'tests'];
    
    coreModules.forEach(moduleName => {
      const serviceFile = path.join(modulesPath, moduleName, `${moduleName}.service.ts`);
      const controllerFile = path.join(modulesPath, moduleName, `${moduleName}.controller.ts`);
      const moduleFile = path.join(modulesPath, moduleName, `${moduleName}.module.ts`);
      
      expect(fs.existsSync(serviceFile)).toBe(true);
      expect(fs.existsSync(controllerFile)).toBe(true);
      expect(fs.existsSync(moduleFile)).toBe(true);
    });
  });

  it('should have prisma service and module', () => {
    const prismaPath = path.join(parentPath, 'prisma');
    const prismaService = path.join(prismaPath, 'prisma.service.ts');
    const prismaModule = path.join(prismaPath, 'prisma.module.ts');
    
    expect(fs.existsSync(prismaService)).toBe(true);
    expect(fs.existsSync(prismaModule)).toBe(true);
  });

  it('should have common utilities', () => {
    const commonPath = path.join(parentPath, 'common');
    expect(fs.existsSync(commonPath)).toBe(true);
    
    const commonSubdirs = ['controllers', 'guards', 'interceptors', 'pipes', 'services'];
    commonSubdirs.forEach(subdir => {
      const subdirPath = path.join(commonPath, subdir);
      expect(fs.existsSync(subdirPath)).toBe(true);
    });
  });

  it('should have main application files', () => {
    const appModule = path.join(parentPath, 'app.module.ts');
    const mainFile = path.join(parentPath, 'main.ts');
    
    expect(fs.existsSync(appModule)).toBe(true);
    expect(fs.existsSync(mainFile)).toBe(true);
  });
});
