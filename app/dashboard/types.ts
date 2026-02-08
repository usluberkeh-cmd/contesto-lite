export interface Fine {
  id: string
  file_url?: string | null
  fine_number: string
  fine_date: string
  fine_amount: number | null
  location: string | null
  vehicle_plate: string
  file_name: string
  status: 'pending' | 'analyzing' | 'reviewed' | 'submitted' | 'resolved' | 'rejected'
  created_at: string
  updated_at: string
  user_notes?: string
}

export const fineSelectFields =
  'id, file_url, fine_number, fine_date, fine_amount, location, vehicle_plate, file_name, status, created_at, updated_at, user_notes'
