-- Replace compatible_cars with tags (run in Supabase SQL Editor).
-- Tags allow filtering by URL: /marketplace/list?tag=bmw-e46

-- Add tags column
alter table listings
  add column if not exists tags text[];

-- Migrate existing compatible_cars data to tags (if column existed)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'listings' and column_name = 'compatible_cars'
  ) then
    update listings set tags = compatible_cars where compatible_cars is not null;
    alter table listings drop column compatible_cars;
  end if;
end $$;

comment on column listings.tags is 'Optional tags for filtering (e.g. bmw-e46, audi-a4). Used in URL: /marketplace/list?tag=xyz';
