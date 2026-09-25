export interface CitizenAccessUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  documentNumber: string | null;
  active: boolean;
}

export interface CitizenAccessPayload {
  linked: boolean;
  user: CitizenAccessUserDto | null;
}