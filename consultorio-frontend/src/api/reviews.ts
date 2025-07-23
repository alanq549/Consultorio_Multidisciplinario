import { apiFetch } from "./base";

export interface ReviewClient {
  id: number;
  rating: number;
  comment: string;
  clientId: number;
  professionalId: number;
  createdAt: string;
  client: {
    id: number;
    name: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface RatingSummary {
  averageRating: number;
  average: number;
  totalReviews: number;
}

export async function getProfessionalReviews(professionalId: number): Promise<ReviewClient[]> {
  return apiFetch(`/reviews/professional/${professionalId}`);
}

export async function getProfessionalRating(professionalId: number): Promise<RatingSummary> {
  return apiFetch(`/reviews/professional/${professionalId}/rating`);
}

// Para crear reseña, si quieres más adelante
export async function createReview(data: {
  professionalId: number;
  rating: number;
  comment?: string;
}) {
  return apiFetch("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
