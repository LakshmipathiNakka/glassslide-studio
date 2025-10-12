import { useRef, useEffect, useState } from 'react';
import Moveable, { OnResize, OnDrag, OnRotate } from 'react-moveable';
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
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const aspectRatio = useRef(element.width / element.height);

  useEffect(() => {
    if (isSelected && moveableRef.current) {
      moveableRef.current.updateRect();
    }
  }, [isSelected, element]);

  useEffect(() => {
    aspectRatio.current = element.width / element.height;
  }, [element.width, element.height]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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

  const handleDrag = (e: OnDrag) => {
    e.target.style.transform = e.transform;
  };

  const handleDragEnd = (e: OnDrag) => {
    const translate = e.lastEvent?.translate || [element.x, element.y];
    onUpdate({
      x: Math.round(translate[0]),
      y: Math.round(translate[1]),
    });
    onUpdateEnd();
  };

  const handleResize = (e: OnResize) => {
    let width = e.width;
    let height = e.height;

    if (isShiftPressed || e.direction.some(dir => dir === 1 || dir === -1)) {
      if (isShiftPressed) {
        if (Math.abs(e.delta[0]) > Math.abs(e.delta[1])) {
          height = width / aspectRatio.current;
        } else {
          width = height * aspectRatio.current;
        }
      }
    }

    e.target.style.width = `${width}px`;
    e.target.style.height = `${height}px`;
    e.target.style.transform = e.drag.transform;
  };

  const handleResizeEnd = (e: OnResize) => {
    const translate = e.lastEvent?.drag.translate || [element.x, element.y];
    let width = e.lastEvent?.width || element.width;
    let height = e.lastEvent?.height || element.height;

    if (isShiftPressed) {
      if (Math.abs(width - element.width) > Math.abs(height - element.height)) {
        height = width / aspectRatio.current;
      } else {
        width = height * aspectRatio.current;
      }
    }

    onUpdate({
      x: Math.round(translate[0]),
      y: Math.round(translate[1]),
      width: Math.round(width),
      height: Math.round(height),
    });
    onUpdateEnd();
  };

  const handleRotate = (e: OnRotate) => {
    e.target.style.transform = e.drag.transform;
  };

  const handleRotateEnd = (e: OnRotate) => {
    const translate = e.lastEvent?.drag.translate || [element.x, element.y];
    onUpdate({
      x: Math.round(translate[0]),
      y: Math.round(translate[1]),
      rotation: Math.round((e.lastEvent?.rotate || element.rotation) * 10) / 10,
    });
    onUpdateEnd();
  };

  return (
    <>
      <div
        ref={targetRef}
        className="absolute select-none transition-shadow"
        data-element-id={element.id}
        style={{
          transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg)`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          zIndex: element.zIndex,
          cursor: isSelected ? 'move' : 'pointer',
          willChange: 'transform',
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
          snapDirections={{
            top: true,
            left: true,
            bottom: true,
            right: true,
            center: true,
            middle: true,
          }}
          elementSnapDirections={{
            top: true,
            left: true,
            bottom: true,
            right: true,
            center: true,
            middle: true,
          }}
          snapElement={true}
          elementGuidelines={snapElements}
          verticalGuidelines={[0, 480, 960]}
          horizontalGuidelines={[0, 270, 540]}
          snapDigit={0}
          snapGridWidth={20}
          snapGridHeight={20}
          bounds={{ left: 0, top: 0, right: 960, bottom: 540, position: 'css' }}
          origin={false}
          keepRatio={isShiftPressed}
          throttleDrag={0}
          throttleResize={0}
          throttleRotate={0}
          renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
          edge={false}
          zoom={1}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onResize={handleResize}
          onResizeEnd={handleResizeEnd}
          onRotate={handleRotate}
          onRotateEnd={handleRotateEnd}
        />
      )}
    </>
  );
};
