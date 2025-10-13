import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Calculator, FileText, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">СтенаPro</h1>
          </div>
          <Button onClick={() => navigate("/auth")} variant="default">
            Вход / Регистрация
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6">
            Профессиональный расчет сметы
            <span className="block text-primary mt-2">для системы "Тихие Стены"</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Создавайте точные сметы отделки стен архитектурным текстилем за считанные минуты
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
            Начать работу
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Точный расчет</h3>
            <p className="text-muted-foreground">
              Автоматический подсчет материалов и работ с учетом всех параметров
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Визуальный редактор</h3>
            <p className="text-muted-foreground">
              Рисуйте планы стен и размещайте элементы на интерактивном холсте
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Готовые базы данных</h3>
            <p className="text-muted-foreground">
              Полный каталог профилей, тканей, светильников и комплектующих
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
