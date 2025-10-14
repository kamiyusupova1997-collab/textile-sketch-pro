import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  unit: string;
  default_material_price: number;
  default_labor_price: number;
  size_label: string | null;
  roll_width_m: number | null;
};

type EstimateItem = {
  toolOption: ToolOption;
  quantity: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
};

type EstimatePanelProps = {
  wallId: string;
  wallLength: number;
  wallHeight: number;
  elements: CanvasElement[];
};

export default function EstimatePanel({ wallId, wallLength, wallHeight, elements }: EstimatePanelProps) {
  const [estimateItems, setEstimateItems] = useState<EstimateItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateEstimate();
  }, [elements, wallLength, wallHeight]);

  const calculateEstimate = async () => {
    if (elements.length === 0) {
      setEstimateItems([]);
      return;
    }

    // Group elements by tool
    const toolGroups = new Map<string, CanvasElement[]>();
    elements.forEach(element => {
      const existing = toolGroups.get(element.toolOptionId) || [];
      toolGroups.set(element.toolOptionId, [...existing, element]);
    });

    // Load tool options
    const toolIds = Array.from(toolGroups.keys());
    const { data: tools, error } = await supabase
      .from("tool_options")
      .select("*")
      .in("id", toolIds);

    if (error || !tools) {
      console.error("Error loading tools:", error);
      return;
    }

    const items: EstimateItem[] = [];

    for (const tool of tools) {
      const toolElements = toolGroups.get(tool.id) || [];
      let quantity = 0;

      // Calculate quantity based on category
      if (tool.category_id === "profile") {
        // Sum all lengths and round up to profile size (default 2m)
        const totalLength = toolElements.reduce((sum, el) => sum + (el.length || 0), 0);
        const profileSize = parseFloat(tool.size_label || "2");
        quantity = Math.ceil(totalLength / profileSize) * profileSize;
      } else if (tool.category_id === "fabric") {
        // Calculate fabric area with 15cm (0.15m) width margin
        const wallArea = wallLength * wallHeight;
        const marginArea = wallLength * 0.15;
        quantity = wallArea + marginArea;
      } else if (tool.category_id === "membrane") {
        // Sum all areas
        quantity = toolElements.reduce((sum, el) => sum + (el.area || 0), 0);
      } else if (tool.category_id === "light") {
        // Count circles
        quantity = toolElements.length;
      } else if (tool.category_id === "mounting_plate") {
        if (tool.unit === "шт") {
          // Count pieces (circles, squares)
          quantity = toolElements.length;
        } else {
          // Sum lengths for linear mounting plates
          quantity = toolElements.reduce((sum, el) => sum + (el.length || 0), 0);
        }
      }

      const materialCost = quantity * tool.default_material_price;
      const laborCost = quantity * tool.default_labor_price;
      const totalCost = materialCost + laborCost;

      items.push({
        toolOption: tool,
        quantity,
        materialCost,
        laborCost,
        totalCost,
      });
    }

    setEstimateItems(items);
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
      for (const item of estimateItems) {
        await supabase.from("estimates").insert({
          wall_id: wallId,
          tool_option_id: item.toolOption.id,
          quantity: item.quantity,
          material_cost: item.materialCost,
          labor_cost: item.laborCost,
          total_cost: item.totalCost,
          notes,
        });
      }

      alert("Смета сохранена");
    } catch (error) {
      console.error("Error saving estimate:", error);
      alert("Ошибка сохранения сметы");
    } finally {
      setLoading(false);
    }
  };

  const totalMaterialCost = estimateItems.reduce((sum, item) => sum + item.materialCost, 0);
  const totalLaborCost = estimateItems.reduce((sum, item) => sum + item.laborCost, 0);
  const grandTotal = totalMaterialCost + totalLaborCost;

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {estimateItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Добавьте элементы на чертеж для формирования сметы
            </p>
          ) : (
            <>
              {estimateItems.map((item, index) => (
                <Card key={index} className="p-3">
                  <h4 className="font-semibold text-sm mb-2">{item.toolOption.name}</h4>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>Количество: {item.quantity.toFixed(2)} {item.toolOption.unit}</p>
                    <p>Материалы: {item.materialCost.toFixed(2)} ₽</p>
                    <p>Работа: {item.laborCost.toFixed(2)} ₽</p>
                    <Separator className="my-2" />
                    <p className="font-semibold text-foreground">
                      Итого: {item.totalCost.toFixed(2)} ₽
                    </p>
                  </div>
                </Card>
              ))}

              <Separator className="my-4" />

              <Card className="p-4 bg-primary/5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Материалы:</span>
                    <span className="font-semibold">{totalMaterialCost.toFixed(2)} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Работы:</span>
                    <span className="font-semibold">{totalLaborCost.toFixed(2)} ₽</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base">
                    <span className="font-bold">ИТОГО:</span>
                    <span className="font-bold text-primary">{grandTotal.toFixed(2)} ₽</span>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="notes">Примечания к смете</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Добавьте дополнительные комментарии..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {estimateItems.length > 0 && (
        <div className="p-4 border-t">
          <Button 
            onClick={handleSaveEstimate} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Сохранение..." : "Сохранить смету"}
          </Button>
        </div>
      )}
    </div>
  );
}
