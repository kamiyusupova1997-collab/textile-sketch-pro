-- Add labor price and update seed data with real prices from the table

-- First, add labor price column to tool_options
ALTER TABLE public.tool_options
ADD COLUMN IF NOT EXISTS default_labor_price numeric NOT NULL DEFAULT 0;

-- Clear existing seed data to insert updated prices
DELETE FROM public.tool_options;

-- Insert FABRIC options with real prices (including labor from row 39: 1300₽/m2)
INSERT INTO public.tool_options (category_id, name, unit, default_material_price, default_labor_price, size_label, default_colors, calc_strategy, is_active, roll_width_m, max_panel_height_m, origin) VALUES
('fabric', 'КОМФОРТ', 'm2', 1650, 1300, '3,25м', 16, 'area', true, 3.25, 3.25, 'Россия'),
('fabric', 'КОМФОРТ Г1 В1 Д2 Т2', 'm2', 2900, 1300, '3,25м', 16, 'area', true, 3.25, 3.25, 'Россия'),
('fabric', 'ЛУНА', 'm2', 1800, 1300, '2,9м', 14, 'area', true, 2.9, 2.9, 'Турция'),
('fabric', 'МАРС', 'm2', 1800, 1300, '3м', 8, 'area', true, 3, 3, 'Турция'),
('fabric', 'КОМЕТА', 'm2', 1800, 1300, '3,2м', 4, 'area', true, 3.2, 3.2, 'Турция'),
('fabric', 'ОРЕОН', 'm2', 1800, 1300, '2,95м', 5, 'area', true, 2.95, 2.95, 'Турция'),
('fabric', 'FORM 138', 'm2', 1800, 1300, '3м', 9, 'area', true, 3, 3, 'Турция'),
('fabric', 'FORM 110', 'm2', 1800, 1300, '2,95м', 8, 'area', true, 2.95, 2.95, 'Турция'),
('fabric', 'Штукатурка 195 серия', 'm2', 2000, 1300, '2,9м', 13, 'area', true, 2.9, 2.9, 'Сев. Корея'),
('fabric', 'Классика 172 серия', 'm2', 2000, 1300, '2,9м', 3, 'area', true, 2.9, 2.9, 'Сев. Корея'),
('fabric', 'Узор 206 серия', 'm2', 2000, 1300, '3,2м', 18, 'area', true, 3.2, 3.2, 'Сев. Корея'),
('fabric', 'Акустик', 'm2', 2000, 1300, '3,2м', 8, 'area', true, 3.2, 3.2, 'Германия'),
('fabric', 'Вафля Silencio', 'm2', 2200, 1300, '3,2м; 5,05м', 1, 'area', true, 3.2, 3.2, 'Германия'),
('fabric', 'Formtex КМ-1', 'm2', 2700, 1300, '5,1м', 1, 'area', true, 5.1, 5.1, 'Германия');

-- Insert MEMBRANE options
INSERT INTO public.tool_options (category_id, name, unit, default_material_price, default_labor_price, size_label, default_colors, calc_strategy, is_active) VALUES
('membrane', 'Акустическая "Мембрана"', 'm2', 500, 1300, '1,05м', 0, 'area', true),
('membrane', 'Акустический "Войлок"', 'm2', 1200, 1300, '1,5м', 0, 'area', true);

-- Insert PROFILE options with corresponding labor prices
INSERT INTO public.tool_options (category_id, name, unit, default_material_price, default_labor_price, size_label, default_colors, calc_strategy, is_active) VALUES
('profile', 'Базовый-некрашеный', 'm', 450, 0, '2м', 0, 'length', true),
('profile', 'Базовый-черный', 'm', 450, 0, '2м', 0, 'length', true),
('profile', 'Плинтус Теневой', 'm', 750, 0, '2м', 0, 'length', true),
('profile', 'Отбойник', 'm', 550, 800, '2м,3м', 0, 'length', true),
('profile', 'Внутренний угол', 'm', 650, 800, '2м', 0, 'length', true),
('profile', 'Окно-Откос', 'm', 800, 0, '1м; 2м', 0, 'length', true),
('profile', 'Конструкционный', 'm', 500, 0, '1м; 2м', 0, 'length', true),
('profile', 'Разделитель 2мм', 'm', 800, 1600, '1м; 2м', 0, 'length', true),
('profile', 'КАСКАД-Некрашеный', 'm', 800, 0, '1м; 2м', 0, 'length', true),
('profile', 'Конструктор-Черный', 'm', 500, 0, '1м; 2м', 0, 'length', true),
('profile', 'Плинтус Контур Плюс', 'm', 900, 0, '2м', 0, 'length', true),
('profile', 'Световая Линия белая', 'm', 850, 0, '2м', 0, 'length', true),
('profile', 'Световая Линия черная', 'm', 850, 0, '2м', 0, 'length', true),
('profile', 'Стена-Потолок', 'm', 800, 0, '2м', 0, 'length', true);

-- Insert LIGHT options (no labor price in table, using 0)
INSERT INTO public.tool_options (category_id, name, unit, default_material_price, default_labor_price, size_label, default_colors, calc_strategy, is_active) VALUES
('light', 'Рондо Кратер База', 'pcs', 3500, 0, '0', 0, 'count', true),
('light', 'Рондо Кратер Плюс', 'pcs', 3500, 0, '0', 0, 'count', true),
('light', 'Рассеиватель (черный)', 'pcs', 350, 0, '2м', 0, 'count', true);

-- Insert EMBED options with corresponding labor prices
INSERT INTO public.tool_options (category_id, name, unit, default_material_price, default_labor_price, size_label, default_colors, calc_strategy, is_active) VALUES
('embed', 'Рондо', 'pcs', 400, 600, '0', 0, 'count', true),
('embed', 'Мини', 'pcs', 450, 450, '0', 0, 'count', true),
('embed', 'Стандарт', 'pcs', 800, 1000, '0', 0, 'count', true),
('embed', 'Потолок', 'm', 450, 650, '0', 0, 'length', true),
('embed', 'Плинтус', 'm', 400, 600, '0', 0, 'length', true);