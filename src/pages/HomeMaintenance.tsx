import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { HomeItem, Maintenance, HomeItemCategory } from '../types';
import { Home, Zap, Shield, Plus, Calendar as CalendarIcon, User, Wrench, AlertTriangle, CheckCircle2, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { format, parseISO, isPast, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { EmptyState } from '../components/ui/empty-state';

export function HomeMaintenance() {
  const { homeItems, maintenances, contacts, addHomeItem, updateHomeItem, deleteHomeItem, addMaintenance, updateMaintenance, deleteMaintenance } = useStore();
  
  // States for Tabs
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [openItem, setOpenItem] = useState(false);
  const [openMaintenance, setOpenMaintenance] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<string | null>(null);

  // HomeItem Form
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<HomeItemCategory>('Equipamentos');
  const [itemLocation, setItemLocation] = useState('');
  const [itemSupplierId, setItemSupplierId] = useState('none');
  const [hasWarranty, setHasWarranty] = useState(false);
  const [itemWarrantyDate, setItemWarrantyDate] = useState('');

  // Maintenance Form
  const [maintService, setMaintService] = useState('');
  const [maintItemId, setMaintItemId] = useState('none');
  const [maintLocation, setMaintLocation] = useState('');
  const [maintDate, setMaintDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [maintCompleted, setMaintCompleted] = useState(false);
  const [maintSupplierId, setMaintSupplierId] = useState('none');
  const [maintCost, setMaintCost] = useState('');

  const resetItemForm = () => {
    setEditingItemId(null);
    setItemName('');
    setItemCategory('Equipamentos');
    setItemLocation('');
    setItemSupplierId('none');
    setHasWarranty(false);
    setItemWarrantyDate('');
  };

  const resetMaintForm = () => {
    setEditingMaintenanceId(null);
    setMaintService('');
    setMaintItemId('none');
    setMaintLocation('');
    setMaintDate(format(new Date(), 'yyyy-MM-dd'));
    setMaintCompleted(false);
    setMaintSupplierId('none');
    setMaintCost('');
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;
    
    const data = {
      name: itemName,
      category: itemCategory,
      location: itemLocation,
      supplierId: itemSupplierId === 'none' ? undefined : itemSupplierId,
      warrantyEndDate: hasWarranty ? itemWarrantyDate : undefined,
    };

    if (editingItemId) {
      updateHomeItem(editingItemId, data);
      toast.success('Equipamento atualizado!');
    } else {
      addHomeItem(data);
      toast.success('Equipamento cadastrado!');
    }
    setOpenItem(false);
  };

  const handleSaveMaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintService || !maintDate) return;

    const data = {
      serviceName: maintService,
      homeItemId: maintItemId === 'none' ? undefined : maintItemId,
      location: maintItemId === 'none' ? maintLocation : undefined,
      date: maintDate,
      isCompleted: maintCompleted,
      supplierId: maintSupplierId === 'none' ? undefined : maintSupplierId,
      cost: maintCost ? parseFloat(maintCost) : undefined,
    };

    if (editingMaintenanceId) {
      updateMaintenance(editingMaintenanceId, data);
      toast.success('Manutenção atualizada!');
    } else {
      addMaintenance(data);
      toast.success('Manutenção agendada!');
    }
    setOpenMaintenance(false);
  };

  const getWarrantyStatus = (date?: string) => {
    if (!date) return null;
    const d = parseISO(date);
    if (isPast(d)) return 'expired';
    if (isBefore(d, addDays(new Date(), 30))) return 'expiring_soon';
    return 'valid';
  };

  // Computations
  const upcomingMaintenances = useMemo(() => {
    return maintenances
      .filter(m => !m.isCompleted && !isPast(parseISO(m.date)))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [maintenances]);

  const lateMaintenances = useMemo(() => {
    return maintenances
      .filter(m => !m.isCompleted && isPast(parseISO(m.date)))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [maintenances]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Casa</h1>
          <p className="text-muted-foreground mt-1">Gestão de equipamentos, manutenções e garantias.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={openItem} onOpenChange={(v) => { setOpenItem(v); if(!v) resetItemForm(); }}>
            <DialogTrigger render={<Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Equipamento</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItemId ? 'Editar Equipamento' : 'Novo Equipamento'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveItem} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nome do Item</Label>
                  <Input value={itemName} onChange={e => setItemName(e.target.value)} required placeholder="Ex: Geladeira" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={itemCategory} onValueChange={(v: HomeItemCategory) => setItemCategory(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="Eletrodomésticos">Eletrodomésticos</SelectItem>
                        <SelectItem value="Móveis">Móveis</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Localização</Label>
                    <Input value={itemLocation} onChange={e => setItemLocation(e.target.value)} placeholder="Ex: Cozinha" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor / Loja (Contato)</Label>
                  <Select value={itemSupplierId} onValueChange={setItemSupplierId}>
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="hw" checked={hasWarranty} onChange={e => setHasWarranty(e.target.checked)} className="rounded" />
                    <Label htmlFor="hw" className="font-normal cursor-pointer">Possui Garantia?</Label>
                  </div>
                  {hasWarranty && <Input type="date" value={itemWarrantyDate} onChange={e => setItemWarrantyDate(e.target.value)} required />}
                </div>
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={openMaintenance} onOpenChange={(v) => { setOpenMaintenance(v); if(!v) resetMaintForm(); }}>
            <DialogTrigger render={<Button><Wrench className="h-4 w-4 mr-2" /> Manutenção</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMaintenanceId ? 'Editar Manutenção' : 'Agendar Manutenção'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveMaint} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Serviço</Label>
                  <Input value={maintService} onChange={e => setMaintService(e.target.value)} required placeholder="Ex: Troca de filtro" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Equipamento (opcional)</Label>
                    <Select value={maintItemId} onValueChange={setMaintItemId}>
                      <SelectTrigger><SelectValue placeholder="Geral" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Geral da Casa</SelectItem>
                        {homeItems.map(hi => <SelectItem key={hi.id} value={hi.id}>{hi.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {maintItemId === 'none' && (
                    <div className="space-y-2">
                      <Label>Local</Label>
                      <Input value={maintLocation} onChange={e => setMaintLocation(e.target.value)} placeholder="Ex: Telhado" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" value={maintDate} onChange={e => setMaintDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Custo (R$)</Label>
                    <Input type="number" value={maintCost} onChange={e => setMaintCost(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Prestador de Serviço (Contato)</Label>
                  <Select value={maintSupplierId} onValueChange={setMaintSupplierId}>
                    <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="mc" checked={maintCompleted} onChange={e => setMaintCompleted(e.target.checked)} className="rounded" />
                    <Label htmlFor="mc" className="font-normal cursor-pointer">Manutenção Concluída</Label>
                  </div>
                </div>
                <Button type="submit" className="w-full">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="items">Equipamentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Manutenções */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-primary" />
                  Agenda de Manutenções
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {lateMaintenances.length > 0 && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <h4 className="text-sm font-semibold text-destructive flex items-center mb-3">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Atrasadas ({lateMaintenances.length})
                    </h4>
                    <div className="space-y-3">
                      {lateMaintenances.map(m => (
                        <div key={m.id} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium">{m.serviceName}</p>
                            <p className="text-xs text-muted-foreground">{m.homeItemId ? (homeItems.find(i=>i.id===m.homeItemId)?.name || "Item Excluído") : m.location}</p>
                          </div>
                          <Badge variant="destructive" className="whitespace-nowrap">{format(parseISO(m.date), 'dd/MM/yyyy')}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">Próximas</h4>
                  {upcomingMaintenances.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Tudo em dia!</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingMaintenances.map(m => (
                        <div key={m.id} className="flex justify-between items-center text-sm group">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5"><CalendarIcon className="h-4 w-4 text-muted-foreground" /></div>
                            <div>
                              <p className="font-medium">{m.serviceName}</p>
                              <p className="text-xs text-muted-foreground">{m.homeItemId ? (homeItems.find(i=>i.id===m.homeItemId)?.name || "Item Excluído") : m.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium">{format(parseISO(m.date), 'dd/MM')}</span>
                            <Button variant="ghost" size="icon-xs" className=" opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => updateMaintenance(m.id, { isCompleted: true })}>
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Garantias */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary" />
                  Status de Garantias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-4">
                  {homeItems.filter(i => i.warrantyEndDate).sort((a, b) => a.warrantyEndDate!.localeCompare(b.warrantyEndDate!)).map(item => {
                    const status = getWarrantyStatus(item.warrantyEndDate);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm border-b pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Vence em {format(parseISO(item.warrantyEndDate!), 'dd/MM/yyyy')}</p>
                        </div>
                        {status === 'expired' && <Badge variant="destructive">Expirada</Badge>}
                        {status === 'expiring_soon' && <Badge className="bg-amber-500 hover:bg-amber-600">Alerta</Badge>}
                        {status === 'valid' && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/20">Vigente</Badge>}
                      </div>
                    );
                  })}
                  {homeItems.filter(i => i.warrantyEndDate).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma garantia registrada.</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          {homeItems.length === 0 ? (
            <EmptyState 
              icon={Home}
              title="Nenhum equipamento cadastrado"
              description="Cadastre seus eletrodomésticos, eletrônicos e veículos para acompanhar manutenções e garantias."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {homeItems.map(item => (
                <Card key={item.id} className="group flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 font-normal text-xs">{item.category}</Badge>
                      <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                      {item.location && <p className="text-sm text-muted-foreground mt-0.5">{item.location}</p>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-2 mt-2">
                    {item.supplierId && (
                      <p className="text-xs flex items-center text-muted-foreground">
                        <User className="h-3 w-3 mr-1" /> Fornecedor: {contacts.find(c=>c.id===item.supplierId)?.name || 'Desconhecido'}
                      </p>
                    )}
                    {item.warrantyEndDate && (
                      <p className="text-xs flex items-center text-muted-foreground">
                        <Shield className="h-3 w-3 mr-1" /> Garantia até: {format(parseISO(item.warrantyEndDate), 'dd/MM/yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon-sm" className=" text-destructive hover:text-destructive" onClick={() => deleteHomeItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Manutenções Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenances.filter(m => m.isCompleted).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum registro histórico.</p>
                ) : (
                  maintenances.filter(m => m.isCompleted).sort((a,b)=>b.date.localeCompare(a.date)).map(m => (
                    <div key={m.id} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <p className="font-medium text-sm">{m.serviceName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{m.homeItemId ? (homeItems.find(i=>i.id===m.homeItemId)?.name || "Item Excluído") : m.location}</p>
                        {m.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{m.notes}"</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{format(parseISO(m.date), 'dd/MM/yyyy')}</p>
                        {m.cost && <p className="text-xs text-muted-foreground mt-1">R$ {m.cost.toFixed(2)}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
