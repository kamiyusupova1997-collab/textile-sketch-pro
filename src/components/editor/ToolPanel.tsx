import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type ToolOption = {
  id: string;
  name: string;
  category_id: string;
  unit: string;
  default_material_price: number;
  default_labor_price: number;
  size_label: string | null;
  default_colors: number;
  max_panel_height_m: number | null;
  roll_width_m: number | null;
};

type ToolPanelProps = {
  wallHeight: number;
  onToolSelect: (tool: {
    id: string;
    name: string;
    type: "line" | "area" | "circle" | "double-circle" | "square" | "large-square" | "thick-line" | "dashed-line";
  } | null) => void;
};

const CATEGORIES = {
  profile: "Профиль",
  fabric: "Ткань",
  membrane: "Мембрана",
  light: "Светильник",
  mounting_plate: "Закладная",
};

export default function ToolPanel({ wallHeight, onToolSelect }: ToolPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tools, setTools] = useState<ToolOption[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  useEffect(() => {
    loadTools();
  }, [selectedCategory, wallHeight]);

  const loadTools = async () => {
    if (!selectedCategory) {
      setTools([]);
      return;
    }

    let query = supabase
      .from("tool_options")
      .select("*")
      .eq("category_id", selectedCategory as "fabric" | "light" | "membrane" | "mounting_plate" | "profile")
      .eq("is_active", true)
      .order("name");

    // Filter fabrics by wall height
    if (selectedCategory === "fabric") {
      query = query.or(`max_panel_height_m.gte.${wallHeight},max_panel_height_m.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading tools:", error);
      return;
    }

    setTools(data || []);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setSelectedTool(null);
    onToolSelect(null);
  };

  const handleToolClick = (tool: ToolOption) => {
    setSelectedTool(tool.id);

    // Determine drawing type based on category and tool name
    let type: "line" | "area" | "circle" | "double-circle" | "square" | "large-square" | "thick-line" | "dashed-line" = "line";

    if (tool.category_id === "profile") {
      type = "line";
    } else if (tool.category_id === "fabric" || tool.category_id === "membrane") {
      type = "area";
    } else if (tool.category_id === "light") {
      type = "circle";
    } else if (tool.category_id === "mounting_plate") {
      if (tool.name.includes("Рондо")) {
        type = "double-circle";
      } else if (tool.name.includes("Мини")) {
        type = "square";
      } else if (tool.name.includes("Стандарт")) {
        type = "large-square";
      } else if (tool.name.includes("Потолок")) {
        type = "thick-line";
      } else if (tool.name.includes("Плинтус")) {
        type = "dashed-line";
      }
    }

    onToolSelect({
      id: tool.id,
      name: tool.name,
      type,
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Категории инструментов</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleCategoryClick(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {selectedCategory && tools.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="p-4">
              <h4 className="font-semibold mb-2 text-sm">Выберите инструмент:</h4>
              <div className="space-y-1">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={selectedTool === tool.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => handleToolClick(tool)}
                  >
                    {tool.name}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedCategory === "fabric" && tools.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            Нет доступных тканей для данной высоты стены ({wallHeight}м)
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
