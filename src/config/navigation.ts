import type { Role } from '@/types'

export interface NavItem {
  label: string
  icon: string
  route: string
}

export type RoleNavConfig = Record<Role, NavItem[]>

export const navigationConfig: RoleNavConfig = {
  user: [
    { label: 'Ideias', icon: '💡', route: '/ideas' },
    { label: 'Minhas Ideias', icon: '👤', route: '/my-ideas' },
  ],
  developer: [
    { label: 'Ideias', icon: '💡', route: '/ideas' },
    { label: 'Minhas Ideias', icon: '👤', route: '/my-ideas' },
    { label: 'Kanban', icon: '📋', route: '/kanban' },
    { label: 'Ranking', icon: '🏆', route: '/ranking' },
  ],
  admin: [
    { label: 'Dashboard', icon: '📊', route: '/admin/dashboard' },
    { label: 'Ideias', icon: '💡', route: '/admin/ideas' },
    { label: 'Usuários', icon: '👥', route: '/admin/users' },
    { label: 'Ranking', icon: '🏆', route: '/ranking' },
  ],
}

export function getDefaultRoute(role: Role): string {
  return role === 'admin' ? '/admin/dashboard' : '/ideas'
}
