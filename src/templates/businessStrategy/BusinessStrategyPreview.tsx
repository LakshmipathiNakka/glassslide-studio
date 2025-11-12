import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function BusinessStrategyPreview() {
  return (
    <Card className="w-full bg-[#0A2540] text-white rounded-2xl overflow-hidden shadow-lg">
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-2">Business Strategy</h2>
        <p className="text-[#00BFA6] mb-4">Professional. Minimal. Data-Driven.</p>
        <div className="h-2 w-24 bg-[#00BFA6] rounded-full" />
      </CardContent>
    </Card>
  );
}
