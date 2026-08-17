import { IntegrationProvider } from '../../types';
import * as provider from './providerMock';

// This acts as our integration service layer
export const IntegrationService = {
  connect: async (type: IntegrationProvider) => {
    return provider.mockConnect(type);
  },
  disconnect: async (type: IntegrationProvider) => {
    return provider.mockDisconnect(type);
  },
  sync: async (type: IntegrationProvider) => {
    return provider.mockSync(type);
  }
};
