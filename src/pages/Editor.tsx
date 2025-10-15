import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Canvas from "@/components/editor/Canvas";
import ToolPanel from "@/components/editor/ToolPanel";
import EstimatePanel from "@/components/editor/EstimatePanel";
import WallProperties from "@/components/editor/WallProperties";
import WallEditDialog from "@/components/editor/WallEditDialog";
import PerimeterCalculator from "@/components/editor/PerimeterCalculator";

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
  canvas_data: any;
};

type CanvasElement = {
  id: string;
  type: "line" | "area" | "circle" | "double-circle" | "square" | "large-square" | "thick-line" | "dashed-line";
  toolOptionId: string;
  toolName: string;
  points: { x: number; y: number }[];
  length?: number;
  area?: number;
};

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [selectedWall, setSelectedWall] = useState<Wall | null>(null);
  const [currentTool, setCurrentTool] = useState<{
    id: string;
    name: string;
    type: "line" | "area" | "circle" | "double-circle" | "square" | "large-square" | "thick-line" | "dashed-line";
  } | null>(null);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (selectedRoom) {
      loadWalls(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedWall?.canvas_data) {
      setCanvasElements(selectedWall.canvas_data);
    } else {
      setCanvasElements([]);
    }
  }, [selectedWall]);

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

  const handleSave = async () => {
    if (!selectedWall) return;

    const { error } = await supabase
      .from("walls")
      .update({ canvas_data: canvasElements })
      .eq("id", selectedWall.id);

    if (error) {
      toast.error("Ошибка сохранения");
      return;
    }

    toast.success("Изменения сохранены");
  };

  const handleElementsChange = (elements: CanvasElement[]) => {
    setCanvasElements(elements);
  };

  const handleCalculateDimensions = async (length: number, height: number) => {
    if (!selectedWall) return;

    const { error } = await supabase
      .from("walls")
      .update({
        length_m: length,
        height_m: height,
        area_m2: length * height,
      })
      .eq("id", selectedWall.id);

    if (error) {
      toast.error("Ошибка обновления размеров");
      return;
    }

    toast.success(`Размеры стены обновлены: ${length}м × ${height}м`);
    loadProject();
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
          <Button onClick={handleSave}>Сохранить</Button>
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
            <div className="flex gap-2 overflow-x-auto items-center">
              {walls.map((wall) => (
                <div key={wall.id} className="flex items-center gap-1">
                  <Button
                    variant={selectedWall?.id === wall.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedWall(wall)}
                  >
                    {wall.name}
                  </Button>
                  {selectedWall?.id === wall.id && (
                    <WallEditDialog wall={wall} onUpdate={loadProject} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-4">
            {selectedWall ? (
              <div className="space-y-4">
                {selectedWall.length_m === 0 || selectedWall.height_m === 0 ? (
                  <>
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <p className="text-sm text-blue-900 mb-2">
                        <strong>Инструкция:</strong>
                      </p>
                      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Выберите профиль из панели инструментов справа</li>
                        <li>Нарисуйте периметр стены на холсте</li>
                        <li>Нажмите "Рассчитать" для определения размеров</li>
                        <li>После расчета можно добавлять другие элементы</li>
                      </ol>
                    </Card>
                    <PerimeterCalculator
                      elements={canvasElements}
                      onCalculate={handleCalculateDimensions}
                    />
                  </>
                ) : null}
                <Canvas
                  wallLength={selectedWall.length_m}
                  wallHeight={selectedWall.height_m}
                  currentTool={currentTool}
                  onElementsChange={handleElementsChange}
                />
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                Выберите стену для редактирования
              </Card>
            )}
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

            <TabsContent value="tools" className="flex-1 overflow-auto">
              {selectedWall ? (
                <ToolPanel
                  wallHeight={selectedWall.height_m}
                  onToolSelect={setCurrentTool}
                />
              ) : (
                <Card className="m-4 p-4">
                  <p className="text-sm text-muted-foreground">
                    Выберите стену для начала работы
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="wall" className="flex-1 overflow-auto">
              {selectedWall ? (
                <WallProperties
                  wall={selectedWall}
                  elements={canvasElements}
                  onEditDimensions={() => {}}
                />
              ) : (
                <Card className="m-4 p-4">
                  <p className="text-sm text-muted-foreground">
                    Выберите стену для просмотра свойств
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="estimate" className="flex-1 overflow-auto">
              {selectedWall ? (
                <EstimatePanel
                  wallId={selectedWall.id}
                  elements={canvasElements}
                />
              ) : (
                <Card className="m-4 p-4">
                  <p className="text-sm text-muted-foreground">
                    Выберите стену для формирования сметы
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}