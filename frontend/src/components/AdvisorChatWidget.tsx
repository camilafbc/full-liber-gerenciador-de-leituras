"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  Bot,
  User,
  X,
  RotateCcw,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useAuthContext } from "@/context/authContext";
import { ChatMessage, sendAdvisorMessage } from "@/api/ai";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCleanBookCover } from "@/utils/cleanBookCover";

const QUICK_PROMPTS = [
  {
    label: "Ressaca literária",
    text: "Estou em uma ressaca literária! Me indique um livro dinâmico e envolvente.",
  },
  {
    label: "Baseado nos meus favoritos",
    text: "Com base nas minhas leituras favoritas, o que você me indica ler agora?",
  },
  {
    label: "Suspense inteligente",
    text: "Quero uma boa indicação de suspense psicológico que me prenda do início ao fim.",
  },
  {
    label: "Livro curto e marcante",
    text: "Me indique um livro curto (menos de 250 páginas) que seja memorável.",
  },
];

const STORAGE_KEY_MESSAGES = "liber_advisor_chat_messages";
const STORAGE_KEY_OPEN = "liber_advisor_chat_open";

export function AdvisorChatWidget() {
  const { user, token } = useAuthContext();
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY_OPEN) === "true";
    } catch {
      return false;
    }
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedMessages = sessionStorage.getItem(STORAGE_KEY_MESSAGES);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch {
      return [];
    }
  });
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Salva histórico no sessionStorage sempre que mudar
  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
      } else {
        sessionStorage.removeItem(STORAGE_KEY_MESSAGES);
      }
    } catch (e) {
      console.warn("Erro ao salvar no sessionStorage:", e);
    }
  }, [messages]);

  // Salva estado de aberto/fechado
  const toggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem(STORAGE_KEY_OPEN, String(next));
      } catch {
        // silencia se storage estiver bloqueado
      }
      if (next) {
        setHasUnread(false);
      }
      return next;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Foca no input após abrir
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || loading || !token) return;

    setInputText("");

    const newHistory: ChatMessage[] = [
      ...messages,
      { role: "user", content: message },
    ];
    setMessages(newHistory);
    setLoading(true);

    try {
      const response = await sendAdvisorMessage(message, messages, token);
      const updatedHistory: ChatMessage[] = [
        ...newHistory,
        {
          role: "model",
          content: response.reply,
          recommendedBooks: response.recommendedBooks,
        },
      ];
      setMessages(updatedHistory);
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error) {
      console.error("Erro ao consultar Líber Advisor:", error);
      const isFailedFetch =
        error instanceof TypeError && error.message.includes("fetch");
      setMessages([
        ...newHistory,
        {
          role: "model",
          content: isFailedFetch
            ? "⚠️ Não foi possível se conectar ao servidor da API. Verifique se o backend está rodando no terminal com `npm run dev` na pasta `backend/`."
            : "Desculpe, tive um probleminha para consultar as opções neste momento. Pode tentar me perguntar novamente?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY_MESSAGES);
    } catch {
      // noop
    }
  };

  // Se o usuário não estiver autenticado, não exibe o widget
  if (!user || !token) return null;

  return (
    <>
      {/* Botão Flutuante Fixo (Canto Inferior Direito) */}
      <div className="fixed bottom-16 md:bottom-6 right-6 z-50 flex items-center gap-2">
        <Button
          onClick={toggleOpen}
          aria-label="Abrir Consultor de Leitura"
          className="relative h-13 w-13 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center p-0 border border-white/20"
        >
          {isOpen ? (
            <ChevronDown className="size-6 transition-transform duration-200" />
          ) : (
            <>
              <Sparkles className="size-6 animate-pulse" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 size-3.5 bg-red-500 rounded-full border-2 border-background" />
              )}
            </>
          )}
        </Button>
      </div>

      {/* Janela Flutuante do Chat */}
      {isOpen && (
        <div
          className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[80vh] bg-card/95 backdrop-blur-md border border-border/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
          role="dialog"
          aria-label="Consultor Líber IA"
        >
          {/* Top Bar / Header do Chat */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/70 bg-secondary/40">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                <Sparkles className="size-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-foreground">
                    Consultor Líber
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 h-4 border-accent/40 text-accent font-semibold"
                  >
                    IA
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-none">
                  Consultor literário pessoal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  title="Limpar conversa"
                  className="size-7 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleOpen}
                title="Minimizar chat"
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Área de Mensagens com Scroll */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6 px-3 space-y-4">
                <div className="size-12 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
                  <Bot className="size-6" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-sm font-semibold text-foreground">
                    Olá, {user?.name || "leitor(a)"}!
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sou o seu consultor de leitura. O que você gostaria de
                    explorar hoje?
                  </p>
                </div>

                {/* Sugestões Rápidas */}
                <div className="grid grid-cols-1 gap-2 w-full text-left pt-1">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(prompt.text)}
                      className="p-2.5 rounded-xl border border-border/80 bg-background/80 hover:bg-accent/10 hover:border-accent/40 transition-colors text-left flex flex-col gap-0.5 group cursor-pointer"
                    >
                      <span className="text-[11px] font-semibold text-foreground group-hover:text-accent flex items-center gap-1">
                        <Sparkles className="size-3 text-accent" />
                        {prompt.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {prompt.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={index}
                    className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="size-6.5 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0 mt-0.5">
                        <Sparkles className="size-3.5" />
                      </div>
                    )}

                    <div
                      className={`flex flex-col gap-1.5 max-w-[85%] ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? "bg-accent text-accent-foreground rounded-tr-xs"
                            : "bg-secondary/70 border border-border/70 text-foreground rounded-tl-xs shadow-xs"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Cards de Livros Recomendados com Link para Detalhes */}
                      {!isUser &&
                        msg.recommendedBooks &&
                        msg.recommendedBooks.length > 0 && (
                          <div className="w-full space-y-2 mt-1">
                            <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                              <BookOpen className="size-3 text-accent" />
                              Livros sugeridos:
                            </p>
                            <div className="space-y-2">
                              {msg.recommendedBooks.map((book) => {
                                const cover = book.imageUrl
                                  ? getCleanBookCover(book.imageUrl)
                                  : "/book-fallback.png";

                                return (
                                  <Card
                                    key={book.externalId}
                                    className="overflow-hidden border-border/70 bg-background/80 hover:bg-background transition-colors"
                                  >
                                    <CardContent className="p-2.5 flex gap-2.5 items-start">
                                      <div className="relative w-12 h-18 shrink-0 rounded overflow-hidden bg-muted border border-border/50">
                                        {book.imageUrl ? (
                                          <Image
                                            src={cover}
                                            alt={book.title}
                                            fill
                                            sizes="48px"
                                            className="object-cover"
                                          />
                                        ) : (
                                          <div className="size-full flex items-center justify-center text-muted-foreground">
                                            <BookOpen className="size-4 opacity-40" />
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0 flex flex-col justify-between h-18">
                                        <div>
                                          <h5 className="font-bold text-foreground text-xs truncate">
                                            {book.title}
                                          </h5>
                                          <p className="text-[10px] text-muted-foreground truncate">
                                            {book.authors?.join(", ") ||
                                              "Autor não informado"}
                                          </p>
                                          {book.rationale && (
                                            <p className="text-[10px] text-accent mt-0.5 line-clamp-1 italic">
                                              &ldquo;{book.rationale}&rdquo;
                                            </p>
                                          )}
                                        </div>

                                        {/* Link para a página de detalhes completos do livro */}
                                        <div className="flex items-center justify-between pt-1">
                                          <Link
                                            href={`/books/${book.externalId}`}
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                                          >
                                            <span>Ver detalhes do livro</span>
                                            <ExternalLink className="size-3" />
                                          </Link>

                                          {book.pageCount && (
                                            <span className="text-[10px] text-muted-foreground">
                                              {book.pageCount} pág.
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        )}
                    </div>

                    {isUser && (
                      <div className="size-6.5 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                        <User className="size-3.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Digitando / Carregando */}
            {loading && (
              <div className="flex gap-2 justify-start items-center text-xs text-muted-foreground">
                <div className="size-6 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                  <Sparkles className="size-3 animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 bg-secondary/70 border border-border/70 px-3 py-1.5 rounded-xl rounded-tl-xs shadow-xs text-[11px]">
                  <Loader2 className="size-3 animate-spin text-accent" />
                  <span>Pensando nas melhores indicações...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Campo de Entrada */}
          <div className="p-2.5 border-t border-border/70 bg-secondary/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              className="relative flex items-end gap-1.5 bg-background border border-border/80 rounded-xl p-1.5 focus-within:border-accent/60 transition-colors"
            >
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte ao consultor..."
                rows={1}
                disabled={loading}
                className="flex-1 max-h-24 min-h-[36px] resize-none bg-transparent px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputText.trim() || loading}
                className="size-8 rounded-lg shrink-0"
              >
                {loading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
