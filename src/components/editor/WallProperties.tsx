import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Wall = {
  id: string;
  name: string;
  length_m: number;
  height_m: number;
  area_m2: number;
};

type CanvasElement = {
  id: string;
  type: string;
  toolName: string;
  length?: number;
  area?: number;
};

type WallPropertiesProps = {
  wall: Wall;
  elements: CanvasElement[];
};

export default function WallProperties({ wall, elements }: WallPropertiesProps) {
  const elementsByType = elements.reduce((acc, el) => {
    const key = el.toolName;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(el);
    return acc;
  }, {} as Record<string, CanvasElement[]>);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Параметры стены</h3>
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Площадь:</span>
              <span className="font-medium">{wall.area_m2.toFixed(2)} м²</span>
            </div>
          </div>
        </Card>

        {elements.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Элементы на стене</h3>
            <div className="space-y-3">
              {Object.entries(elementsByType).map(([toolName, items]) => (
                <div key={toolName}>
                  <div className="text-sm">
                    <span className="font-medium">{toolName}</span>
                    <span className="text-muted-foreground ml-2">
                      ({items.length} {items.length === 1 ? 'элемент' : 'элементов'})
                    </span>
                  </div>
                  {items.length > 0 && items[0].length !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Суммарная длина: {items.reduce((sum, el) => sum + (el.length || 0), 0).toFixed(2)} м
                    </div>
                  )}
                  {items.length > 0 && items[0].area !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Суммарная площадь: {items.reduce((sum, el) => sum + (el.area || 0), 0).toFixed(2)} м²
                    </div>
                  )}
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {elements.length === 0 && (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Элементы еще не добавлены
            </p>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
