// mobile/types/event.types.ts

import type { Guest, GuestStatus } from "@/types/guest.types";

/**
 * Event Types
 */

export interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  maxCapacity: number;
  organizerId: string;
  createdAt: string;
  description?: string;
  bannerBase64?: string;
  rsvpDeadline?: string;

  guests?: { email: string; status: GuestStatus }[];
  totalYes?: number;
  isFull?: boolean;
}

export interface EventWithDetails extends Event {
  organizer: { id: string; name: string; email?: string };
  guests: Guest[];
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  location?: string;
  bannerBase64?: string | null;
  date: string;
  rsvpDeadline: string;
  maxCapacity: number;
  organizerId: string;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  id: string;
}
