"use client";

import { Card } from "@/components/ui/card";

interface BookDetailsProps {
  data: any;
}

export const BookDetails = ({ data }: BookDetailsProps) => {
  return (
    <Card>
      <p>{data.title}</p>
    </Card>
  );
};
