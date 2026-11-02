"use client";

import { Card } from "@/components/ui/card";
import { Book } from "@/types/Book";

interface BookDetailsProps {
  data: Book;
}

export const BookDetails = ({ data }: BookDetailsProps) => {
  return (
    <Card>
      <p>{data.title}</p>
    </Card>
  );
};
