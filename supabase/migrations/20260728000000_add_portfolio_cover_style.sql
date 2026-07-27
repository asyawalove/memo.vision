-- Notebook-style dashboard card cover (pattern + accent color), independent
-- from cover_image_url which is the public-page hero photo.
alter table public.portfolios
  add column if not exists cover_style jsonb not null
  default '{"pattern": "dots", "color": "#FFD6E8"}'::jsonb;
