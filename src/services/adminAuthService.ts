import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AdminUser {
  email: string;
}

export async function signInAdmin(
  email: string,
  password: string
): Promise<AdminUser> {
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return {
    email: credential.user.email ?? email.trim(),
  };
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function mapAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة.';
    case 'auth/too-many-requests':
      return 'تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة لاحقًا.';
    case 'auth/user-disabled':
      return 'تم تعطيل هذا الحساب.';
    case 'auth/network-request-failed':
      return 'تعذر الاتصال بالشبكة. تحقق من اتصالك بالإنترنت.';
    default:
      return 'تعذر تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
  }
}
