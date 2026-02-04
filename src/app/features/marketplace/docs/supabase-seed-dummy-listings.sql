-- Dummy marketplace listings (car parts)
-- Run in Supabase SQL Editor after supabase-schema.sql.
-- Uses placeholder image URLs; replace with real URLs or Supabase Storage URLs as needed.

insert into listings (
  title,
  description,
  type,
  category,
  subcategory,
  condition,
  status,
  seller_email,
  price,
  attributes,
  image_urls
) values
(
  'Filtro de Óleo OEM Honda Civic',
  'Filtro de óleo original para Honda Civic. Compatível com motores 1.5 e 1.8. Novo, nunca utilizado.',
  'CAR_PART',
  'Motor',
  'Filtros',
  'NEW',
  'AVAILABLE',
  'brivelsport@hotmail.com',
  24.99,
  '{"brand": "OEM", "model": "Civic 1.5/1.8", "partCode": "15400-PLM-A01"}'::jsonb,
  array['https://placehold.co/600x400/1a1a1a/ffffff?text=Filtro+Oleo']
),
(
  'Pastilhas de Travão Brembo Frontais',
  'Pastilhas de travão Brembo para eixo dianteiro. Alta performance, baixo desgaste. Ideal para uso em pista.',
  'CAR_PART',
  'Travagem',
  'Pastilhas',
  'NEW',
  'AVAILABLE',
  'brivelsport@hotmail.com',
  189.00,
  '{"brand": "Brembo", "model": "P 83 049", "partCode": "P83049"}'::jsonb,
  array['https://placehold.co/600x400/1a1a1a/ffffff?text=Pastilhas+Brembo', 'https://placehold.co/600x400/2a2a2a/ffffff?text=Detalhe']
),
(
  'Disco de Embreagem Sachs Competition',
  'Disco de embreagem Sachs para competição. Suporta altas rotações e arranques fortes.',
  'CAR_PART',
  'Transmissão',
  'Embrague',
  'USED',
  'AVAILABLE',
  'brivelsport@hotmail.com',
  320.00,
  '{"brand": "Sachs", "model": "Competition", "partCode": "3000 951 001"}'::jsonb,
  array['https://placehold.co/600x400/1a1a1a/ffffff?text=Disco+Embreagem']
),
(
  'Radiador de Água Alumínio',
  'Radiador de alumínio reforçado para competição. Maior capacidade de arrefecimento.',
  'CAR_PART',
  'Motor',
  'Arrefecimento',
  'NEW',
  'AVAILABLE',
  'brivelsport@hotmail.com',
  450.00,
  '{"brand": "Mishimoto", "model": "Universal", "partCode": "MMRAD-UNI"}'::jsonb,
  array['https://placehold.co/600x400/1a1a1a/ffffff?text=Radiador']
),
(
  'Correia de Distribuição Gates',
  'Correia de distribuição Gates Racing. Kit completo com tensor. Para motor 2.0 16v.',
  'CAR_PART',
  'Motor',
  'Distribuição',
  'NEW',
  'AVAILABLE',
  'brivelsport@hotmail.com',
  85.50,
  '{"brand": "Gates", "model": "Racing", "partCode": "K015631XS"}'::jsonb,
  array['https://placehold.co/600x400/1a1a1a/ffffff?text=Correia+Gates']
);
