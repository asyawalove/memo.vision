-- Per-portfolio page style settings (background/text color, font choice).
-- cover_image_url already exists from the initial portfolios migration.
alter table public.portfolios
  add column if not exists background_color text not null default '#F7F5F2',
  add column if not exists text_color text not null default '#26241F',
  add column if not exists font_family text not null default 'inter';

alter table public.portfolios drop constraint if exists portfolios_font_family_check;
alter table public.portfolios
  add constraint portfolios_font_family_check
  check (font_family in ('inter', 'serif', 'mono'));
