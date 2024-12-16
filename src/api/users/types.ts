export interface UserData {
  resume_text: string | null;
  keywords: string[];
  non_keywords: string[];
}

export type UserUpdateData = Partial<UserData>;