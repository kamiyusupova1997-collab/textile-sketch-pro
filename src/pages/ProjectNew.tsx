import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ProjectNew() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    customerName: "",
    customerPhone: "",
    objectType: "",
    totalRooms: 1,
    wallsPerRoom: {} as Record<number, number>
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name || !formData.address || !formData.customerName || !formData.customerPhone) {
        toast.error("Заполните все поля");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.objectType) {
        toast.error("Выберите тип объекта");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      createProject();
    }
  };

  const createProject = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate("/auth");
      return;
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert([{
        user_id: session.user.id,
        name: formData.name,
        address: formData.address,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        object_type: formData.objectType as "apartment" | "house" | "commercial",
        total_rooms: formData.totalRooms
      }])
      .select()
      .single();

    if (projectError) {
      toast.error("Ошибка создания проекта");
      return;
    }

    // Create rooms
    const roomsToCreate = [];
    for (let i = 1; i <= formData.totalRooms; i++) {
      roomsToCreate.push({
        project_id: project.id,
        name: `Комната ${i}`,
        index: i
      });
    }

    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .insert(roomsToCreate)
      .select();

    if (roomsError) {
      toast.error("Ошибка создания комнат");
      return;
    }

    // Create walls for each room
    const wallsToCreate = [];
    rooms.forEach((room, idx) => {
      const wallCount = formData.wallsPerRoom[idx + 1] || 4;
      for (let w = 1; w <= wallCount; w++) {
        wallsToCreate.push({
          room_id: room.id,
          name: `Стена ${w}`,
          length_m: 0,
          height_m: 0,
          area_m2: 0
        });
      }
    });

    const { error: wallsError } = await supabase
      .from("walls")
      .insert(wallsToCreate);

    if (wallsError) {
      toast.error("Ошибка создания стен");
      return;
    }

    toast.success("Проект создан!");
    navigate(`/projects/${project.id}/editor`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к проектам
          </Button>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Создание нового проекта</CardTitle>
            <CardDescription>Шаг {step} из 4</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Название проекта</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Например: Квартира на ул. Ленина"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Адрес</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="г. Москва, ул. Ленина, д. 1, кв. 10"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">ФИО заказчика</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Телефон заказчика</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <Label>Тип объекта</Label>
                <Select value={formData.objectType} onValueChange={(v) => setFormData({ ...formData, objectType: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип объекта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Квартира</SelectItem>
                    <SelectItem value="house">Дом</SelectItem>
                    <SelectItem value="commercial">Коммерческий объект</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 3 && (
              <div>
                <Label>Количество комнат</Label>
                <Select 
                  value={formData.totalRooms.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, totalRooms: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "комната" : num < 5 ? "комнаты" : "комнат"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Укажите количество стен для каждой комнаты
                </p>
                {Array.from({ length: formData.totalRooms }, (_, i) => i + 1).map((roomNum) => (
                  <div key={roomNum}>
                    <Label>Комната {roomNum}</Label>
                    <Select
                      value={formData.wallsPerRoom[roomNum]?.toString() || "4"}
                      onValueChange={(v) => setFormData({
                        ...formData,
                        wallsPerRoom: { ...formData.wallsPerRoom, [roomNum]: parseInt(v) }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? "стена" : num < 5 ? "стены" : "стен"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)}>
                  Назад
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {step === 4 ? "Создать проект" : "Далее"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
