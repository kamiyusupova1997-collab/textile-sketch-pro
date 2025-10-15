import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, LogOut } from "lucide-react";

type ToolOption = {
  id: string;
  category_id: string;
  name: string;
  unit: string;
  default_material_price: number;
  default_labor_price: number;
  size_label: string;
  default_colors: number;
  calc_strategy: string;
  is_active: boolean;
  roll_width_m?: number;
  max_panel_height_m?: number;
  origin?: string;
};

export default function Admin() {
  const navigate = useNavigate();
  const [tools, setTools] = useState<ToolOption[]>([]);
  const [editingTool, setEditingTool] = useState<ToolOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("admin_authenticated");
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    loadTools();
  }, [navigate]);

  const loadTools = async () => {
    const { data, error } = await supabase
      .from("tool_options")
      .select("*")
      .order("category_id")
      .order("name");

    if (error) {
      toast.error("Ошибка загрузки инструментов");
      return;
    }

    setTools(data || []);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    navigate("/admin/login");
  };

  const handleSave = async (tool: Partial<ToolOption>) => {
    if (editingTool?.id) {
      const { error } = await supabase
        .from("tool_options")
        .update(tool as any)
        .eq("id", editingTool.id);

      if (error) {
        toast.error("Ошибка обновления");
        return;
      }
      toast.success("Инструмент обновлен");
    } else {
      const { error } = await supabase
        .from("tool_options")
        .insert([tool as any]);

      if (error) {
        toast.error("Ошибка создания");
        return;
      }
      toast.success("Инструмент создан");
    }

    setIsDialogOpen(false);
    setEditingTool(null);
    loadTools();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить инструмент?")) return;

    const { error } = await supabase
      .from("tool_options")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Ошибка удаления");
      return;
    }

    toast.success("Инструмент удален");
    loadTools();
  };

  const getCategoryName = (id: string) => {
    const names: Record<string, string> = {
      profile: "Профиль",
      fabric: "Ткань",
      membrane: "Мембрана",
      light: "Светильник",
      mounting_plate: "Закладная"
    };
    return names[id] || id;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-7xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Админпанель - Управление инструментами</CardTitle>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingTool(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить инструмент
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTool ? "Редактировать инструмент" : "Новый инструмент"}
                    </DialogTitle>
                  </DialogHeader>
                  <ToolForm
                    tool={editingTool}
                    onSave={handleSave}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setEditingTool(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Выйти
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Категория</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Ед. изм.</TableHead>
                  <TableHead>Цена материала</TableHead>
                  <TableHead>Цена работы</TableHead>
                  <TableHead>Размер</TableHead>
                  <TableHead>Цвета</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell>
                      <Badge variant="outline">{getCategoryName(tool.category_id)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell>{tool.unit}</TableCell>
                    <TableCell>{tool.default_material_price} ₽</TableCell>
                    <TableCell>{tool.default_labor_price} ₽</TableCell>
                    <TableCell>{tool.size_label}</TableCell>
                    <TableCell>{tool.default_colors}</TableCell>
                    <TableCell>
                      <Badge variant={tool.is_active ? "default" : "secondary"}>
                        {tool.is_active ? "Активен" : "Неактивен"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTool(tool);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tool.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToolForm({
  tool,
  onSave,
  onCancel
}: {
  tool: ToolOption | null;
  onSave: (tool: Partial<ToolOption>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<ToolOption>>(
    tool || {
      category_id: "profile",
      name: "",
      unit: "м",
      default_material_price: 0,
      default_labor_price: 0,
      size_label: "",
      default_colors: 0,
      calc_strategy: "linear",
      is_active: true
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Категория</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">Профиль</SelectItem>
              <SelectItem value="fabric">Ткань</SelectItem>
              <SelectItem value="membrane">Мембрана</SelectItem>
              <SelectItem value="light">Светильник</SelectItem>
              <SelectItem value="mounting_plate">Закладная</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Название</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Единица измерения</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="м">м (метры)</SelectItem>
              <SelectItem value="м²">м² (квадратные метры)</SelectItem>
              <SelectItem value="шт">шт (штуки)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Стратегия расчета</Label>
          <Select
            value={formData.calc_strategy}
            onValueChange={(value) => setFormData({ ...formData, calc_strategy: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Длина</SelectItem>
              <SelectItem value="area">Площадь</SelectItem>
              <SelectItem value="count">Количество</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Цена материала (₽)</Label>
          <Input
            type="number"
            value={formData.default_material_price}
            onChange={(e) => setFormData({ ...formData, default_material_price: Number(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Цена работы (₽)</Label>
          <Input
            type="number"
            value={formData.default_labor_price}
            onChange={(e) => setFormData({ ...formData, default_labor_price: Number(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Размер</Label>
          <Input
            value={formData.size_label}
            onChange={(e) => setFormData({ ...formData, size_label: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Количество цветов</Label>
          <Input
            type="number"
            value={formData.default_colors}
            onChange={(e) => setFormData({ ...formData, default_colors: Number(e.target.value) })}
          />
        </div>

        {formData.category_id === "fabric" && (
          <>
            <div className="space-y-2">
              <Label>Ширина рулона (м)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.roll_width_m || ""}
                onChange={(e) => setFormData({ ...formData, roll_width_m: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Макс. высота панели (м)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.max_panel_height_m || ""}
                onChange={(e) => setFormData({ ...formData, max_panel_height_m: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Происхождение</Label>
              <Input
                value={formData.origin || ""}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4"
        />
        <Label htmlFor="is_active">Активен</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  );
}