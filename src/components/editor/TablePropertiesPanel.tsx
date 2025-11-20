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
    <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
              <Table className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span>Table Properties</span>
            </h2>
            <button 
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              aria-label="Close panel"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 px-2 pt-1 bg-gray-50 dark:bg-gray-800/80">
              <TabsTrigger 
                value="themes" 
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-primary data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
              >
                <Palette className="w-4 h-4" />
                <span>Themes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="customize" 
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-primary data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 rounded-lg px-3 py-2 transition-colors"
              >
                <Droplet className="w-4 h-4" />
                <span>Customize</span>
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
                    <div className="flex items-center justify-between py-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rows</Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Number of rows in the table</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8 text-center">
                          {localElement.rows || 1}
                        </span>
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={handleAddRow}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={handleRemoveRow} 
                            disabled={(localElement.rows || 1) <= 1}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
                      value={localElement.textColor || '#000000'}
                      onChange={(e) => handlePropertyChange('textColor', e.target.value)}
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

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
