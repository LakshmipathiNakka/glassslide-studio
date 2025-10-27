import React, { useState, useEffect } from 'react';
import { SlideElement } from '../../types/canvas';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Slider } from '../../components/ui/slider';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Palette, Table, LayoutGrid, Type, Rows, Columns, Minus, Plus, Droplet } from 'lucide-react';
import { TABLE_THEMES, applyTableTheme, TableTheme } from '../../constants/tableThemes';

interface TablePropertiesPanelProps {
  selectedElement: SlideElement;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onClose: () => void;
}

export const TablePropertiesPanel: React.FC<TablePropertiesPanelProps> = ({ selectedElement, onUpdate, onClose }) => {
  const [localElement, setLocalElement] = useState<SlideElement>(selectedElement);
  const [activeTab, setActiveTab] = useState('themes');

  useEffect(() => {
    setLocalElement(selectedElement);
  }, [selectedElement]);

  const handlePropertyChange = (key: keyof SlideElement, value: any) => {
    setLocalElement(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onUpdate(localElement);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleThemeSelect = (theme: TableTheme) => {
    const updatedElement = applyTableTheme(localElement, theme);
    setLocalElement(updatedElement);
  };

  const handleAddRow = () => {
    const newRows = (localElement.rows || 1) + 1;
    const newTableData = [...(localElement.tableData || [])];
    const numCols = localElement.cols || 1;
    newTableData.push(Array(numCols).fill(''));
    handlePropertyChange('rows', newRows);
    handlePropertyChange('tableData', newTableData);  };

  const handleRemoveRow = () => {
    if ((localElement.rows || 1) > 1) {
      const newRows = (localElement.rows || 1) - 1;
      const newTableData = [...(localElement.tableData || [])];
      newTableData.pop();
      handlePropertyChange('rows', newRows);
      handlePropertyChange('tableData', newTableData);
    }
  };

  const handleAddColumn = () => {
    const newCols = (localElement.cols || 1) + 1;
    const newTableData = (localElement.tableData || []).map(row => [...row, '']);
    handlePropertyChange('cols', newCols);
    handlePropertyChange('tableData', newTableData);
  };

  const handleRemoveColumn = () => {
    if ((localElement.cols || 1) > 1) {
      const newCols = (localElement.cols || 1) - 1;
      const newTableData = (localElement.tableData || []).map(row => row.slice(0, newCols));
      handlePropertyChange('cols', newCols);
      handlePropertyChange('tableData', newTableData);
    }
  };

  const renderThemePreview = (theme: TableTheme) => {
    return (
      <div 
        key={theme.id}
        className={`relative rounded-lg p-2 border-2 ${localElement.themeId === theme.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'} cursor-pointer transition-colors`}
        onClick={() => handleThemeSelect(theme)}
      >
        <div className="flex flex-col w-full h-24 overflow-hidden rounded-md border border-gray-200">
          {/* Header */}
          <div 
            className="h-4 w-full flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: theme.headerBg, color: theme.headerTextColor }}
          >
            Header
          </div>
          {/* Rows */}
          <div className="flex-1 flex flex-col">
            {[0, 1].map((row) => (
              <div 
                key={row}
                className={`h-3 w-full ${row % 2 === 0 ? 'opacity-80' : 'opacity-60'}`}
                style={{ 
                  backgroundColor: row % 2 === 0 ? theme.rowEvenBg : theme.rowOddBg,
                  color: theme.textColor
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-2 text-xs font-medium text-center text-gray-700">
          {theme.name}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Table className="w-6 h-6" /> Table Properties
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Palette className="w-4 h-4" /> Themes
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-2">
              <Droplet className="w-4 h-4" /> Customize
            </TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {TABLE_THEMES.map(theme => renderThemePreview(theme))}
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            {/* Table Structure */}
            <Accordion type="single" collapsible defaultValue="table-structure">
              <AccordionItem value="table-structure">
                <AccordionTrigger className="text-lg font-semibold">Table Structure</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Rows: {localElement.rows || 1}</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={handleRemoveRow} disabled={(localElement.rows || 1) <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleAddRow}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Columns: {localElement.cols || 1}</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={handleRemoveColumn} disabled={(localElement.cols || 1) <= 1}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleAddColumn}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Table Styling */}
            <Accordion type="single" collapsible defaultValue="table-styling">
              <AccordionItem value="table-styling">
                <AccordionTrigger className="text-lg font-semibold">Table Styling</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {/* Header Row Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="header-toggle">Header Row</Label>
                    <Switch
                      id="header-toggle"
                      checked={localElement.header || false}
                      onCheckedChange={(checked) => handlePropertyChange('header', checked)}
                    />
                  </div>

                  {/* Alternating Row Background */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="row-alt-bg-toggle">Alternating Row Background</Label>
                    <Switch
                      id="row-alt-bg-toggle"
                      checked={!!localElement.rowAltBg}
                      onCheckedChange={(checked) => handlePropertyChange('rowAltBg', checked ? '#f5f5f5' : null)}
                    />
                  </div>

                  {/* Cell Padding */}
                  <div>
                    <Label className="text-sm font-medium">Cell Padding: {localElement.cellPadding || 0}px</Label>
                    <Slider
                      value={[localElement.cellPadding || 0]}
                      onValueChange={([value]) => handlePropertyChange('cellPadding', value)}
                      min={0} max={20} step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Border Width */}
                  <div>
                    <Label className="text-sm font-medium">Border Width: {localElement.borderWidth || 0}px</Label>
                    <Slider
                      value={[localElement.borderWidth || 0]}
                      onValueChange={([value]) => handlePropertyChange('borderWidth', value)}
                      min={0} max={5} step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Border Color */}
                  <div>
                    <Label className="text-sm font-medium">Border Color</Label>
                    <Input
                      type="color"
                      value={localElement.borderColor || '#D9D9D9'}
                      onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Table Background Color */}
                  <div>
                    <Label className="text-sm font-medium">Table Background Color</Label>
                    <Input
                      type="color"
                      value={localElement.tableBackground || '#FFFFFF'}
                      onChange={(e) => handlePropertyChange('tableBackground', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Header Background Color */}
                  <div>
                    <Label className="text-sm font-medium">Header Background Color</Label>
                    <Input
                      type="color"
                      value={localElement.headerBg || '#E7E6E6'}
                      onChange={(e) => handlePropertyChange('headerBg', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Header Text Color */}
                  <div>
                    <Label className="text-sm font-medium">Header Text Color</Label>
                    <Input
                      type="color"
                      value={localElement.headerTextColor || '#000000'}
                      onChange={(e) => handlePropertyChange('headerTextColor', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Text Color */}
                  <div>
                    <Label className="text-sm font-medium">Text Color</Label>
                    <Input
                      type="color"
                      value={localElement.color || '#000000'}
                      onChange={(e) => handlePropertyChange('color', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Corner Radius */}
                  <div>
                    <Label className="text-sm font-medium">Corner Radius: {localElement.borderRadius || 0}px</Label>
                    <Slider
                      value={[localElement.borderRadius || 0]}
                      onValueChange={([value]) => handlePropertyChange('borderRadius', value)}
                      min={0} max={20} step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Shadow */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="shadow-toggle">Shadow</Label>
                    <Switch
                      id="shadow-toggle"
                      checked={!!localElement.shadow}
                      onCheckedChange={(checked) => handlePropertyChange('shadow', checked)}
                    />
                  </div>
                  {localElement.shadow && (
                    <div>
                      <Label className="text-sm font-medium">Shadow Blur: {localElement.shadowBlur || 0}px</Label>
                      <Slider
                        value={[localElement.shadowBlur || 0]}
                        onValueChange={([value]) => handlePropertyChange('shadowBlur', value)}
                        min={0} max={50} step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </div>
    </div>
  );
};
