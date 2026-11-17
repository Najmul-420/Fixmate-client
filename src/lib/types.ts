export type ServiceCategory =
  | "Smartphone"
  | "Laptop & PC"
  | "AC"
  | "Refrigerator"
  | "TV"
  | "Washing Machine"
  | "Electrical";

export type ServiceMode = "Home Visit" | "Shop Drop-off";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Service = {
  _id: string;
  title: string;
  category: ServiceCategory;
  description?: string;
  image: string;
  basePrice: number;
  estimatedDuration?: string;
  serviceMode: ServiceMode;
  serviceArea?: string;
  technicianName: string;
  technicianEmail?: string;
  /** Optional technician profile fields, when the API provides them. */
  technicianImage?: string | null;
  technicianBio?: string | null;
  approvalStatus: ApprovalStatus;
  isAvailable?: boolean;
  createdAt?: string;
};
