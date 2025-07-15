export interface CustomerTag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerTagWithUsage extends CustomerTag {
  customerCount: number;
  customers?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}
