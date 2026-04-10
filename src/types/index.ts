export interface User {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string | null;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string; // HTML snapshot of the document
  ownerId: string;
  collaborators: string[]; // array of UIDs
  createdAt: number;
  updatedAt: number;
}

export interface Participant {
  uid: string;
  username: string;
  joinedAt: number;
}
