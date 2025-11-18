import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface ChartData {
  title?: string;
  titleFontSize?: number;
  titleFontWeight?: 'normal' | 'bold';
  titleColor?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
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
  const [title, setTitle] = useState<string>('Chart Title');
  const [titleFontSize, setTitleFontSize] = useState<number>(16);
  const [titleFontWeight, setTitleFontWeight] = useState<'normal' | 'bold'>('bold');
  const [titleColor, setTitleColor] = useState<string>('#000000');
  const [labels, setLabels] = useState<string[]>(['Jan', 'Feb', 'Mar', 'Apr', 'May']);
  const [datasets, setDatasets] = useState<{ label: string; data: number[]; color: string | string[] }[]>([
    { label: 'Series 1', data: [65, 59, 80, 81, 56], color: '#3B82F6' }
  ]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || 'Chart Title');
      setTitleFontSize(initialData.titleFontSize || 16);
      setTitleFontWeight(initialData.titleFontWeight || 'bold');
      setTitleColor(initialData.titleColor || '#000000');
      setLabels(initialData.labels);
      setDatasets(initialData.datasets.map(ds => ({
        label: ds.label,
        data: ds.data,
        // For pie charts, backgroundColor is an array of colors
        color: ds.backgroundColor || '#3B82F6'
      })));
    }
    if (initialType) {
      setChartType(initialType);
    }
  }, [initialData, initialType]);

  // Enforce single dataset for pie charts and keep labels/data in sync
  useEffect(() => {
    if (chartType === 'pie') {
      // keep only first dataset
      setDatasets(prev => {
        const first = prev[0] || { label: 'Series 1', data: labels.map(() => 0), color: [] };
        // sync data length to labels length
        let data = first.data.slice(0, labels.length);
        if (data.length < labels.length) {
          data = [...data, ...new Array(labels.length - data.length).fill(0)];
        }
        
        // For pie charts, ensure color is an array matching label count
        let colors: string[];
        if (Array.isArray(first.color)) {
          colors = first.color.slice(0, labels.length);
          // Fill missing colors with random colors
          while (colors.length < labels.length) {
            colors.push(`hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`);
          }
        } else {
          // Convert single color to array of random colors
          colors = labels.map((_, i) => `hsl(${(i * 360 / labels.length)}, 70%, 60%)`);
        }
        
        return [{ ...first, data, color: colors }];
      });
    }
  }, [chartType, labels]);

  const addDataset = () => {
    if (chartType === 'pie') return; // disallow multiple datasets for pie
    const newDataset = {
      label: `Series ${datasets.length + 1}`,
      data: new Array(labels.length).fill(0),
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    };
    setDatasets([...datasets, newDataset]);
  };

  const removeDataset = (index: number) => {
    if (chartType === 'pie') return; // cannot remove the only dataset in pie
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
    setDatasets(datasets.map(ds => {
      const newData = [...ds.data, 0];
      // For pie charts, also add a new color to the color array
      if (chartType === 'pie' && Array.isArray(ds.color)) {
        const newColors = [...ds.color, `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`];
        return { ...ds, data: newData, color: newColors };
      }
      return { ...ds, data: newData };
    }));
  };

  const removeLabel = (index: number) => {
    if (labels.length > 1) {
      setLabels(labels.filter((_, i) => i !== index));
      setDatasets(datasets.map(ds => {
        const newData = ds.data.filter((_, i) => i !== index);
        // For pie charts, also remove the corresponding color from the color array
        if (chartType === 'pie' && Array.isArray(ds.color)) {
          const newColors = ds.color.filter((_, i) => i !== index);
          return { ...ds, data: newData, color: newColors };
        }
        return { ...ds, data: newData };
      }));
    }
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };

  const handleSave = () => {
    const chartData: ChartData = {
      title,
      titleFontSize,
      titleFontWeight,
      titleColor,
      labels,
      datasets: datasets.map(ds => {
        // For pie charts, backgroundColor should be an array of colors
        // For bar/line charts, it should be a single color
        const backgroundColor = chartType === 'pie' 
          ? (Array.isArray(ds.color) ? ds.color : [ds.color])
          : (Array.isArray(ds.color) ? ds.color[0] : ds.color);
        
        const borderColor = chartType === 'pie'
          ? (Array.isArray(ds.color) ? ds.color : [ds.color])
          : (chartType === 'line' ? (Array.isArray(ds.color) ? ds.color[0] : ds.color) : undefined);
        
        return {
          label: ds.label,
          data: ds.data,
          backgroundColor,
          borderColor,
        };
      })
    };
    onSave(chartData, chartType);
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Chart Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Chart Title Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Chart Title</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chart-title">Title Text</Label>
                  <Input
                    id="chart-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter chart title"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title-size">Size</Label>
                    <Input
                      id="title-size"
                      type="number"
                      min="8"
                      max="36"
                      value={titleFontSize}
                      onChange={(e) => setTitleFontSize(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title-weight">Weight</Label>
                    <select
                      id="title-weight"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={titleFontWeight}
                      onChange={(e) => setTitleFontWeight(e.target.value as 'normal' | 'bold')}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title-color">Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="title-color"
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="h-10 w-10 cursor-pointer rounded-md border"
                      />
                      <Input
                        value={titleColor}
                        onChange={(e) => setTitleColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart Type Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Chart Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  onClick={() => setChartType('bar')}
                  className="flex-col h-auto py-3"
                >
                  <span className="text-lg">📊</span>
                  <span className="text-xs mt-1">Bar</span>
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  onClick={() => setChartType('line')}
                  className="flex-col h-auto py-3"
                >
                  <span className="text-lg">📈</span>
                  <span className="text-xs mt-1">Line</span>
                </Button>
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  onClick={() => setChartType('pie')}
                  className="flex-col h-auto py-3"
                >
                  <span className="text-lg">🥧</span>
                  <span className="text-xs mt-1">Pie</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Editor */}
          {chartType === 'pie' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Slices (Label & Value)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div className="text-xs font-medium text-muted-foreground">Label</div>
                  <div className="text-xs font-medium text-muted-foreground">Value</div>
                  <div className="hidden sm:block text-xs font-medium text-muted-foreground">Color</div>
                  <div className="text-xs font-medium text-muted-foreground">Actions</div>
                </div>
                <div className="space-y-2 mt-1">
                  {labels.map((label, index) => (
                    <div key={index} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 items-center">
                      <Input
                        value={label}
                        onChange={(e) => updateLabel(index, e.target.value)}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={datasets[0]?.data[index] ?? 0}
                        onChange={(e) => updateDataPoint(0, index, parseFloat(e.target.value) || 0)}
                        className="w-full"
                      />
                      <Input
                        type="color"
                        value={datasets[0]?.color || '#000000'}
                        onChange={(e) => updateDataset(0, 'color', e.target.value)}
                        className="w-12 h-10 p-1 hidden sm:block"
                      />
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => removeLabel(index)} disabled={labels.length === 1} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addLabel} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Slice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
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
            </>
          )}
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
