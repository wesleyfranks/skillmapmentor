export interface UserData {
  resume_id: string;
  user_id: string;
  file_path: string | null;
  resume_text: string | null;
  keywords: string[] | null;
  non_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export type UserUpdateData = Partial<UserData>;
