import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

type CanvasElement = {
  id: string;
  type: "line" | "area" | "circle" | "double-circle" | "square" | "large-square" | "thick-line" | "dashed-line";
  toolOptionId: string;
  toolName: string;
  points: { x: number; y: number }[];
  length?: number;
  area?: number;
};

type Wall = {
  id: string;
  name: string;
  length_m: number;
  height_m: number;
  area_m2: number;
};

type WallPropertiesProps = {
  wall: Wall;
  elements: CanvasElement[];
  onEditDimensions: () => void;
};

export default function WallProperties({ wall, elements, onEditDimensions }: WallPropertiesProps) {
  return (
    <div className="space-y-4 p-4">
      <Card className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">Параметры стены</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onEditDimensions}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Название:</span>
            <span className="font-medium">{wall.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Длина:</span>
            <span className="font-medium">{wall.length_m} м</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Высота:</span>
            <span className="font-medium">{wall.height_m} м</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">Площадь:</span>
            <span className="font-semibold">{wall.area_m2?.toFixed(2)} м²</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Элементы на стене</h3>
        {elements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            На стене пока нет элементов
          </p>
        ) : (
          <div className="space-y-3">
            {elements.map((element, index) => (
              <div key={element.id} className="border-b pb-3 last:border-0">
                <p className="font-medium text-sm">
                  {index + 1}. {element.toolName}
                </p>
                <div className="mt-1 text-xs text-muted-foreground space-y-1">
                  <p>Тип: {getElementTypeLabel(element.type)}</p>
                  {element.length && (
                    <p>Длина: {element.length.toFixed(2)} м</p>
                  )}
                  {element.area && (
                    <p>Площадь: {element.area.toFixed(2)} м²</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function getElementTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "line": "Линия",
    "area": "Площадь",
    "circle": "Круг",
    "double-circle": "Двойной круг",
    "square": "Квадрат",
    "large-square": "Большой квадрат",
    "thick-line": "Толстая линия",
    "dashed-line": "Пунктирная линия",
  };
  return labels[type] || type;
}
