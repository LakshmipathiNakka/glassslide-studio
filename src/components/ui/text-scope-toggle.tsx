import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface TextScopeToggleProps {
  mode: "entire" | "selected";
  onToggle: (mode: "entire" | "selected") => void;
  disabled?: boolean;
}

export const TextScopeToggle: React.FC<TextScopeToggleProps> = ({ 
  mode, 
  onToggle, 
  disabled = false 
}) => {
  return (
    <TooltipProvider>
      <motion.div 
        className="flex items-center justify-between gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold text-blue-900">
            Apply To
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-help"
              >
                <Info className="w-4 h-4 text-blue-600" />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="text-xs space-y-1">
                <p className="font-semibold">Text Scope Control</p>
                <p><strong>Entire Text:</strong> Apply formatting to the whole text element</p>
                <p><strong>Selected Text:</strong> Apply formatting only to highlighted text</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex items-center gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.span 
                className={`text-sm font-medium transition-all duration-300 cursor-pointer ${
                  mode === "entire" 
                    ? "text-blue-700 font-bold scale-105" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !disabled && onToggle("entire")}
              >
                Entire Text
              </motion.span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Apply formatting to the entire text element</p>
            </TooltipContent>
          </Tooltip>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Switch
              checked={mode === "selected"}
              onCheckedChange={(checked) => onToggle(checked ? "selected" : "entire")}
              disabled={disabled}
              className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300"
            />
          </motion.div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.span 
                className={`text-sm font-medium transition-all duration-300 cursor-pointer ${
                  mode === "selected" 
                    ? "text-blue-700 font-bold scale-105" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => !disabled && onToggle("selected")}
              >
                Selected Text
              </motion.span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Apply formatting only to selected text</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};
