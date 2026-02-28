export interface Fine {
  id: string
  file_url?: string | null
  fine_number: string | null
  fine_date: string | null
  fine_amount: number | null
  location: string | null
  vehicle_plate: string | null
  file_name: string
  status: 'pending' | 'processing' | 'processed' | 'error'
  created_at: string
  updated_at: string
  user_notes?: string
}

export const fineSelectFields =
  'id, file_url, fine_number, fine_date, fine_amount, location, vehicle_plate, file_name, status, created_at, updated_at, user_notes'
