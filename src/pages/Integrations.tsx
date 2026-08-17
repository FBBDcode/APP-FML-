import React from 'react';
import { useIntegration } from '../hooks/useIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { HardDrive, Calendar, Map, Image as ImageIcon, FileSpreadsheet, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { IntegrationProvider } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IntegrationCardProps {
  provider: IntegrationProvider;
  title: string;
  description: string;
  icon: React.ElementType;
}

function IntegrationCard({ provider, title, description, icon: Icon }: IntegrationCardProps) {
  const { config, connect, disconnect, sync, isLoading } = useIntegration(provider);

  const getStatusBadge = () => {
    if (isLoading) return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Sincronizando</Badge>;
    switch (config.status) {
      case 'connected': return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Conectado</Badge>;
      case 'error': return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Erro</Badge>;
      default: return <Badge variant="outline">Desconectado</Badge>;
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-muted rounded-md">
            <Icon className="w-6 h-6 text-foreground" />
          </div>
          {getStatusBadge()}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        {config.status === 'connected' && (
          <div className="text-sm space-y-2 bg-muted/30 p-3 rounded-md">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conta:</span>
              <span className="font-medium truncate ml-2">{config.accountEmail || 'Conectado'}</span>
            </div>
            {config.lastSync && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última sync:</span>
                <span className="font-medium">
                  {format(parseISO(config.lastSync), "dd/MM 'às' HH:mm")}
                </span>
              </div>
            )}
          </div>
        )}
        {config.status === 'error' && config.errorMessage && (
          <div className="text-sm text-destructive mt-2 bg-destructive/10 p-2 rounded-md flex items-center">
            <XCircle className="w-4 h-4 mr-2 shrink-0" />
            {config.errorMessage}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4 border-t flex gap-2">
        {config.status === 'connected' || config.status === 'error' ? (
          <>
            <Button variant="outline" className="flex-1" onClick={disconnect} disabled={isLoading}>
              Desconectar
            </Button>
            <Button variant="default" className="flex-1" onClick={sync} disabled={isLoading}>
              Sincronizar
            </Button>
          </>
        ) : (
          <Button className="w-full" onClick={connect} disabled={isLoading}>
            Conectar Google
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function Integrations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
        <p className="text-muted-foreground mt-1">Conecte sua família aos serviços do Google para sincronização automática.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <IntegrationCard 
          provider="drive" 
          title="Google Drive" 
          description="Vincule e visualize documentos da família direto do Drive." 
          icon={HardDrive} 
        />
        <IntegrationCard 
          provider="calendar" 
          title="Google Calendar" 
          description="Sincronize eventos e compromissos com a agenda familiar." 
          icon={Calendar} 
        />
        <IntegrationCard 
          provider="maps" 
          title="Google Maps" 
          description="Acesse endereços importantes e rotas rapidamente." 
          icon={Map} 
        />
        <IntegrationCard 
          provider="photos" 
          title="Google Fotos" 
          description="Sincronize álbuns e memórias da família." 
          icon={ImageIcon} 
        />
        <IntegrationCard 
          provider="sheets" 
          title="Google Sheets" 
          description="Exporte e importe dados financeiros facilmente." 
          icon={FileSpreadsheet} 
        />
      </div>
    </div>
  );
}
