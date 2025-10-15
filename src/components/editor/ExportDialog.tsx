import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Image, Presentation } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'pptx' | 'pdf' | 'png' | 'json') => void;
}

export const ExportDialog = ({ open, onClose, onExport }: ExportDialogProps) => {
  const [selectedFormat, setSelectedFormat] = useState<'pptx' | 'pdf' | 'png' | 'json'>('pptx');

  const exportOptions = [
    {
      format: 'pptx' as const,
      icon: Presentation,
      title: 'PowerPoint',
      description: 'Export as PowerPoint presentation (.pptx)',
      features: ['Editable slides', 'Professional formatting', 'Chart support']
    },
    {
      format: 'pdf' as const,
      icon: FileText,
      title: 'PDF',
      description: 'Export as PDF document',
      features: ['High quality', 'Print ready', 'Universal compatibility']
    },
    {
      format: 'png' as const,
      icon: Image,
      title: 'Images',
      description: 'Export slides as PNG images',
      features: ['High resolution', 'Individual slides', 'Easy sharing']
    },
    {
      format: 'json' as const,
      icon: Download,
      title: 'JSON',
      description: 'Export raw presentation data',
      features: ['Full data', 'Editable format', 'Backup/restore']
    }
  ];

  const handleExport = () => {
    onExport(selectedFormat);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Presentation</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {exportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.format}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedFormat === option.format 
                    ? 'ring-2 ring-accent bg-accent/5' 
                    : 'hover:bg-accent/5'
                }`}
                onClick={() => setSelectedFormat(option.format)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{option.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-accent rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 btn-click btn-shimmer">
            Cancel
          </Button>
          <Button onClick={handleExport} className="bg-black text-white hover:bg-gray-800 transition-all duration-300 btn-click btn-ripple btn-particle">
            Export {exportOptions.find(opt => opt.format === selectedFormat)?.title}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
