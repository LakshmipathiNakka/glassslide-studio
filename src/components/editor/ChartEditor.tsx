import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, BarChart3, LineChart, PieChart } from "lucide-react";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

interface ChartEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (chartData: ChartData, chartType: 'bar' | 'line' | 'pie') => void;
  initialData?: ChartData;
  initialType?: 'bar' | 'line' | 'pie';
}

export const ChartEditor = ({ open, onClose, onSave, initialData, initialType }: ChartEditorProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [labels, setLabels] = useState<string[]>(['Jan', 'Feb', 'Mar', 'Apr', 'May']);
  const [datasets, setDatasets] = useState<{ label: string; data: number[]; color: string }[]>([
    { label: 'Series 1', data: [65, 59, 80, 81, 56], color: '#000000' }
  ]);

  useEffect(() => {
    if (initialData) {
      setLabels(initialData.labels);
      setDatasets(initialData.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        color: ds.backgroundColor || '#000000'
      })));
    }
    if (initialType) {
      setChartType(initialType);
    }
  }, [initialData, initialType]);

  const addDataset = () => {
    const newDataset = {
      label: `Series ${datasets.length + 1}`,
      data: new Array(labels.length).fill(0),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    setDatasets([...datasets, newDataset]);
  };

  const removeDataset = (index: number) => {
    if (datasets.length > 1) {
      setDatasets(datasets.filter((_, i) => i !== index));
    }
  };

  const updateDataset = (index: number, field: string, value: any) => {
    const newDatasets = [...datasets];
    newDatasets[index] = { ...newDatasets[index], [field]: value };
    setDatasets(newDatasets);
  };

  const updateDataPoint = (datasetIndex: number, dataIndex: number, value: number) => {
    const newDatasets = [...datasets];
    newDatasets[datasetIndex].data[dataIndex] = value;
    setDatasets(newDatasets);
  };

  const addLabel = () => {
    setLabels([...labels, `Label ${labels.length + 1}`]);
    setDatasets(datasets.map(ds => ({ ...ds, data: [...ds.data, 0] })));
  };

  const removeLabel = (index: number) => {
    if (labels.length > 1) {
      setLabels(labels.filter((_, i) => i !== index));
      setDatasets(datasets.map(ds => ({
        ...ds,
        data: ds.data.filter((_, i) => i !== index)
      })));
    }
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };

  const handleSave = () => {
    const chartData: ChartData = {
      labels,
      datasets: datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: chartType === 'pie' ? ds.color : undefined,
        borderColor: chartType === 'line' ? ds.color : undefined,
      }))
    };
    onSave(chartData, chartType);
  };

  const chartTypes = [
    { type: 'bar' as const, icon: BarChart3, label: 'Bar Chart' },
    { type: 'line' as const, icon: LineChart, label: 'Line Chart' },
    { type: 'pie' as const, icon: PieChart, label: 'Pie Chart' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Chart Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Chart Type Selection */}
          <div>
            <Label className="text-sm font-medium">Chart Type</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {chartTypes.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`p-4 rounded-lg border-2 transition-all hover:border-accent ${
                    chartType === type 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-xs text-center">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Labels Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Labels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {labels.map((label, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={label}
                      onChange={(e) => updateLabel(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLabel(index)}
                      disabled={labels.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLabel}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Label
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Series Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Data Series</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {datasets.map((dataset, datasetIndex) => (
                  <div key={datasetIndex} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Input
                        value={dataset.label}
                        onChange={(e) => updateDataset(datasetIndex, 'label', e.target.value)}
                        className="flex-1"
                        placeholder="Series name"
                      />
                      <Input
                        type="color"
                        value={dataset.color}
                        onChange={(e) => updateDataset(datasetIndex, 'color', e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDataset(datasetIndex)}
                        disabled={datasets.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {dataset.data.map((value, dataIndex) => (
                        <div key={dataIndex} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            {labels[dataIndex]}
                          </Label>
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => updateDataPoint(datasetIndex, dataIndex, parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addDataset}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Data Series
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="bg-transparent text-gray-600 hover:bg-gray-200 hover:text-black transition-all duration-300 btn-click btn-shimmer">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800 transition-all duration-300 btn-click btn-ripple btn-particle">
            Save Chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
