import { useState } from 'react';
import { useStore } from '../store/useStore';
import { IntegrationProvider } from '../types';
import { IntegrationService } from '../services/integrations';
import { toast } from 'sonner';

export function useIntegration(provider: IntegrationProvider) {
  const { integrations, updateIntegration } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const config = integrations.find(i => i.provider === provider) || {
    provider,
    status: 'disconnected',
  };

  const connect = async () => {
    setIsLoading(true);
    updateIntegration(provider, { errorMessage: undefined });
    try {
      const res = await IntegrationService.connect(provider);
      updateIntegration(provider, { 
        status: 'connected', 
        accountEmail: res.email,
        lastSync: new Date().toISOString()
      });
      toast.success('Conectado com sucesso!');
    } catch (err) {
      updateIntegration(provider, { status: 'error', errorMessage: 'Erro ao conectar.' });
      toast.error('Falha ao conectar.');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      await IntegrationService.disconnect(provider);
      updateIntegration(provider, { 
        status: 'disconnected', 
        accountEmail: undefined,
        lastSync: undefined
      });
      toast.success('Desconectado com sucesso.');
    } catch (err) {
      updateIntegration(provider, { status: 'error', errorMessage: 'Erro ao desconectar.' });
    } finally {
      setIsLoading(false);
    }
  };

  const sync = async () => {
    if (config.status !== 'connected' && config.status !== 'error') return;
    
    setIsLoading(true);
    updateIntegration(provider, { errorMessage: undefined });
    try {
      const res = await IntegrationService.sync(provider);
      if (res.success) {
        updateIntegration(provider, { 
          status: 'connected', 
          lastSync: new Date().toISOString(),
          errorMessage: undefined
        });
        toast.success('Sincronização concluída.');
      } else {
        updateIntegration(provider, { status: 'error', errorMessage: res.error });
        toast.error('Falha na sincronização.');
      }
    } catch (err) {
      updateIntegration(provider, { status: 'error', errorMessage: 'Erro interno.' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    config,
    isLoading,
    connect,
    disconnect,
    sync
  };
}
