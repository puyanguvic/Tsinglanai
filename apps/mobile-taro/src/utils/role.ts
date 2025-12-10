import { Role } from '@tsinglan/shared-types';

export const isTeacher = (role?: Role) => role === 'TEACHER';
export const isStudent = (role?: Role) => role === 'STUDENT';
export const isAdmin = (role?: Role) => role === 'ADMIN';
