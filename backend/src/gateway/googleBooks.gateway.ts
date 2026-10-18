interface GoogleBooksData {
  externalId: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publishedDate: string;
  description: string;
  pageCount: string;
  publisher?: string;
  categories: string[];
  imageUrl?: string;
  isbn13?: string;
  isbn10?: string;
}

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors: string[];
    publishedDate: string;
    description: string;
    pageCount: string;
    publisher?: string;
    categories: string[];
    imageLinks?: { thumbnail?: string };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

export const googleBooksGateway = {
  searchBooks: async (
    query: string,
    page: number,
    limit: number,
  ): Promise<{ totalItems: number; books: GoogleBooksData[] }> => {
    const API_KEY = process.env.GOOGLE_BOOKS_KEY;
    const cleanQuery = query.replace(/^\?q=/, "").trim();
    const startIndex = (page - 1) * limit;
    const keyParam = API_KEY ? `&key=${API_KEY}` : "";

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(cleanQuery)}&startIndex=${startIndex}&maxResults=${limit}&printType=books${keyParam}&orderBy=relevance&projection=lite&langRestrict=pt`;

    // Google Books API ocasionalmente oscila com 503 backendFailed.
    // Implementamos até 2 tentativas automáticas com pequeno delay para garantir estabilidade.
    let response: Response | null = null;
    let lastError = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch(url);
        if (response.ok) break;

        const errorText = await response.text().catch(() => "");
        lastError = `Google Books API retornou status ${response.status}: ${errorText}`;
        console.warn(
          `Tentativa ${attempt}/3 falhou para "${cleanQuery}":`,
          lastError,
        );

        // Se for erro transitório 503/500/429, aguarda 400ms antes de tentar novamente
        if (
          [500, 502, 503, 504, 429].includes(response.status) &&
          attempt < 3
        ) {
          await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
          continue;
        }

        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`Erro na tentativa ${attempt}/3:`, lastError);
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
        }
      }
    }

    if (!response || !response.ok) {
      console.error("Falha persistente na busca do Google Books:", lastError);
      throw new Error("Falha ao buscar livros na API do Google");
    }

    const data = (await response.json()) as {
      items?: GoogleBookItem[];
      totalItems?: number;
    };

    if (!data) return { totalItems: 0, books: [] };

    const books = (data.items ?? []).map((item: GoogleBookItem) => ({
      externalId: item.id,
      authors: item.volumeInfo.authors,
      title: item.volumeInfo.title,
      subtitle: item.volumeInfo.subtitle,
      publishedDate: item.volumeInfo.publishedDate,
      description: item.volumeInfo.description,
      pageCount: item.volumeInfo.pageCount,
      publisher: item.volumeInfo.publisher,
      categories: item.volumeInfo.categories,
      imageUrl: item.volumeInfo.imageLinks?.thumbnail,
      isbn13: item.volumeInfo.industryIdentifiers?.find(
        (identifier) => identifier.type === "ISBN_13",
      )?.identifier,
      isbn10: item.volumeInfo.industryIdentifiers?.find(
        (identifier) => identifier.type === "ISBN_10",
      )?.identifier,
    }));

    return { totalItems: data.totalItems || 0, books };
  },

  getBookId: async (id: string): Promise<GoogleBooksData | null> => {
    const API_KEY = process.env.GOOGLE_BOOKS_KEY;
    const keyParam = API_KEY ? `?key=${API_KEY}` : "";
    const URL = `https://www.googleapis.com/books/v1/volumes/${id}${keyParam}`;

    const response = await fetch(URL);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        `Google Books API getBookId erro ${response.status}:`,
        errorText,
      );
      throw new Error("Erro ao buscar livro");
    }

    const data = (await response.json()) as GoogleBookItem;

    if (!data) return null;

    return {
      externalId: data.id,
      authors: data.volumeInfo.authors,
      title: data.volumeInfo.title,
      subtitle: data.volumeInfo.subtitle,
      publishedDate: data.volumeInfo.publishedDate,
      description: data.volumeInfo.description,
      pageCount: data.volumeInfo.pageCount,
      publisher: data.volumeInfo.publisher,
      categories: data.volumeInfo.categories,
      imageUrl: data.volumeInfo.imageLinks?.thumbnail,
      isbn13: data.volumeInfo.industryIdentifiers?.find(
        (identifier) => identifier.type === "ISBN_13",
      )?.identifier,
      isbn10: data.volumeInfo.industryIdentifiers?.find(
        (identifier) => identifier.type === "ISBN_10",
      )?.identifier,
    };
  },
};
