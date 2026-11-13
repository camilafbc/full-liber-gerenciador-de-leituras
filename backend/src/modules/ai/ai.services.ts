import { GoogleGenAI } from "@google/genai";
import { prisma } from "../../libs/prisma";
import { googleBooksGateway } from "../../gateway/googleBooks.gateway";
import {
  ChatResponsePayload,
  RecommendedBookCard,
  UserReadingContext,
} from "./ai.types";
import { ChatMessage } from "./ai.schemas";

interface RawAiBookRecommendation {
  title: string;
  author: string;
  rationale?: string;
}

interface RawAiResponse {
  reply: string;
  recommendedBooks?: RawAiBookRecommendation[];
}

export const getUserReadingContext = async (
  userId: number,
): Promise<UserReadingContext> => {
  const libraryEntries = await prisma.library.findMany({
    where: {
      userId,
      active: true,
    },
    include: {
      book: {
        include: {
          reviews: {
            where: { userId },
            select: { rating: true, comment: true },
          },
        },
      },
    },
    take: 50,
    orderBy: { updatedAt: "desc" },
  });

  const favorites: UserReadingContext["favorites"] = [];
  const dropped: UserReadingContext["dropped"] = [];
  const alreadyInLibrary: UserReadingContext["alreadyInLibrary"] = [];

  for (const entry of libraryEntries) {
    const bookTitle = entry.book.title;
    const authors = entry.book.authors;
    const review = entry.book.reviews[0];

    alreadyInLibrary.push({
      title: bookTitle,
      authors,
      status: entry.status,
    });

    if (entry.status === "DROPPED") {
      dropped.push({
        title: bookTitle,
        authors,
      });
    }

    if (
      (entry.status === "COMPLETED" && (!review || review.rating >= 4)) ||
      (review && review.rating >= 4)
    ) {
      favorites.push({
        title: bookTitle,
        authors,
        rating: review?.rating,
        comment: review?.comment,
      });
    }
  }

  return {
    favorites: favorites.slice(0, 10),
    dropped: dropped.slice(0, 10),
    alreadyInLibrary,
  };
};

export const buildSystemInstruction = (
  userName: string,
  context: UserReadingContext,
): string => {
  const favoritesText =
    context.favorites.length > 0
      ? context.favorites
          .map(
            (f) =>
              `- "${f.title}" (${f.authors.join(", ") || "Autor desconhecido"})${
                f.rating ? ` - Nota: ${f.rating}/5` : ""
              }${f.comment ? ` | Opinião: "${f.comment}"` : ""}`,
          )
          .join("\n")
      : "Nenhum livro concluído com alta avaliação registrado ainda.";

  const droppedText =
    context.dropped.length > 0
      ? context.dropped
          .map(
            (d) =>
              `- "${d.title}" (${d.authors.join(", ") || "Autor desconhecido"})`,
          )
          .join("\n")
      : "Nenhum livro abandonado registrado.";

  const libraryTitlesText =
    context.alreadyInLibrary.length > 0
      ? context.alreadyInLibrary.map((b) => `"${b.title}"`).join(", ")
      : "Nenhum livro na biblioteca ainda.";

  return `Você é o Líber, um consultor literário inteligente, sagaz, acolhedor e leitor voraz. Você atua como curador e parceiro de leituras do(a) usuário(a) chamado(a) ${userName}.

Suas características e tom:
- Escreva em português do Brasil com naturalidade, cordialidade, entusiasmo literário e sem clichês vazios.
- Use formatação Markdown (negrito, tópicos quando ajudar, parágrafos fluidos).
- Seja empático com o ritmo de leitura da usuária.
- Se for propício no assunto (ao sugerir ritmo, falar de ressaca literária ou preferências), você tem total liberdade para fazer menções sutis e bem-humoradas a livros que ela abandonou (DROPPED), quebrando o gelo e mostrando que realmente conhece a estante dela (exemplo: "Prometo que não vou sugerir nada arrastado como aquele livro que você abandonou!"). Mas faça isso sempre com carinho e sem julgamentos.

HISTÓRICO DO LEITOR:
1. Livros favoritos ou bem avaliados (Use como base do que ela gosta):
${favoritesText}

2. Livros abandonados (DROPPED - Evite estilos similares e brinque com isso com bom humor quando apropriado):
${droppedText}

3. Livros já presentes na biblioteca da usuária (REGRA ABSOLUTA: NUNCA recomende nenhum destes títulos, pois ela já os possui):
${libraryTitlesText}

INSTRUÇÃO DE RESPOSTA (MUITO IMPORTANTE):
Você DEVE SEMPRE responder em JSON estrito contendo exatamente os dois campos:
{
  "reply": "Sua resposta conversacional em markdown dialogando com a usuária...",
  "recommendedBooks": [
    {
      "title": "Título exato e consagrado do livro recomendado",
      "author": "Nome do autor",
      "rationale": "Breve frase personalizada explicando por que combina com ela"
    }
  ]
}

Se o/a usuário(a) apenas te cumprimentar, fizer uma pergunta sem pedir sugestões de livros ou apenas conversar, deixe "recommendedBooks": [].
Quando recomendar livros, sugira de 1 a no máximo 3 livros por mensagem, focando em alta relevância e precisão nos nomes de títulos e autores.`;
};

export const enrichRecommendedBooks = async (
  rawBooks: RawAiBookRecommendation[] = [],
): Promise<RecommendedBookCard[]> => {
  const enriched: RecommendedBookCard[] = [];

  for (const raw of rawBooks.slice(0, 3)) {
    try {
      const query = `${raw.title} ${raw.author}`.trim();
      let searchResult = await googleBooksGateway.searchBooks(query, 1, 1);

      // Se não achou na busca combinada, tenta só pelo título
      if (!searchResult.books || searchResult.books.length === 0) {
        searchResult = await googleBooksGateway.searchBooks(raw.title, 1, 1);
      }

      if (searchResult.books && searchResult.books.length > 0) {
        const found = searchResult.books[0];
        enriched.push({
          externalId: found.externalId,
          title: found.title || raw.title,
          authors:
            found.authors && found.authors.length > 0
              ? found.authors
              : [raw.author],
          imageUrl: found.imageUrl,
          description: found.description || "",
          pageCount: found.pageCount,
          publishedDate: found.publishedDate,
          rationale: raw.rationale,
        });
      }
    } catch (error) {
      console.warn(`Não foi possível enriquecer livro "${raw.title}":`, error);
    }
  }

  return enriched;
};

export const chatWithAdvisor = async (
  userId: number,
  userName: string,
  userMessage: string,
  history: ChatMessage[] = [],
): Promise<ChatResponsePayload> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      reply:
        "Olá! Meu motor de inteligência artificial ainda precisa ser configurado com uma chave de API do Gemini (`GEMINI_API_KEY`). Por favor, configure a chave no servidor para que eu possa analisar sua biblioteca e te dar recomendações personalizadas!",
      recommendedBooks: [],
    };
  }

  const context = await getUserReadingContext(userId);
  const systemInstruction = buildSystemInstruction(userName, context);

  const ai = new GoogleGenAI({ apiKey });

  // Mapeia histórico para o formato do Gemini
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  try {
    const candidateModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
    ];

    let responseText = "";

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (modelError) {
        console.warn(`Tentativa com modelo ${model} falhou:`, modelError);
        // Aguarda um pequeno intervalo antes de tentar o próximo modelo (backoff)
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!responseText) {
      throw new Error(
        "Não foi possível obter resposta dos modelos disponíveis.",
      );
    }
    let parsed: RawAiResponse;

    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Fallback caso a LLM não retorne JSON perfeitamente válido
      parsed = {
        reply: responseText,
        recommendedBooks: [],
      };
    }

    const reply = parsed.reply || "Aqui estão algumas sugestões para você:";
    const recommendedBooks = await enrichRecommendedBooks(
      parsed.recommendedBooks || [],
    );

    return {
      reply,
      recommendedBooks,
    };
  } catch (error) {
    console.error("Erro ao comunicar com a API do Gemini:", error);
    throw new Error(
      "Ocorreu uma falha ao consultar o consultor de leitura. Tente novamente em instantes.",
    );
  }
};
