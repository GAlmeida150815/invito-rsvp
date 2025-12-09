// mobile/types/guest.types.ts

/**
 * Guest & RSVP Types
 */

export type GuestStatus = "PENDING" | "YES" | "NO" | "MAYBE";

export interface Guest {
  id: string;
  name: string;
  title: string;
  email: string;
  inviteCode: string;
  status: GuestStatus;
  eventId: string;
  createdAt?: string;
}

export interface GuestWithEvent extends Guest {
  event: {
    id: string;
    title: string;
    location: string;
    date: string;
    maxCapacity: number;
    organizerId: string;
    description?: string;
    isFull?: boolean;
  };
}

export interface RSVPPayload {
  inviteCode: string;
  status: GuestStatus;
}

export interface CreateGuestPayload {
  name: string;
  email: string;
  eventId: string;
}
