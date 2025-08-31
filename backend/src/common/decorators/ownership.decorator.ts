import { SetMetadata } from '@nestjs/common';

export interface OwnershipOptions {
  entity: string;
  param: string;
  relation?: string;
}

export const Ownership = (options: OwnershipOptions) => SetMetadata('ownership', options);