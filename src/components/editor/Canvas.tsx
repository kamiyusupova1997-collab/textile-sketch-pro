import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Canvas as FabricCanvas, Line, Rect, Circle, Group, FabricObject, FabricText } from "fabric";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
    category: string;
  } | null;
  onElementsChange: (elements: CanvasElement[]) => void;
};

const SCALE = 20; // 20 пикселей = 1 метр (уменьшенный масштаб для мелкой клетки)
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 800;

export default function Canvas({ wallLength, wallHeight, currentTool, onElementsChange }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const tempObjectRef = useRef<FabricObject | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: "#ffffff",
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    // Рисуем сетку
    drawGrid(canvas);

    // Обработчики для рисования
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    // Обработчик удаления
    canvas.on("selection:created", () => canvas.renderAll());
    canvas.on("selection:updated", () => canvas.renderAll());

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    onElementsChange(elements);
  }, [elements]);

  const drawGrid = (canvas: FabricCanvas) => {
    for (let x = 0; x <= CANVAS_WIDTH; x += SCALE) {
      const line = new Line([x, 0, x, CANVAS_HEIGHT], {
        stroke: "#e5e7eb",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      canvas.add(line);
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += SCALE) {
      const line = new Line([0, y, CANVAS_WIDTH, y], {
        stroke: "#e5e7eb",
        strokeWidth: 1,
        selectable: false,
        evented: false,
      });
      canvas.add(line);
    }
  };

  const getColorForCategory = (category: string): string => {
    switch (category) {
      case "profile":
        return "#000000"; // черный
      case "fabric":
        return "#60a5fa"; // голубой
      case "membrane":
        return "#fb923c"; // оранжевый
      case "light":
        return "#22c55e"; // зеленый
      case "mounting_plate":
        return "#ef4444"; // красный
      default:
        return "#3b82f6";
    }
  };

  const handleMouseDown = (event: any) => {
    if (!currentTool || !fabricCanvasRef.current) return;

    const pointer = fabricCanvasRef.current.getPointer(event.e);
    startPointRef.current = { x: pointer.x, y: pointer.y };

    const category = currentTool.category;
    const isDraggable = 
      (category === "light") || 
      (category === "mounting_plate" && (currentTool.type === "circle" || currentTool.type === "double-circle" || currentTool.type === "square" || currentTool.type === "large-square"));

    if (isDraggable) {
      // Создаем перетаскиваемый объект сразу
      const obj = createFabricObject(currentTool, pointer.x, pointer.y, pointer.x, pointer.y);
      if (obj) {
        fabricCanvasRef.current.add(obj);
        fabricCanvasRef.current.setActiveObject(obj);
        const element: CanvasElement = {
          id: Date.now().toString(),
          type: currentTool.type,
          toolOptionId: currentTool.id,
          toolName: currentTool.name,
          points: [{ x: pointer.x, y: pointer.y }],
        };
        setElements(prev => [...prev, element]);
        (obj as any).elementId = element.id;
      }
    } else {
      // Для линий и прямоугольников - начинаем рисование
      isDrawingRef.current = true;
      fabricCanvasRef.current.selection = false;
    }
  };

  const handleMouseMove = (event: any) => {
    if (!isDrawingRef.current || !startPointRef.current || !currentTool || !fabricCanvasRef.current) return;

    const pointer = fabricCanvasRef.current.getPointer(event.e);

    // Удаляем временный объект
    if (tempObjectRef.current) {
      fabricCanvasRef.current.remove(tempObjectRef.current);
      tempObjectRef.current = null;
    }

    // Создаем новый временный объект
    const obj = createFabricObject(currentTool, startPointRef.current.x, startPointRef.current.y, pointer.x, pointer.y);
    if (obj) {
      tempObjectRef.current = obj;
      fabricCanvasRef.current.add(obj);
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleMouseUp = (event: any) => {
    if (!isDrawingRef.current || !startPointRef.current || !currentTool || !fabricCanvasRef.current) return;

    const pointer = fabricCanvasRef.current.getPointer(event.e);

    // Удаляем временный объект
    if (tempObjectRef.current) {
      fabricCanvasRef.current.remove(tempObjectRef.current);
      tempObjectRef.current = null;
    }

    // Создаем финальный объект
    const obj = createFabricObject(currentTool, startPointRef.current.x, startPointRef.current.y, pointer.x, pointer.y);
    if (obj) {
      fabricCanvasRef.current.add(obj);

      const dx = pointer.x - startPointRef.current.x;
      const dy = pointer.y - startPointRef.current.y;
      const length = Math.sqrt(dx * dx + dy * dy) / SCALE;

      const element: CanvasElement = {
        id: Date.now().toString(),
        type: currentTool.type,
        toolOptionId: currentTool.id,
        toolName: currentTool.name,
        points: [startPointRef.current, { x: pointer.x, y: pointer.y }],
        length,
      };

      setElements(prev => [...prev, element]);
      (obj as any).elementId = element.id;
    }

    isDrawingRef.current = false;
    startPointRef.current = null;
    fabricCanvasRef.current.selection = true;
  };

  const createFabricObject = (tool: any, x1: number, y1: number, x2: number, y2: number): FabricObject | null => {
    const color = getColorForCategory(tool.category);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy) / SCALE;

    if (tool.type === "line" || tool.category === "profile") {
      // Профили - прямая линия с размером
      const line = new Line([x1, y1, x2, y2], {
        stroke: color,
        strokeWidth: 3,
        selectable: false,
      });

      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const text = new FabricText(`${length.toFixed(2)}м`, {
        left: midX,
        top: midY - 15,
        fontSize: 14,
        fill: color,
        selectable: false,
        backgroundColor: "white",
      });

      const group = new Group([line, text], {
        selectable: false,
      });

      return group;
    }

    if (tool.type === "area" || tool.category === "fabric" || tool.category === "membrane") {
      // Ткань и мембрана - прямоугольник с размерами
      const rect = new Rect({
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        width: Math.abs(dx),
        height: Math.abs(dy),
        fill: `${color}33`,
        stroke: color,
        strokeWidth: 2,
        selectable: false,
      });

      const width = Math.abs(dx) / SCALE;
      const height = Math.abs(dy) / SCALE;
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;

      const text = new FabricText(`${width.toFixed(2)}м × ${height.toFixed(2)}м`, {
        left: centerX,
        top: centerY,
        fontSize: 14,
        fill: color,
        selectable: false,
        backgroundColor: "white",
        originX: "center",
        originY: "center",
      });

      const group = new Group([rect, text], {
        selectable: false,
      });

      return group;
    }

    if (tool.type === "thick-line" || tool.type === "dashed-line") {
      // Закладные Потолок и Плинтус - линии с размером
      const rect = new Rect({
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        width: Math.abs(dx),
        height: Math.abs(dy),
        fill: `${color}33`,
        stroke: color,
        strokeWidth: tool.type === "thick-line" ? 4 : 2,
        strokeDashArray: tool.type === "dashed-line" ? [5, 5] : undefined,
        selectable: false,
      });

      const length = Math.abs(dx) / SCALE;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      const text = new FabricText(`${length.toFixed(2)}м`, {
        left: midX,
        top: midY,
        fontSize: 14,
        fill: color,
        selectable: false,
        backgroundColor: "white",
        originX: "center",
        originY: "center",
      });

      const group = new Group([rect, text], {
        selectable: false,
      });

      return group;
    }

    if (tool.type === "circle") {
      // Светильники
      const circle = new Circle({
        left: x1 - 15,
        top: y1 - 15,
        radius: 15,
        fill: `${color}66`,
        stroke: color,
        strokeWidth: 2,
        selectable: true,
      });
      return circle;
    }

    if (tool.type === "double-circle") {
      // Закладная Рондо
      const circle1 = new Circle({
        left: -10,
        top: 0,
        radius: 10,
        fill: `${color}66`,
        stroke: color,
        strokeWidth: 2,
      });
      const circle2 = new Circle({
        left: 10,
        top: 0,
        radius: 10,
        fill: `${color}66`,
        stroke: color,
        strokeWidth: 2,
      });
      const group = new Group([circle1, circle2], {
        left: x1,
        top: y1,
        selectable: true,
      });
      return group;
    }

    if (tool.type === "square") {
      // Закладная Мини
      const rect = new Rect({
        left: x1 - 10,
        top: y1 - 10,
        width: 20,
        height: 20,
        fill: `${color}66`,
        stroke: color,
        strokeWidth: 2,
        selectable: true,
      });
      return rect;
    }

    if (tool.type === "large-square") {
      // Закладная Стандарт
      const rect = new Rect({
        left: x1 - 15,
        top: y1 - 15,
        width: 30,
        height: 30,
        fill: `${color}66`,
        stroke: color,
        strokeWidth: 2,
        selectable: true,
      });
      return rect;
    }

    return null;
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvasRef.current) return;

    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      const elementId = (activeObject as any).elementId;
      if (elementId) {
        setElements(prev => prev.filter(el => el.id !== elementId));
      }
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleClear = () => {
    if (!fabricCanvasRef.current) return;
    
    fabricCanvasRef.current.clear();
    drawGrid(fabricCanvasRef.current);
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
        <div className="flex gap-2">
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить выбранное
          </Button>
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
          >
            Очистить все
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-auto bg-white">
        <canvas ref={canvasRef} />
      </div>
      {currentTool && (
        <div className="mt-2 text-sm text-muted-foreground">
          Выбран инструмент: <strong>{currentTool.name}</strong>
          <br />
          <span className="text-xs">
            {currentTool.category === "light" || 
             (currentTool.category === "mounting_plate" && ["circle", "double-circle", "square", "large-square"].includes(currentTool.type))
              ? "Кликните для размещения, затем перетащите при необходимости"
              : "Нажмите и тяните для рисования"}
          </span>
        </div>
      )}
    </Card>
  );
}
