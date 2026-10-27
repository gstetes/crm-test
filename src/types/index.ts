export type VehicleType = 'moto' | 'carro' | 'caminhao';
export type ColumnId = 'contact' | 'contacted' | 'proposal' | 'waiting_inspection' | 'done';

export interface Card {
  id: string;
  user_id: string;
  column: ColumnId;
  position: number;
  name: string;
  phone: string | null;
  plate: string | null;
  vehicle_type: VehicleType | null;
  vehicle_model: string | null;
  referral: boolean;
  referral_name: string | null;
  insurance_activation: number | null;
  insurance_monthly: number | null;
  tracker: boolean;
  tracker_value: number | null;
  notes: string | null;
  created_at: string;
}
