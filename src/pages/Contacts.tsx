import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Contact, ContactCategory } from '../types';
import { Phone, Mail, Building2, MapPin, Search, Filter, Edit2, Trash2, Plus, User } from 'lucide-react';
import { toast } from 'sonner';

import { EmptyState } from '../components/ui/empty-state';

export function Contacts() {
  const { contacts, addContact, updateContact, deleteContact } = useStore();
  
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ContactCategory>('Família');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const categories: ContactCategory[] = [
    'Família', 'Escola', 'Casa', 'Serviços', 'Seguros', 'Emergência', 'Trabalho', 'Outros'
  ];

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Família');
    setPhone('');
    setEmail('');
    setCompany('');
    setAddress('');
    setNotes('');
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setCategory(contact.category);
    setPhone(contact.phone || '');
    setEmail(contact.email || '');
    setCompany(contact.company || '');
    setAddress(contact.address || '');
    setNotes(contact.notes || '');
    setOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const contactData = {
      name,
      category,
      phone,
      email,
      company,
      address,
      notes,
    };

    if (editingId) {
      updateContact(editingId, contactData);
      toast.success('Contato atualizado!');
    } else {
      addContact(contactData);
      toast.success('Contato adicionado!');
    }
    setOpen(false);
  };

  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(s) || 
        (c.company && c.company.toLowerCase().includes(s)) ||
        (c.category.toLowerCase().includes(s))
      );
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, search, categoryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground mt-1">Sua agenda central de contatos importantes.</p>
        </div>
        <Dialog open={open} onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}>
          <DialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" /> Novo Contato</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Contato' : 'Novo Contato'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Maria (Encanadora)" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={(v: ContactCategory) => setCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa / Instituição (opcional)</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço (opcional)</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Horário de atendimento, especialidade..." />
              </div>

              <Button type="submit" className="w-full">Salvar Contato</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-dashed bg-muted/30">
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome, empresa ou categoria..." 
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filteredContacts.length === 0 ? (
        <EmptyState 
          icon={User}
          title="Nenhum contato encontrado"
          description={contacts.length === 0 ? 'Adicione contatos de escolas, médicos, serviços de casa e emergência.' : 'Sua busca não retornou resultados.'}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map(contact => (
            <Card key={contact.id} className="group overflow-hidden flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 font-normal text-xs">{contact.category}</Badge>
                    <CardTitle className="text-lg leading-tight">{contact.name}</CardTitle>
                    {contact.company && <p className="text-sm text-muted-foreground mt-0.5">{contact.company}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mt-2">
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`tel:${contact.phone.replace(/\D/g,'')}`} className="text-primary hover:underline">{contact.phone}</a>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline truncate">{contact.email}</a>
                    </div>
                  )}
                  {contact.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground line-clamp-2">{contact.address}</span>
                    </div>
                  )}
                </div>
                
                {contact.notes && (
                  <p className="text-xs text-muted-foreground mt-4 bg-muted/50 p-2 rounded line-clamp-2">
                    {contact.notes}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm" className="" onClick={() => handleEdit(contact)}>
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className=" text-destructive hover:text-destructive" onClick={() => deleteContact(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
