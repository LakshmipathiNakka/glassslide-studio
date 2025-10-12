import { useRef, useEffect } from 'react';
import Moveable from 'react-moveable';
import { SlideElement } from '@/store/slideStore';

interface MoveableElementProps {
  element: SlideElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SlideElement>) => void;
  onUpdateEnd: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  snapElements: Element[];
}

export const MoveableElement = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onUpdateEnd,
  containerRef,
  snapElements,
}: MoveableElementProps) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);

  useEffect(() => {
    if (isSelected && moveableRef.current) {
      moveableRef.current.updateRect();
    }
  }, [isSelected, element]);

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="w-full h-full flex items-center justify-center text-foreground font-medium text-lg p-4 pointer-events-none">
            {element.content || 'Double-click to edit'}
          </div>
        );

      case 'shape':
        if (element.shapeType === 'rectangle') {
          return (
            <div
              className="w-full h-full pointer-events-none"
              style={{
                backgroundColor: element.fill || 'hsl(var(--accent) / 0.2)',
                border: '2px solid hsl(var(--accent))',
                borderRadius: '8px',
              }}
            />
          );
        }
        if (element.shapeType === 'circle') {
          return (
            <div
              className="w-full h-full rounded-full pointer-events-none"
              style={{
                backgroundColor: element.fill || 'hsl(var(--accent) / 0.2)',
                border: '2px solid hsl(var(--accent))',
              }}
            />
          );
        }
        break;

      case 'chart':
        return (
          <div className="w-full h-full bg-card rounded-lg p-4 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <div className="text-lg font-semibold mb-2">
                {element.chartType?.toUpperCase()} Chart
              </div>
              <div className="text-xs">
                {element.chartData?.labels?.join(', ')}
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center pointer-events-none">
            <span className="text-muted-foreground">Image</span>
          </div>
        );
    }
  };

  return (
    <>
      <div
        ref={targetRef}
        className="absolute select-none"
        data-element-id={element.id}
        style={{
          transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg)`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          zIndex: element.zIndex,
          cursor: isSelected ? 'move' : 'pointer',
        }}
        onClick={onSelect}
      >
        {renderContent()}
      </div>

      {isSelected && targetRef.current && containerRef.current && (
        <Moveable
          ref={moveableRef}
          target={targetRef.current}
          container={containerRef.current}
          draggable={true}
          resizable={true}
          rotatable={true}
          snappable={true}
          snapThreshold={5}
          isDisplaySnapDigit={true}
          snapGap={true}
          snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
          elementSnapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
          snapElement={true}
          elementGuidelines={snapElements}
          bounds={{ left: 0, top: 0, right: 960, bottom: 540, position: 'css' }}
          origin={false}
          keepRatio={false}
          throttleDrag={0}
          throttleResize={0}
          throttleRotate={0}
          renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
          edge={false}
          zoom={1}
          onDrag={(e) => {
            e.target.style.transform = e.transform;
          }}
          onDragEnd={(e) => {
            const translate = e.lastEvent?.translate || [element.x, element.y];
            onUpdate({
              x: translate[0],
              y: translate[1],
            });
            onUpdateEnd();
          }}
          onResize={(e) => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.drag.transform;
          }}
          onResizeEnd={(e) => {
            const translate = e.lastEvent?.drag.translate || [element.x, element.y];
            onUpdate({
              x: translate[0],
              y: translate[1],
              width: e.lastEvent?.width || element.width,
              height: e.lastEvent?.height || element.height,
            });
            onUpdateEnd();
          }}
          onRotate={(e) => {
            e.target.style.transform = e.drag.transform;
          }}
          onRotateEnd={(e) => {
            const translate = e.lastEvent?.drag.translate || [element.x, element.y];
            onUpdate({
              x: translate[0],
              y: translate[1],
              rotation: e.lastEvent?.rotate || element.rotation,
            });
            onUpdateEnd();
          }}
        />
      )}
    </>
  );
};
