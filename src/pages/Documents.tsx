import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { FileText, Plus, Search, Trash2, Edit2, Info, Filter, Calendar as CalendarIcon, User, HardDrive, Download } from 'lucide-react';
import { format, parseISO, isPast, isBefore, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Document, DocumentCategory, DocumentStatus } from '../types';
import { useIntegration } from '../hooks/useIntegration';
import { Link } from 'react-router-dom';

import { EmptyState } from '../components/ui/empty-state';

export function Documents() {
  const { documents, family, addDocument, updateDocument, deleteDocument } = useStore();
  const { config: driveConfig } = useIntegration('drive');
  const [search, setSearch] = useState('');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');

  // Modals
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Documentos pessoais');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState<string>('none');
  const [documentDate, setDocumentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');

  // Details State
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const categories: DocumentCategory[] = [
    'Documentos pessoais', 'Casa', 'Veículos', 'Escola', 'Seguros', 
    'Contratos', 'Garantias', 'Comprovantes', 'Outros'
  ];

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Documentos pessoais');
    setDescription('');
    setOwnerId('none');
    setDocumentDate(format(new Date(), 'yyyy-MM-dd'));
    setHasExpiration(false);
    setExpirationDate('');
    setNotes('');
  };

  const handleEdit = (doc: Document) => {
    setEditingId(doc.id);
    setName(doc.name);
    setCategory(doc.category);
    setDescription(doc.description || '');
    setOwnerId(doc.ownerId || 'none');
    setDocumentDate(doc.documentDate);
    setHasExpiration(!!doc.expirationDate);
    setExpirationDate(doc.expirationDate || '');
    setNotes(doc.notes || '');
    setOpen(true);
  };

  const computeStatus = (expDate?: string): DocumentStatus => {
    if (!expDate) return 'no_expiration';
    const date = parseISO(expDate);
    if (isPast(date)) return 'expired';
    if (isBefore(date, addDays(new Date(), 30))) return 'expiring_soon'; // expiring in < 30 days
    return 'valid';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !documentDate) return;

    const docData = {
      name,
      category,
      description,
      ownerId: ownerId === 'none' ? undefined : ownerId,
      documentDate,
      expirationDate: hasExpiration ? expirationDate : undefined,
      status: computeStatus(hasExpiration ? expirationDate : undefined),
      notes,
    };

    if (editingId) {
      updateDocument(editingId, docData);
      toast.success('Documento atualizado!');
    } else {
      addDocument(docData);
      toast.success('Documento adicionado!');
    }
    setOpen(false);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch(status) {
      case 'valid': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Válido</Badge>;
      case 'expiring_soon': return <Badge className="bg-amber-500 hover:bg-amber-600 text-amber-950">Vence em breve</Badge>;
      case 'expired': return <Badge variant="destructive">Vencido</Badge>;
      case 'no_expiration': return <Badge variant="secondary">Sem validade</Badge>;
    }
  };

  // When opening the page or filtering, we need to dynamically update the status if time has passed
  // (In a real app, this might be a cron job, but here we just recompute on render)
  const filteredDocuments = useMemo(() => {
    let docs = documents.map(d => ({
      ...d,
      status: computeStatus(d.expirationDate)
    }));

    if (search) {
      const s = search.toLowerCase();
      docs = docs.filter(d => 
        d.name.toLowerCase().includes(s) || 
        d.category.toLowerCase().includes(s) ||
        (d.ownerId && family.members.find(m => m.id === d.ownerId)?.name.toLowerCase().includes(s))
      );
    }

    if (categoryFilter !== 'all') {
      docs = docs.filter(d => d.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      docs = docs.filter(d => d.status === statusFilter);
    }

    if (ownerFilter !== 'all') {
      if (ownerFilter === 'none') {
        docs = docs.filter(d => !d.ownerId);
      } else {
        docs = docs.filter(d => d.ownerId === ownerFilter);
      }
    }

    // Sort: expired first, then expiring soon, then valid/no expiration
    return docs.sort((a, b) => {
      const order = { 'expired': 1, 'expiring_soon': 2, 'valid': 3, 'no_expiration': 4 };
      if (order[a.status] !== order[b.status]) {
        return order[a.status] - order[b.status];
      }
      return a.name.localeCompare(b.name);
    });
  }, [documents, search, categoryFilter, statusFilter, ownerFilter, family.members]);

  const viewDetails = (id: string) => {
    setSelectedDocId(id);
    setDetailsOpen(true);
  };

  const selectedDoc = useMemo(() => documents.find(d => d.id === selectedDocId), [documents, selectedDocId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos</h1>
          <p className="text-muted-foreground mt-1">Catálogo e organização dos documentos da família.</p>
        </div>
        
        <div className="flex gap-2 items-center">
          {driveConfig.status === 'connected' ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20 py-1.5 hidden sm:flex">
              <HardDrive className="h-3.5 w-3.5 mr-1" /> Drive Conectado
            </Badge>
          ) : (
            <Button variant="outline" size="sm" className="hidden sm:flex" nativeButton={false} render={<Link to="/configuracoes/integracoes" />}>
              <HardDrive className="h-4 w-4 mr-2" /> Conectar Drive
            </Button>
          )}
          
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) resetForm();
          }}>
            <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" /> Novo Documento</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              
              {driveConfig.status === 'connected' && (
                <div className="bg-muted/50 p-4 rounded-lg border border-dashed flex flex-col items-center justify-center text-center space-y-2 mb-4">
                  <HardDrive className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm font-medium">Vincular arquivo do Google Drive</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => toast.info('Seleção de arquivo será implementada via Google Picker na fase de integração.')}>
                    Selecionar Arquivo
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Documento</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Passaporte Maria" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={(v: DocumentCategory) => setCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner">Responsável (opcional)</Label>
                  <Select value={ownerId} onValueChange={setOwnerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Família / Geral</SelectItem>
                      {family.members.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição Breve (opcional)</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="docDate">Data de Emissão</Label>
                  <Input id="docDate" type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 h-5 mt-1 mb-2">
                    <input 
                      type="checkbox" 
                      id="hasExpiration" 
                      checked={hasExpiration} 
                      onChange={(e) => setHasExpiration(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="hasExpiration" className="font-normal cursor-pointer">Possui Validade?</Label>
                  </div>
                  {hasExpiration && (
                    <Input 
                      type="date" 
                      value={expirationDate} 
                      onChange={(e) => setExpirationDate(e.target.value)} 
                      required={hasExpiration} 
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Onde está guardado? Alguma pendência?" />
              </div>

              <Button type="submit" className="w-full">Salvar Documento</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="border-dashed bg-muted/30">
        <CardContent className="grid gap-4 lg:grid-cols-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, categoria ou pessoa..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="valid">Válidos</SelectItem>
              <SelectItem value="expiring_soon">Vencendo em breve</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
              <SelectItem value="no_expiration">Sem validade</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Detalhes Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          {selectedDoc ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center justify-between gap-4 pr-8">
                  {selectedDoc.name}
                  {getStatusBadge(computeStatus(selectedDoc.expirationDate))}
                </DialogTitle>
                <DialogDescription>
                  Adicionado em {format(parseISO(selectedDoc.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                    <p className="font-medium">{selectedDoc.category}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selectedDoc.ownerId 
                        ? family.members.find(m => m.id === selectedDoc.ownerId)?.name || 'Desconhecido' 
                        : 'Família'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Data de Emissão</p>
                    <p className="font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {format(parseISO(selectedDoc.documentDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Validade</p>
                    <p className="font-medium flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {selectedDoc.expirationDate 
                        ? format(parseISO(selectedDoc.expirationDate), 'dd/MM/yyyy') 
                        : 'Não aplicável'}
                    </p>
                  </div>
                </div>

                {(selectedDoc.description || selectedDoc.notes) && (
                  <div className="border-t pt-4 space-y-4">
                    {selectedDoc.description && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
                        <p className="text-sm">{selectedDoc.description}</p>
                      </div>
                    )}
                    {selectedDoc.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm p-3 bg-muted rounded-md">{selectedDoc.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Arquivo Digital (Google Drive)</p>
                  {selectedDoc.driveFileId ? (
                     <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                           <FileText className="h-5 w-5" />
                         </div>
                         <div>
                           <p className="text-sm font-medium">{selectedDoc.originalName || 'Documento.pdf'}</p>
                           <p className="text-xs text-muted-foreground">
                             {(selectedDoc.fileSize || 0) > 1024 * 1024 
                               ? `${((selectedDoc.fileSize || 0) / (1024 * 1024)).toFixed(1)} MB` 
                               : `${Math.round((selectedDoc.fileSize || 0) / 1024)} KB`}
                           </p>
                         </div>
                       </div>
                       <Button variant="ghost" size="icon">
                         <Download className="h-4 w-4" />
                       </Button>
                     </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg bg-card text-center">
                      <HardDrive className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-sm font-medium">Nenhum arquivo vinculado</p>
                      <p className="text-xs text-muted-foreground mt-1">O upload via Google Drive será ativado em breve.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Documento não encontrado.</div>
          )}
        </DialogContent>
      </Dialog>

      {filteredDocuments.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="Nenhum documento encontrado"
          description={documents.length === 0 
            ? 'Mantenha todos os documentos importantes da sua família organizados e com controle de vencimento.' 
            : 'Tente ajustar os filtros ou a sua busca para encontrar o que procura.'}
          action={documents.length === 0 ? <Button onClick={() => setOpen(true)}>Adicionar Primeiro Documento</Button> : null}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map(doc => {
            const owner = doc.ownerId ? family.members.find(m => m.id === doc.ownerId) : null;
            return (
              <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-all group flex flex-col cursor-pointer" onClick={() => viewDetails(doc.id)}>
                <CardHeader className="p-4 pb-2 flex-none">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-5">
                          {doc.category}
                        </Badge>
                        {owner && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {owner.name}
                          </span>
                        )}
                        {doc.driveFileId && (
                          <span className="text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 p-0.5 rounded ml-auto">
                            <HardDrive className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base truncate leading-tight">{doc.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mt-2">
                    {getStatusBadge(doc.status)}
                    {doc.expirationDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {format(parseISO(doc.expirationDate), 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon-sm" className="" onClick={() => handleEdit(doc)}>
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className=" text-destructive hover:text-destructive" onClick={() => deleteDocument(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
