export type Role = 'admin' | 'member';

export interface Member {
  id: string;
  name: string;
  email?: string;
  role: Role;
  avatar?: string;
}

export interface Family {
  id: string;
  name: string;
  members: Member[];
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  category: string;
  notes?: string;
  // Google Calendar Integration
  source?: 'local' | 'google';
  googleEventId?: string;
  calendarId?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  lastSync?: string;
}

export interface ShoppingItem {
  id: string;
  description: string;
  completed: boolean;
  quantity: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  instructions: string;
  prepTime: number; // in minutes
  notes?: string;
  photoUrl?: string;
  isFavorite: boolean;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'other';

export interface Meal {
  id: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  recipeId?: string;
  name?: string;
}

export type DocumentCategory =
  | 'Documentos pessoais'
  | 'Casa'
  | 'Veículos'
  | 'Escola'
  | 'Seguros'
  | 'Contratos'
  | 'Garantias'
  | 'Comprovantes'
  | 'Outros';

export type DocumentStatus = 'valid' | 'expiring_soon' | 'expired' | 'no_expiration';

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  description?: string;
  ownerId?: string; // Reference to Member.id
  documentDate: string; // YYYY-MM-DD
  expirationDate?: string; // YYYY-MM-DD
  status: DocumentStatus;
  
  // Future Google Drive Integration Fields
  driveFileId?: string;
  driveUrl?: string;
  mimeType?: string;
  originalName?: string;
  fileSize?: number; // bytes
  modifiedTime?: string;
  thumbnailUrl?: string;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContactCategory = 'Família' | 'Escola' | 'Casa' | 'Serviços' | 'Seguros' | 'Emergência' | 'Trabalho' | 'Outros';

export interface Contact {
  id: string;
  name: string;
  category: ContactCategory;
  phone?: string;
  email?: string;
  company?: string;
  address?: string;
  notes?: string;
  // Google Maps Integration
  latitude?: number;
  longitude?: number;
  googlePlaceId?: string;
  mapUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type HomeItemCategory = 'Equipamentos' | 'Eletrodomésticos' | 'Móveis' | 'Outros';

export interface HomeItem {
  id: string;
  name: string;
  category: HomeItemCategory;
  location?: string;
  purchaseDate?: string; // YYYY-MM-DD
  value?: number;
  supplierId?: string; // Reference to Contact.id
  warrantyEndDate?: string; // YYYY-MM-DD
  documentId?: string; // Reference to Document.id
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  serviceName: string;
  homeItemId?: string; // Reference to HomeItem.id
  location?: string; // Free text if not tied to specific equipment
  date: string; // YYYY-MM-DD
  isCompleted: boolean;
  assigneeId?: string; // Reference to Member.id
  cost?: number;
  supplierId?: string; // Reference to Contact.id
  nextMaintenanceDate?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PostType = 'Aviso' | 'Lembrete' | 'Informação' | 'Comunicado';
export type Priority = 'Normal' | 'Importante' | 'Urgente';

export interface BoardPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  type: PostType;
  priority: Priority;
  isRead: boolean; // Simple boolean for current user read status in this phase
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'task' | 'event' | 'document' | 'home' | 'board' | 'finance' | 'other';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  priority: Priority;
  isRead: boolean;
  linkTo?: string;
  referenceId?: string;
  createdAt: string;
}

export interface MemoryAlbum {
  id: string;
  title: string;
  photoCount: number;
  date: string;
  coverUrl?: string;
  // Google Photos Integration
  googleAlbumId?: string;
  googleAlbumUrl?: string;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export type IntegrationProvider = 'drive' | 'calendar' | 'maps' | 'photos' | 'sheets';
export type IntegrationStatus = 'disconnected' | 'connected' | 'syncing' | 'error';

export interface IntegrationConfig {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  lastSync?: string;
  accountEmail?: string;
  errorMessage?: string;
}
