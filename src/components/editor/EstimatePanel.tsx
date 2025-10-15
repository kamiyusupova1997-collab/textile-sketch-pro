import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CanvasElement = {
  id: string;
  type: "line" | "area" | "circle" | "double-circle" | "square" | "large-square" | "thick-line" | "dashed-line";
  toolOptionId: string;
  toolName: string;
  points: { x: number; y: number }[];
  length?: number;
  area?: number;
};

type ToolOption = {
  id: string;
  name: string;
  category_id: string;
  default_material_price: number;
  default_labor_price: number;
  unit: string;
  calc_strategy: string;
  roll_width_m: number | null;
};

type EstimatePanelProps = {
  wallId: string;
  elements: CanvasElement[];
};

export default function EstimatePanel({ wallId, elements }: EstimatePanelProps) {
  const [tools, setTools] = useState<Map<string, ToolOption>>(new Map());
  const [estimates, setEstimates] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadToolOptions();
  }, [elements]);

  const loadToolOptions = async () => {
    const toolIds = [...new Set(elements.map(e => e.toolOptionId))];
    if (toolIds.length === 0) return;

    const { data, error } = await supabase
      .from("tool_options")
      .select("*")
      .in("id", toolIds);

    if (error) {
      toast.error("Ошибка загрузки инструментов");
      return;
    }

    const toolsMap = new Map(data.map(tool => [tool.id, tool]));
    setTools(toolsMap);
    calculateEstimates(toolsMap);
  };

  const calculateEstimates = (toolsMap: Map<string, ToolOption>) => {
    const estimatesByTool = new Map<string, {
      tool: ToolOption;
      quantity: number;
      materialCost: number;
      laborCost: number;
    }>();

    elements.forEach(element => {
      const tool = toolsMap.get(element.toolOptionId);
      if (!tool) return;

      let quantity = 0;

      // Calculate quantity based on tool category and element type
      if (tool.category_id === "profile") {
        // Profiles: round length to 2m increments
        const length = element.length || 0;
        quantity = Math.ceil(length / 2) * 2;
      } else if (tool.category_id === "fabric") {
        // Fabric: add 15cm margin to width (roll_width_m)
        const area = element.area || 0;
        const effectiveWidth = (tool.roll_width_m || 1) - 0.15;
        quantity = area / effectiveWidth;
      } else if (tool.category_id === "mounting_plate") {
        // Mounting plates: 
        // - For lines (Потолок, Плинтус): use length
        // - For points (Рондо, Мини, Стандарт): count pieces
        if (tool.unit === "м") {
          quantity = element.length || 0;
        } else {
          quantity = 1; // Count each element as 1 piece
        }
      } else if (tool.category_id === "light") {
        // Lights: count pieces (circles)
        quantity = 1;
      } else if (tool.category_id === "membrane") {
        // Membrane: use area
        quantity = element.area || 0;
      } else {
        // Default: use length or area
        quantity = element.length || element.area || 1;
      }

      const materialCost = quantity * tool.default_material_price;
      const laborCost = quantity * tool.default_labor_price;

      const existing = estimatesByTool.get(element.toolOptionId);
      if (existing) {
        existing.quantity += quantity;
        existing.materialCost += materialCost;
        existing.laborCost += laborCost;
      } else {
        estimatesByTool.set(element.toolOptionId, {
          tool,
          quantity,
          materialCost,
          laborCost,
        });
      }
    });

    setEstimates(Array.from(estimatesByTool.values()));
  };

  const handleSaveEstimate = async () => {
    setLoading(true);

    try {
      // Delete existing estimates for this wall
      await supabase
        .from("estimates")
        .delete()
        .eq("wall_id", wallId);

      // Insert new estimates
      const estimateRecords = estimates.map(est => ({
        wall_id: wallId,
        tool_option_id: est.tool.id,
        quantity: est.quantity,
        material_cost: est.materialCost,
        labor_cost: est.laborCost,
        total_cost: est.materialCost + est.laborCost,
        notes: notes,
      }));

      const { error } = await supabase
        .from("estimates")
        .insert(estimateRecords);

      if (error) throw error;

      toast.success("Смета сохранена");
    } catch (error) {
      toast.error("Ошибка сохранения сметы");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalMaterialCost = estimates.reduce((sum, est) => sum + est.materialCost, 0);
  const totalLaborCost = estimates.reduce((sum, est) => sum + est.laborCost, 0);
  const totalCost = totalMaterialCost + totalLaborCost;

  if (elements.length === 0) {
    return (
      <Card className="m-4 p-4">
        <p className="text-sm text-muted-foreground">
          Добавьте элементы на чертеж для формирования сметы
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Позиции сметы</h3>
        <div className="space-y-3">
          {estimates.map((est, index) => (
            <div key={index} className="border-b pb-3 last:border-0">
              <p className="font-medium text-sm">{est.tool.name}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                <p>Количество: {est.quantity.toFixed(2)} {est.tool.unit}</p>
                <p>Материалы: {est.materialCost.toFixed(2)} ₽</p>
                <p>Работа: {est.laborCost.toFixed(2)} ₽</p>
                <p className="font-semibold text-foreground">
                  Итого: {(est.materialCost + est.laborCost).toFixed(2)} ₽
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Итого</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Материалы:</span>
            <span className="font-semibold">{totalMaterialCost.toFixed(2)} ₽</span>
          </div>
          <div className="flex justify-between">
            <span>Работа:</span>
            <span className="font-semibold">{totalLaborCost.toFixed(2)} ₽</span>
          </div>
          <div className="flex justify-between text-base pt-2 border-t">
            <span className="font-bold">Всего:</span>
            <span className="font-bold">{totalCost.toFixed(2)} ₽</span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Примечания</h3>
        <Textarea
          placeholder="Добавьте примечания к смете..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Card>

      <Button
        onClick={handleSaveEstimate}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Сохранение..." : "Сохранить смету"}
      </Button>
    </div>
  );
}
