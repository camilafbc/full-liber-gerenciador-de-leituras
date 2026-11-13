import { apiFetchClient } from "./client";

export interface RecommendedBookCard {
  externalId: string;
  title: string;
  authors: string[];
  imageUrl?: string;
  description: string;
  pageCount?: string;
  publishedDate?: string;
  rationale?: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  recommendedBooks?: RecommendedBookCard[];
}

export interface ChatApiResponse {
  reply: string;
  recommendedBooks: RecommendedBookCard[];
}

export const sendAdvisorMessage = async (
  message: string,
  history: ChatMessage[],
  token: string,
): Promise<ChatApiResponse> => {
  // Envia apenas o role e content para a API
  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await apiFetchClient("/ai/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history: formattedHistory,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || `Falha ao consultar o Líber Advisor (Status ${response.status})`,
    );
  }

  return response.json();
};
