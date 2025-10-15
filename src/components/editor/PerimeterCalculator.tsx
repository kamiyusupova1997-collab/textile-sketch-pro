import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calculator } from "lucide-react";

type CanvasElement = {
  id: string;
  type: string;
  points: { x: number; y: number }[];
  length?: number;
};

type PerimeterCalculatorProps = {
  elements: CanvasElement[];
  onCalculate: (length: number, height: number) => void;
};

export default function PerimeterCalculator({ elements, onCalculate }: PerimeterCalculatorProps) {
  const calculateDimensions = () => {
    // Найти все линии (профили)
    const profileLines = elements.filter(
      el => el.type === "line" || el.type === "thick-line" || el.type === "dashed-line"
    );

    if (profileLines.length === 0) {
      return;
    }

    // Найти максимальные координаты для определения размеров
    let maxX = 0;
    let maxY = 0;

    profileLines.forEach(line => {
      line.points.forEach(point => {
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });

    // Конвертировать пиксели в метры (50 пикселей = 1 метр)
    const SCALE = 50;
    const length = Math.ceil((maxX / SCALE) * 10) / 10; // Округление до 0.1 м
    const height = Math.ceil((maxY / SCALE) * 10) / 10;

    onCalculate(length, height);
  };

  const profileCount = elements.filter(
    el => el.type === "line" || el.type === "thick-line" || el.type === "dashed-line"
  ).length;

  if (profileCount === 0) {
    return null;
  }

  return (
    <Card className="p-3 bg-green-50 border-green-200">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm">
          <p className="font-medium text-green-900">
            Нарисовано профилей: {profileCount}
          </p>
          <p className="text-xs text-green-700">
            Нажмите для расчета размеров стены
          </p>
        </div>
        <Button
          size="sm"
          onClick={calculateDimensions}
          className="bg-green-600 hover:bg-green-700"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Рассчитать
        </Button>
      </div>
    </Card>
  );
}
