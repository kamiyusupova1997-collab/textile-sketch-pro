import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";

type CanvasElement = {
  id: string;
  type: "line" | "area" | "circle" | "double-circle" | "square" | "large-square" | "thick-line" | "dashed-line";
  toolOptionId: string;
  toolName: string;
  points: { x: number; y: number }[];
  length?: number;
  area?: number;
};

type CanvasProps = {
  wallLength: number;
  wallHeight: number;
  currentTool: {
    id: string;
    name: string;
    type: "line" | "area" | "circle" | "double-circle" | "square" | "large-square" | "thick-line" | "dashed-line";
  } | null;
  onElementsChange: (elements: CanvasElement[]) => void;
};

export default function Canvas({ wallLength, wallHeight, currentTool, onElementsChange }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const SCALE = 50; // 50 пикселей = 1 метр
  const DEFAULT_CANVAS_SIZE = 800; // Размер холста по умолчанию в пикселях

  useEffect(() => {
    drawCanvas();
  }, [elements, wallLength, wallHeight, currentPoints]);

  useEffect(() => {
    onElementsChange(elements);
  }, [elements]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += SCALE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += SCALE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw wall boundary only if dimensions are set
    if (wallLength > 0 && wallHeight > 0) {
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 0, wallLength * SCALE, wallHeight * SCALE);
    }

    // Draw elements
    elements.forEach((element) => {
      drawElement(ctx, element);
    });

    // Draw current drawing
    if (currentPoints.length > 0 && currentTool) {
      ctx.strokeStyle = "#ff6b00";
      ctx.lineWidth = 2;
      if (currentTool.type === "line" || currentTool.type === "thick-line" || currentTool.type === "dashed-line") {
        if (currentTool.type === "dashed-line") {
          ctx.setLineDash([5, 5]);
        } else if (currentTool.type === "thick-line") {
          ctx.lineWidth = 4;
        }
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (currentTool.type === "area") {
        ctx.fillStyle = "rgba(255, 107, 0, 0.2)";
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.strokeStyle = "#3b82f6";
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.lineWidth = 2;

    if (element.type === "line" || element.type === "thick-line" || element.type === "dashed-line") {
      if (element.type === "dashed-line") {
        ctx.setLineDash([5, 5]);
      } else if (element.type === "thick-line") {
        ctx.lineWidth = 4;
      }
      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      element.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (element.type === "area") {
      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      element.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (element.type === "circle") {
      const center = element.points[0];
      ctx.beginPath();
      ctx.arc(center.x, center.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (element.type === "double-circle") {
      const center = element.points[0];
      ctx.beginPath();
      ctx.arc(center.x - 5, center.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center.x + 5, center.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (element.type === "square") {
      const center = element.points[0];
      ctx.fillRect(center.x - 8, center.y - 8, 16, 16);
      ctx.strokeRect(center.x - 8, center.y - 8, 16, 16);
    } else if (element.type === "large-square") {
      const center = element.points[0];
      ctx.fillRect(center.x - 12, center.y - 12, 24, 24);
      ctx.strokeRect(center.x - 12, center.y - 12, 24, 24);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentTool) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool.type === "circle" || currentTool.type === "double-circle" || 
        currentTool.type === "square" || currentTool.type === "large-square") {
      // Single click elements
      const newElement: CanvasElement = {
        id: Date.now().toString(),
        type: currentTool.type,
        toolOptionId: currentTool.id,
        toolName: currentTool.name,
        points: [{ x, y }],
      };
      setElements([...elements, newElement]);
    } else {
      // Multi-point elements (lines and areas)
      setIsDrawing(true);
      setCurrentPoints([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentTool) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPoints([...currentPoints, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentTool) return;

    if (currentPoints.length < 2) {
      setIsDrawing(false);
      setCurrentPoints([]);
      return;
    }

    // Calculate length for lines
    let length = 0;
    for (let i = 1; i < currentPoints.length; i++) {
      const dx = currentPoints[i].x - currentPoints[i - 1].x;
      const dy = currentPoints[i].y - currentPoints[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    length = length / SCALE; // Convert pixels to meters

    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: currentTool.type,
      toolOptionId: currentTool.id,
      toolName: currentTool.name,
      points: [...currentPoints],
      length: currentTool.type !== "area" ? length : undefined,
      area: currentTool.type === "area" ? calculateArea(currentPoints) / (SCALE * SCALE) : undefined,
    };

    setElements([...elements, newElement]);
    setIsDrawing(false);
    setCurrentPoints([]);
  };

  const calculateArea = (points: { x: number; y: number }[]) => {
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area / 2);
  };

  const handleClear = () => {
    setElements([]);
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">
          {wallLength > 0 && wallHeight > 0 
            ? `Чертеж (${wallLength}м × ${wallHeight}м)`
            : "Чертеж (нарисуйте периметр)"}
        </h3>
        <button
          onClick={handleClear}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Очистить
        </button>
      </div>
      <div className="border rounded-lg overflow-auto bg-white">
        <canvas
          ref={canvasRef}
          width={wallLength > 0 ? wallLength * SCALE : DEFAULT_CANVAS_SIZE}
          height={wallHeight > 0 ? wallHeight * SCALE : DEFAULT_CANVAS_SIZE}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="cursor-crosshair"
        />
      </div>
      {currentTool && (
        <div className="mt-2 text-sm text-muted-foreground">
          Выбран инструмент: <strong>{currentTool.name}</strong>
        </div>
      )}
    </Card>
  );
}
