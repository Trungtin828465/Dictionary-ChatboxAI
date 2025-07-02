// Type definitions will go here
export interface User {
  id?: string;
  email?: string;
  username?: string;
  phone?: string;
  token?: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  // Add more vocabulary properties as needed
}
