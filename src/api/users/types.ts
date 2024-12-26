export interface UserData {
  resume_text: string | null;
  keywords: string[] | null;
  non_keywords: string[] | null;
}

export type UserUpdateData = Partial<UserData>;
