-- Adicionar constraint de uniqueness para nome + whatsapp
-- Esta garante que não seja possível cadastrar duplicatas do lado do banco

ALTER TABLE public.inscritos
ADD CONSTRAINT unique_nome_whatsapp UNIQUE (nome, whatsapp);
