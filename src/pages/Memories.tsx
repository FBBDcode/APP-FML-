import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useIntegration } from '../hooks/useIntegration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Image as ImageIcon, ExternalLink, Calendar, Info, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { EmptyState } from '../components/ui/empty-state';

export function Memories() {
  const { memories } = useStore();
  const { config, connect, sync, isLoading } = useIntegration('photos');

  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => b.date.localeCompare(a.date));
  }, [memories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memórias</h1>
          <p className="text-muted-foreground mt-1">Álbuns de fotos e momentos em família.</p>
        </div>
        
        {config.status === 'connected' ? (
          <Button variant="outline" onClick={sync} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sincronizar Fotos
          </Button>
        ) : (
          <Button onClick={connect} disabled={isLoading}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Conectar Google Fotos
          </Button>
        )}
      </div>

      {config.status !== 'connected' && (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="py-8 text-center flex flex-col items-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
            <h3 className="text-lg font-semibold">Google Fotos Não Conectado</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Conecte sua conta do Google para visualizar e importar seus álbuns de família diretamente nesta página.
            </p>
            <Button onClick={connect} disabled={isLoading} className="mt-6">
              Conectar Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {config.status === 'connected' && sortedMemories.length === 0 && (
        <EmptyState 
          icon={Info}
          title="Nenhum álbum encontrado"
          description="Não encontramos álbuns sincronizados. Clique em sincronizar para importar do Google Fotos."
        />
      )}

      {config.status === 'connected' && sortedMemories.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedMemories.map(album => (
            <Card key={album.id} className="overflow-hidden group flex flex-col">
              <div className="h-40 bg-muted relative border-b flex items-center justify-center overflow-hidden">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-muted-foreground opacity-20" />
                )}
                {album.googleAlbumId && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      <ImageIcon className="w-3 h-3 mr-1" /> Google Fotos
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {album.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {format(parseISO(album.date), "MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  <Badge variant="outline">{album.photoCount} fotos</Badge>
                </div>
              </CardContent>
              
              {album.googleAlbumUrl && (
                <CardFooter className="pt-0 pb-4">
                  <Button variant="secondary" className="w-full" nativeButton={false} render={<a href={album.googleAlbumUrl} target="_blank" rel="noopener noreferrer" />}>
                    Ver no Google Fotos
                    <ExternalLink className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
