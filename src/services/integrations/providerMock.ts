import { IntegrationProvider } from '../../types';

export const mockConnect = async (provider: IntegrationProvider): Promise<{ email: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ email: 'familia@gmail.com' });
    }, 1500);
  });
};

export const mockDisconnect = async (provider: IntegrationProvider): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

export const mockSync = async (provider: IntegrationProvider): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulating a random error for demonstration sometimes, but usually success
      if (Math.random() > 0.9) {
        resolve({ success: false, error: 'Falha na sincronização. Tente novamente.' });
      } else {
        resolve({ success: true });
      }
    }, 2000);
  });
};
