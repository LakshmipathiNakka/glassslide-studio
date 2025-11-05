/**
 * Test Suite for Chart Color Synchronization
 * 
 * This test suite verifies that pie chart colors remain synchronized
 * across all UI elements (labels, editor, thumbnails) and validates
 * the color mapping logic.
 */

import {
  validatePieChartColors,
  syncPieChartColors,
  normalizeChartData,
  getPieSliceColor,
  updatePieSliceColor,
  DEFAULT_CHART_COLORS,
  type ChartData,
} from '@/utils/chartColorSync';

describe('Chart Color Synchronization', () => {
  describe('validatePieChartColors', () => {
    it('should validate a correctly formatted pie chart', () => {
      const validChartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
          borderColor: ['#FF0000', '#00FF00', '#0000FF'],
        }]
      };

      const result = validatePieChartColors(validChartData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing labels', () => {
      const invalidChartData: ChartData = {
        labels: [],
        datasets: [{
          label: 'Test',
          data: [10],
          backgroundColor: ['#FF0000'],
        }]
      };

      const result = validatePieChartColors(invalidChartData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Chart must have at least one label');
    });

    it('should detect missing datasets', () => {
      const invalidChartData: ChartData = {
        labels: ['A', 'B'],
        datasets: []
      };

      const result = validatePieChartColors(invalidChartData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Chart must have at least one dataset');
    });

    it('should detect non-array backgroundColor', () => {
      const invalidChartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: '#FF0000', // Should be an array
        }]
      };

      const result = validatePieChartColors(invalidChartData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pie chart backgroundColor must be an array of colors');
    });

    it('should detect color array length mismatch', () => {
      const invalidChartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000', '#00FF00'], // Only 2 colors for 3 labels
        }]
      };

      const result = validatePieChartColors(invalidChartData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('backgroundColor array length'))).toBe(true);
    });

    it('should detect data array length mismatch', () => {
      const invalidChartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20], // Only 2 values for 3 labels
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
        }]
      };

      const result = validatePieChartColors(invalidChartData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('data array length'))).toBe(true);
    });
  });

  describe('syncPieChartColors', () => {
    it('should add colors when there are more labels than colors', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C', 'D', 'E'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30, 0, 0],
          backgroundColor: ['#FF0000', '#00FF00'], // Only 2 colors
        }]
      };

      const synced = syncPieChartColors(chartData);
      expect(synced.datasets[0].backgroundColor).toHaveLength(5);
      expect(Array.isArray(synced.datasets[0].backgroundColor)).toBe(true);
    });

    it('should remove colors when there are more colors than labels', () => {
      const chartData: ChartData = {
        labels: ['A', 'B'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30, 40, 50],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
        }]
      };

      const synced = syncPieChartColors(chartData);
      expect(synced.datasets[0].backgroundColor).toHaveLength(2);
      expect(synced.datasets[0].data).toHaveLength(2);
    });

    it('should convert single color to array', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: '#FF0000', // Single color
        }]
      };

      const synced = syncPieChartColors(chartData);
      expect(Array.isArray(synced.datasets[0].backgroundColor)).toBe(true);
      expect(synced.datasets[0].backgroundColor).toHaveLength(3);
    });

    it('should create backgroundColor array if missing', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          // No backgroundColor
        }]
      };

      const synced = syncPieChartColors(chartData);
      expect(Array.isArray(synced.datasets[0].backgroundColor)).toBe(true);
      expect(synced.datasets[0].backgroundColor).toHaveLength(3);
    });

    it('should synchronize borderColor with backgroundColor', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
          borderColor: ['#FF0000'], // Only 1 border color
        }]
      };

      const synced = syncPieChartColors(chartData);
      expect(synced.datasets[0].borderColor).toHaveLength(3);
      expect(Array.isArray(synced.datasets[0].borderColor)).toBe(true);
    });

    it('should add data values to match label count', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [{
          label: 'Test',
          data: [10, 20], // Only 2 values
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'],
        }]
      };

      const synced = syncPieChartColors(chartData);
      expect(synced.datasets[0].data).toHaveLength(4);
      expect(synced.datasets[0].data[2]).toBe(0);
      expect(synced.datasets[0].data[3]).toBe(0);
    });
  });

  describe('normalizeChartData', () => {
    it('should call syncPieChartColors for pie charts', () => {
      const chartData: ChartData = {
        labels: ['A', 'B'],
        datasets: [{
          label: 'Test',
          data: [10, 20],
          backgroundColor: '#FF0000',
        }]
      };

      const normalized = normalizeChartData(chartData, 'pie');
      expect(Array.isArray(normalized.datasets[0].backgroundColor)).toBe(true);
    });

    it('should convert array to single color for bar charts', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
        }]
      };

      const normalized = normalizeChartData(chartData, 'bar');
      expect(typeof normalized.datasets[0].backgroundColor).toBe('string');
      expect(normalized.datasets[0].backgroundColor).toBe('#FF0000');
    });

    it('should convert array to single color for line charts', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
          borderColor: ['#FF0000', '#00FF00', '#0000FF'],
        }]
      };

      const normalized = normalizeChartData(chartData, 'line');
      expect(typeof normalized.datasets[0].backgroundColor).toBe('string');
      expect(typeof normalized.datasets[0].borderColor).toBe('string');
    });
  });

  describe('getPieSliceColor', () => {
    it('should return correct color for valid slice index', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
        }]
      };

      expect(getPieSliceColor(chartData, 0)).toBe('#FF0000');
      expect(getPieSliceColor(chartData, 1)).toBe('#00FF00');
      expect(getPieSliceColor(chartData, 2)).toBe('#0000FF');
    });

    it('should return default color for missing slice', () => {
      const chartData: ChartData = {
        labels: ['A', 'B'],
        datasets: [{
          label: 'Test',
          data: [10, 20],
          backgroundColor: ['#FF0000'],
        }]
      };

      const color = getPieSliceColor(chartData, 1);
      expect(DEFAULT_CHART_COLORS.includes(color)).toBe(true);
    });

    it('should handle missing datasets', () => {
      const chartData: ChartData = {
        labels: ['A', 'B'],
        datasets: []
      };

      const color = getPieSliceColor(chartData, 0);
      expect(DEFAULT_CHART_COLORS.includes(color)).toBe(true);
    });
  });

  describe('updatePieSliceColor', () => {
    it('should update color at specific index', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
        }]
      };

      const updated = updatePieSliceColor(chartData, 1, '#FFFF00');
      expect(Array.isArray(updated.datasets[0].backgroundColor)).toBe(true);
      expect((updated.datasets[0].backgroundColor as string[])[1]).toBe('#FFFF00');
      expect((updated.datasets[0].backgroundColor as string[])[0]).toBe('#FF0000');
      expect((updated.datasets[0].backgroundColor as string[])[2]).toBe('#0000FF');
    });

    it('should expand color array if index is out of bounds', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000'],
        }]
      };

      const updated = updatePieSliceColor(chartData, 2, '#0000FF');
      expect((updated.datasets[0].backgroundColor as string[]).length).toBeGreaterThanOrEqual(3);
      expect((updated.datasets[0].backgroundColor as string[])[2]).toBe('#0000FF');
    });

    it('should also update borderColor to match', () => {
      const chartData: ChartData = {
        labels: ['A', 'B', 'C'],
        datasets: [{
          label: 'Test',
          data: [10, 20, 30],
          backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
          borderColor: ['#FF0000', '#00FF00', '#0000FF'],
        }]
      };

      const updated = updatePieSliceColor(chartData, 1, '#FFFF00');
      expect((updated.datasets[0].borderColor as string[])[1]).toBe('#FFFF00');
    });
  });

  describe('Integration: End-to-End Color Consistency', () => {
    it('should maintain color consistency through add/update/remove operations', () => {
      // Start with a basic pie chart
      let chartData: ChartData = {
        labels: ['Product A', 'Product B'],
        datasets: [{
          label: 'Sales',
          data: [100, 200],
          backgroundColor: ['#FF0000', '#00FF00'],
        }]
      };

      // Validate initial state
      let validation = validatePieChartColors(chartData);
      expect(validation.isValid).toBe(true);

      // Add a new label (simulating user action)
      chartData = {
        ...chartData,
        labels: [...chartData.labels, 'Product C'],
        datasets: [{
          ...chartData.datasets[0],
          data: [...chartData.datasets[0].data, 150]
        }]
      };

      // Sync colors
      chartData = syncPieChartColors(chartData);
      validation = validatePieChartColors(chartData);
      expect(validation.isValid).toBe(true);
      expect(chartData.datasets[0].backgroundColor).toHaveLength(3);

      // Update a color
      chartData = updatePieSliceColor(chartData, 1, '#0000FF');
      validation = validatePieChartColors(chartData);
      expect(validation.isValid).toBe(true);
      expect((chartData.datasets[0].backgroundColor as string[])[1]).toBe('#0000FF');

      // Remove a label
      chartData = {
        ...chartData,
        labels: chartData.labels.filter((_, i) => i !== 0),
        datasets: [{
          ...chartData.datasets[0],
          data: chartData.datasets[0].data.filter((_, i) => i !== 0)
        }]
      };

      // Sync colors again
      chartData = syncPieChartColors(chartData);
      validation = validatePieChartColors(chartData);
      expect(validation.isValid).toBe(true);
      expect(chartData.datasets[0].backgroundColor).toHaveLength(2);
    });

    it('should correctly display colors in UI components', () => {
      const chartData: ChartData = {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Revenue',
          data: [100, 150, 200, 175],
          backgroundColor: ['#007AFF', '#FF3B30', '#34C759', '#FF9500'],
        }]
      };

      // Simulate what PropertiesPanel color circle should display
      chartData.labels.forEach((label, index) => {
        const color = getPieSliceColor(chartData, index);
        expect(color).toBe(chartData.datasets[0].backgroundColor![index]);
      });
    });
  });
});
