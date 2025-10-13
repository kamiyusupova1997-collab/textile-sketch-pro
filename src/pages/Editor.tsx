import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type Project = {
  id: string;
  name: string;
  address: string;
};

type Room = {
  id: string;
  name: string;
  index: number;
};

type Wall = {
  id: string;
  name: string;
  length_m: number;
  height_m: number;
  area_m2: number;
};

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [selectedWall, setSelectedWall] = useState<Wall | null>(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (selectedRoom) {
      loadWalls(selectedRoom.id);
    }
  }, [selectedRoom]);

  const loadProject = async () => {
    if (!id) return;

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError) {
      toast.error("Ошибка загрузки проекта");
      navigate("/projects");
      return;
    }

    setProject(projectData);

    const { data: roomsData, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .eq("project_id", id)
      .order("index");

    if (roomsError) {
      toast.error("Ошибка загрузки комнат");
      return;
    }

    setRooms(roomsData);
    if (roomsData.length > 0) {
      setSelectedRoom(roomsData[0]);
    }
  };

  const loadWalls = async (roomId: string) => {
    const { data, error } = await supabase
      .from("walls")
      .select("*")
      .eq("room_id", roomId)
      .order("name");

    if (error) {
      toast.error("Ошибка загрузки стен");
      return;
    }

    setWalls(data);
    if (data.length > 0) {
      setSelectedWall(data[0]);
    }
  };

  if (!project) {
    return <div className="p-4">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">{project.address}</p>
            </div>
          </div>
          <Button>Сохранить</Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Room Tabs */}
          <div className="border-b bg-card p-2">
            <Tabs value={selectedRoom?.id} onValueChange={(value) => {
              const room = rooms.find(r => r.id === value);
              if (room) setSelectedRoom(room);
            }}>
              <TabsList>
                {rooms.map((room) => (
                  <TabsTrigger key={room.id} value={room.id}>
                    {room.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Walls List */}
          <div className="border-b bg-card p-2">
            <div className="flex gap-2 overflow-x-auto">
              {walls.map((wall) => (
                <Button
                  key={wall.id}
                  variant={selectedWall?.id === wall.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedWall(wall)}
                >
                  {wall.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4">
            <div className="canvas-grid w-full h-[800px] border rounded-lg relative">
              {selectedWall && (
                <div className="absolute top-4 left-4 bg-background/90 p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold mb-2">{selectedWall.name}</h3>
                  <div className="text-sm space-y-1">
                    <p>Длина: {selectedWall.length_m} м</p>
                    <p>Высота: {selectedWall.height_m} м</p>
                    <p>Площадь: {selectedWall.area_m2?.toFixed(2)} м²</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                Холст для рисования
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Tools & Properties */}
        <div className="w-96 border-l bg-card">
          <Tabs defaultValue="tools" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tools">Инструменты</TabsTrigger>
              <TabsTrigger value="wall">Позиции стены</TabsTrigger>
              <TabsTrigger value="estimate">Смета</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="flex-1 overflow-auto p-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Категории инструментов</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Профиль
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Ткань
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Мембрана
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Светильник
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Закладная
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="wall" className="flex-1 overflow-auto p-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Свойства стены</h3>
                {selectedWall && (
                  <div className="space-y-2 text-sm">
                    <p><strong>Название:</strong> {selectedWall.name}</p>
                    <p><strong>Длина:</strong> {selectedWall.length_m} м</p>
                    <p><strong>Высота:</strong> {selectedWall.height_m} м</p>
                    <p><strong>Площадь:</strong> {selectedWall.area_m2?.toFixed(2)} м²</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="estimate" className="flex-1 overflow-auto p-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Смета проекта</h3>
                <p className="text-sm text-muted-foreground">
                  Смета будет формироваться по мере добавления элементов на чертеж
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}