import { BarChart3, LineChart, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface ChartPanelProps {
  open: boolean;
  onClose: () => void;
  onAddChart: (type: 'bar' | 'line' | 'pie', data: any) => void;
}

export const ChartPanel = ({ open, onClose, onAddChart }: ChartPanelProps) => {
  const [selectedType, setSelectedType] = useState<'bar' | 'line' | 'pie'>('bar');

  const handleCreate = () => {
    // Default sample data
    const defaultData = {
      bar: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
          label: 'Sales',
          data: [65, 59, 80, 81, 56],
          backgroundColor: 'hsl(var(--accent))',
        }]
      },
      line: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Growth',
          data: [30, 45, 60, 70],
          borderColor: 'hsl(var(--accent))',
          backgroundColor: 'hsla(var(--accent), 0.1)',
        }]
      },
      pie: {
        labels: ['Product A', 'Product B', 'Product C'],
        datasets: [{
          data: [300, 150, 100],
          backgroundColor: [
            'hsl(var(--accent))',
            'hsl(var(--muted))',
            'hsl(var(--foreground))',
          ],
        }]
      }
    };

    onAddChart(selectedType, defaultData[selectedType]);
    onClose();
  };

  const chartTypes = [
    { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart' },
    { type: 'line' as const, icon: LineChart, label: 'Line Chart' },
    { type: 'pie' as const, icon: PieChart, label: 'Pie Chart' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Insert Chart</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {chartTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-6 rounded-lg border-2 transition-all hover:border-accent ${
                  selectedType === type 
                    ? 'border-accent bg-accent/5' 
                    : 'border-border'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2 text-foreground" />
                <p className="text-xs text-center text-muted-foreground">{label}</p>
              </button>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreate} className="bg-foreground text-background hover:bg-foreground/90">
              Insert Chart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
