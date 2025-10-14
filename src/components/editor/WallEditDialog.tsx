import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type WallEditDialogProps = {
  wall: {
    id: string;
    name: string;
    length_m: number;
    height_m: number;
  };
  onUpdate: () => void;
};

export default function WallEditDialog({ wall, onUpdate }: WallEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [length, setLength] = useState(wall.length_m.toString());
  const [height, setHeight] = useState(wall.height_m.toString());
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const lengthNum = parseFloat(length);
    const heightNum = parseFloat(height);

    if (!lengthNum || lengthNum <= 0 || !heightNum || heightNum <= 0) {
      toast.error("Введите корректные размеры");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("walls")
      .update({
        length_m: lengthNum,
        height_m: heightNum,
        area_m2: lengthNum * heightNum,
      })
      .eq("id", wall.id);

    setSaving(false);

    if (error) {
      toast.error("Ошибка сохранения");
      return;
    }

    toast.success("Размеры сохранены");
    setOpen(false);
    onUpdate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать размеры: {wall.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="length">Длина стены (м)</Label>
            <Input
              id="length"
              type="number"
              step="0.1"
              min="0.1"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="Например: 3.5"
            />
          </div>
          <div>
            <Label htmlFor="height">Высота стены (м)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              min="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Например: 2.7"
            />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
