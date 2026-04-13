// ---------------------------------------------------------------------------
// Auth / Users
// ---------------------------------------------------------------------------

export type Role = 'user' | 'developer' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: Role
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: Role
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

// ---------------------------------------------------------------------------
// Ideas
// ---------------------------------------------------------------------------

export type IdeaStatus = 'idea' | 'evaluation' | 'development' | 'completed' | 'archived'
export type IdeaCategory =
  | 'Natural Language Processing'
  | 'Computer Vision'
  | 'Process Automation'
  | 'Data Analytics'
  | 'Generative AI'
  | 'Other'

export interface Idea {
  id: string
  title: string
  description: string
  category: IdeaCategory | null
  status: IdeaStatus
  author_id: string
  author?: User
  votes_count: number
  has_voted?: boolean
  collaborators?: Collaborator[]
  created_at: string
  updated_at: string
}

export interface IdeaCreate {
  title: string
  description: string
}

export interface IdeaUpdate {
  title?: string
  description?: string
  status?: IdeaStatus
  category?: string | null
}

export interface IdeaFilters {
  page: number
  per_page: number
  sort_by: 'created_at' | 'votes_count' | 'title'
  order: 'asc' | 'desc'
  status?: IdeaStatus
  category?: IdeaCategory
  search?: string
  author_id?: string
  collaborator_id?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

// ---------------------------------------------------------------------------
// Collaboration
// ---------------------------------------------------------------------------

export interface Collaborator {
  id: string
  user_id: string
  idea_id: string
  role: 'lead' | 'contributor'
  joined_at: string
  user?: User
}

export interface Comment {
  id: string
  content: string
  user_id: string
  idea_id: string
  created_at: string
  user?: User
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

export interface RankingEntry {
  rank: number
  user_id: string
  name: string
  avatar_url: string | null
  completed_count: number
  in_progress_count: number
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export interface AdminStats {
  total_ideas: number
  ideas_by_status: Record<IdeaStatus, number>
  ideas_by_category: Record<string, number>
  active_collaborators: number
}
