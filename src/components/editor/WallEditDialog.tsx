import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Wall = {
  id: string;
  name: string;
  length_m: number;
  height_m: number;
  area_m2: number;
};

type WallEditDialogProps = {
  wall: Wall;
  onUpdate: () => void;
};

export default function WallEditDialog({ wall, onUpdate }: WallEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [length, setLength] = useState(wall.length_m.toString());
  const [height, setHeight] = useState(wall.height_m.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const lengthNum = parseFloat(length);
    const heightNum = parseFloat(height);

    if (isNaN(lengthNum) || lengthNum <= 0) {
      toast.error("Укажите корректную длину");
      return;
    }

    if (isNaN(heightNum) || heightNum <= 0) {
      toast.error("Укажите корректную высоту");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("walls")
      .update({
        length_m: lengthNum,
        height_m: heightNum,
        area_m2: lengthNum * heightNum,
      })
      .eq("id", wall.id);

    setLoading(false);

    if (error) {
      toast.error("Ошибка обновления размеров");
      return;
    }

    toast.success("Размеры обновлены");
    setOpen(false);
    onUpdate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать размеры стены</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="length">Длина (м)</Label>
            <Input
              id="length"
              type="number"
              step="0.01"
              min="0"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="height">Высота (м)</Label>
            <Input
              id="height"
              type="number"
              step="0.01"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
