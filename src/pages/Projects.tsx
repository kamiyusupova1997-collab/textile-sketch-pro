import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, LogOut, FolderOpen, Settings } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

type Project = {
  id: string;
  name: string;
  address: string;
  customer_name: string;
  customer_phone: string;
  object_type: string;
  total_rooms: number;
  created_at: string;
};

export default function Projects() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    loadProjects(session.user.id);
  };

  const loadProjects = async (userId: string) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Ошибка загрузки проектов");
      setLoading(false);
      return;
    }

    setProjects(data || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU");
  };

  const objectTypeLabels = {
    apartment: "Квартира",
    house: "Дом",
    commercial: "Коммерческий объект"
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Мои проекты</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/login")}>
              <Settings className="h-4 w-4 mr-2" />
              Админ
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={() => navigate("/projects/new")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Создать новый проект
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Загрузка проектов...
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground mb-4">
                У вас пока нет проектов
              </p>
              <Button onClick={() => navigate("/projects/new")}>
                Создать первый проект
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}/editor`)}>
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Заказчик:</span>{" "}
                      {project.customer_name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Тип:</span>{" "}
                      {objectTypeLabels[project.object_type as keyof typeof objectTypeLabels]}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Комнат:</span>{" "}
                      {project.total_rooms}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Создан: {formatDate(project.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
