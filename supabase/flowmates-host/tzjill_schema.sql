set check_function_bodies = off;
create schema if not exists tzjill;
grant usage on schema tzjill to anon, authenticated, service_role;
alter default privileges for role postgres in schema tzjill grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema tzjill grant all on functions to anon, authenticated, service_role;
alter default privileges for role postgres in schema tzjill grant all on sequences to anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION "tzjill"."api_rate_limit_hit"("p_bucket" "text", "p_ip_hash" "text", "p_window_seconds" integer, "p_limit" integer) RETURNS boolean
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'tzjill', 'pg_temp'
    AS $$
declare
  v_window timestamptz;
  v_count  integer;
begin
  if p_window_seconds is null or p_window_seconds < 1
     or p_limit is null or p_limit < 1
     or char_length(coalesce(p_bucket, '')) not between 1 and 40
     or char_length(coalesce(p_ip_hash, '')) not between 8 and 64 then
    raise exception 'invalid rate limit arguments';
  end if;

  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into tzjill.api_rate_limits as r (bucket, ip_hash, window_start, count, updated_at)
  values (p_bucket, p_ip_hash, v_window, 1, now())
  on conflict (bucket, ip_hash, window_start)
  do update set count = r.count + 1, updated_at = now()
  returning r.count into v_count;

  -- Af en toe opruimen (tellers zonder persoonsgegevens, ouder dan 1 dag).
  if random() < 0.02 then
    delete from tzjill.api_rate_limits where updated_at < now() - interval '1 day';
  end if;

  return v_count <= p_limit;
end;
$$;

ALTER FUNCTION "tzjill"."api_rate_limit_hit"("p_bucket" "text", "p_ip_hash" "text", "p_window_seconds" integer, "p_limit" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "tzjill"."cms_ensure_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'tzjill', 'pg_temp'
    AS $$
declare
  current_role text;
  total int;
  user_email text;
  owner_email constant text := 'martin@viraal.media';
begin
  if auth.uid() is null then
    return 'viewer';
  end if;

  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select role into current_role
  from tzjill.user_roles
  where user_id = auth.uid();

  if user_email = owner_email then
    if current_role is not null then
      update tzjill.user_roles
      set
        role = 'admin',
        status = 'active',
        email = coalesce(nullif(email, ''), user_email)
      where user_id = auth.uid();
    else
      insert into tzjill.user_roles (user_id, email, display_name, role, status)
      values (
        auth.uid(),
        user_email,
        coalesce(auth.jwt() ->> 'email', 'Admin'),
        'admin',
        'active'
      )
      on conflict (user_id) do update
        set role = 'admin', status = 'active';
    end if;
    return 'admin';
  end if;

  if current_role is not null then
    update tzjill.user_roles
    set
      status = 'active',
      email = case when email = '' then user_email else email end
    where user_id = auth.uid();
    return current_role;
  end if;

  select count(*) into total from tzjill.user_roles;
  if total = 0 then
    insert into tzjill.user_roles (user_id, email, display_name, role, status)
    values (
      auth.uid(),
      user_email,
      coalesce(auth.jwt() ->> 'email', 'Admin'),
      'admin',
      'active'
    );
    return 'admin';
  end if;

  insert into tzjill.user_roles (user_id, email, display_name, role, status)
  values (
    auth.uid(),
    user_email,
    coalesce(user_email, 'Gebruiker'),
    'viewer',
    'active'
  )
  on conflict (user_id) do nothing;

  return 'viewer';
end;
$$;

ALTER FUNCTION "tzjill"."cms_ensure_role"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "tzjill"."cms_is_editor"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'tzjill', 'pg_temp'
    AS $$
  select tzjill.cms_role() in ('admin', 'editor');
$$;

ALTER FUNCTION "tzjill"."cms_is_editor"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "tzjill"."cms_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'pg_catalog', 'tzjill', 'pg_temp'
    AS $$
  select coalesce(
    (
      select role
      from tzjill.user_roles
      where user_id = auth.uid()
      limit 1
    ),
    'viewer'
  );
$$;

ALTER FUNCTION "tzjill"."cms_role"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "tzjill"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'pg_catalog', 'pg_temp'
    AS $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

ALTER FUNCTION "tzjill"."set_updated_at"() OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."api_rate_limits" (
    "bucket" "text" NOT NULL,
    "ip_hash" "text" NOT NULL,
    "window_start" timestamp with time zone NOT NULL,
    "count" integer DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "api_rate_limits_bucket_check" CHECK ((("char_length"("bucket") >= 1) AND ("char_length"("bucket") <= 40))),
    CONSTRAINT "api_rate_limits_count_check" CHECK (("count" >= 0)),
    CONSTRAINT "api_rate_limits_ip_hash_check" CHECK ((("char_length"("ip_hash") >= 8) AND ("char_length"("ip_hash") <= 64)))
);

ALTER TABLE "tzjill"."api_rate_limits" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "genre" "text",
    "bio" "text",
    "image_url" "text",
    "image_alt" "text",
    "image_focus" "text",
    "image_focus_x" numeric,
    "image_focus_y" numeric,
    "image_scale" numeric,
    "art_direction_version" integer,
    "video_url" "text",
    "socials" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "tracks" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "sections" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "presskit_url" "text",
    "visible" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "published_at" timestamp with time zone,
    "videos" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    CONSTRAINT "artists_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text"])))
);

ALTER TABLE "tzjill"."artists" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."booking_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "country" "text" DEFAULT ''::"text" NOT NULL,
    "artists" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "city" "text" DEFAULT ''::"text" NOT NULL
);

ALTER TABLE "tzjill"."booking_requests" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."cms_artists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE "tzjill"."cms_artists" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."cms_content" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE "tzjill"."cms_content" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."media_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "kind" "text" NOT NULL,
    "mime_type" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "size" bigint NOT NULL,
    "width" integer,
    "height" integer,
    "duration" numeric,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "media_assets_kind_check" CHECK (("kind" = ANY (ARRAY['image'::"text", 'video'::"text"]))),
    CONSTRAINT "media_assets_size_check" CHECK (("size" >= 0))
);

ALTER TABLE "tzjill"."media_assets" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."site_health_cache" (
    "cache_key" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "fetched_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE "tzjill"."site_health_cache" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."site_rum" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "kind" "text" NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "value" double precision,
    "path" "text" DEFAULT ''::"text" NOT NULL,
    "message" "text" DEFAULT ''::"text" NOT NULL,
    "session_id" "text" DEFAULT ''::"text" NOT NULL,
    "city" "text" DEFAULT ''::"text" NOT NULL,
    "country" "text" DEFAULT ''::"text" NOT NULL
);

ALTER TABLE "tzjill"."site_rum" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."site_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE "tzjill"."site_settings" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."site_speed_tests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "origin" "text" NOT NULL,
    "score" integer,
    "lcp" double precision,
    "inp" double precision,
    "cls" double precision,
    "ttfb" double precision,
    "source" "text" DEFAULT 'pagespeed'::"text" NOT NULL,
    "optimized_at" timestamp with time zone,
    "optimize_summary" "text" DEFAULT ''::"text" NOT NULL
);

ALTER TABLE "tzjill"."site_speed_tests" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "image_url" "text",
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);

ALTER TABLE "tzjill"."team_members" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "tzjill"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "email" "text" DEFAULT ''::"text" NOT NULL,
    "display_name" "text" DEFAULT ''::"text" NOT NULL,
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'invited'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "user_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'viewer'::"text"]))),
    CONSTRAINT "user_roles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'invited'::"text"])))
);

ALTER TABLE "tzjill"."user_roles" OWNER TO "postgres";

ALTER TABLE ONLY "tzjill"."api_rate_limits"
    ADD CONSTRAINT "api_rate_limits_pkey" PRIMARY KEY ("bucket", "ip_hash", "window_start");

ALTER TABLE ONLY "tzjill"."artists"
    ADD CONSTRAINT "artists_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."artists"
    ADD CONSTRAINT "artists_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "tzjill"."booking_requests"
    ADD CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."cms_artists"
    ADD CONSTRAINT "cms_artists_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."cms_artists"
    ADD CONSTRAINT "cms_artists_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "tzjill"."cms_content"
    ADD CONSTRAINT "cms_content_key_key" UNIQUE ("key");

ALTER TABLE ONLY "tzjill"."cms_content"
    ADD CONSTRAINT "cms_content_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."media_assets"
    ADD CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."media_assets"
    ADD CONSTRAINT "media_assets_storage_path_key" UNIQUE ("storage_path");

ALTER TABLE ONLY "tzjill"."site_health_cache"
    ADD CONSTRAINT "site_health_cache_pkey" PRIMARY KEY ("cache_key");

ALTER TABLE ONLY "tzjill"."site_rum"
    ADD CONSTRAINT "site_rum_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."site_settings"
    ADD CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."site_speed_tests"
    ADD CONSTRAINT "site_speed_tests_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "tzjill"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");

CREATE INDEX "api_rate_limits_updated_at_idx" ON "tzjill"."api_rate_limits" USING "btree" ("updated_at");

CREATE INDEX "artists_slug_idx" ON "tzjill"."artists" USING "btree" ("slug");

CREATE INDEX "artists_status_visible_idx" ON "tzjill"."artists" USING "btree" ("status", "visible");

CREATE INDEX "artists_visible_name_idx" ON "tzjill"."artists" USING "btree" ("visible", "name");

CREATE INDEX "booking_requests_submitted_at_idx" ON "tzjill"."booking_requests" USING "btree" ("submitted_at" DESC);

CREATE INDEX "media_assets_kind_created_idx" ON "tzjill"."media_assets" USING "btree" ("kind", "created_at" DESC);

CREATE INDEX "site_rum_created_at_idx" ON "tzjill"."site_rum" USING "btree" ("created_at" DESC);

CREATE INDEX "site_rum_kind_created_idx" ON "tzjill"."site_rum" USING "btree" ("kind", "created_at" DESC);

CREATE INDEX "site_speed_tests_created_at_idx" ON "tzjill"."site_speed_tests" USING "btree" ("created_at" DESC);

CREATE OR REPLACE TRIGGER "artists_set_updated_at" BEFORE UPDATE ON "tzjill"."artists" FOR EACH ROW EXECUTE FUNCTION "tzjill"."set_updated_at"();

CREATE OR REPLACE TRIGGER "cms_artists_set_updated_at" BEFORE UPDATE ON "tzjill"."cms_artists" FOR EACH ROW EXECUTE FUNCTION "tzjill"."set_updated_at"();

CREATE OR REPLACE TRIGGER "cms_content_set_updated_at" BEFORE UPDATE ON "tzjill"."cms_content" FOR EACH ROW EXECUTE FUNCTION "tzjill"."set_updated_at"();

CREATE OR REPLACE TRIGGER "site_settings_set_updated_at" BEFORE UPDATE ON "tzjill"."site_settings" FOR EACH ROW EXECUTE FUNCTION "tzjill"."set_updated_at"();

CREATE OR REPLACE TRIGGER "team_members_set_updated_at" BEFORE UPDATE ON "tzjill"."team_members" FOR EACH ROW EXECUTE FUNCTION "tzjill"."set_updated_at"();

CREATE OR REPLACE TRIGGER "user_roles_set_updated_at" BEFORE UPDATE ON "tzjill"."user_roles" FOR EACH ROW EXECUTE FUNCTION "tzjill"."set_updated_at"();

ALTER TABLE ONLY "tzjill"."media_assets"
    ADD CONSTRAINT "media_assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "tzjill"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

CREATE POLICY "Anon can read public CMS keys" ON "tzjill"."cms_content" FOR SELECT TO "anon" USING (("key" = ANY (ARRAY['tzjill-public-site-v1'::"text", 'tzjill-public-artists-v3'::"text", 'tzjill-public-team-v1'::"text"])));

CREATE POLICY "Anyone can submit booking stats" ON "tzjill"."booking_requests" FOR INSERT TO "authenticated", "anon" WITH CHECK ((("jsonb_typeof"("artists") = 'array'::"text") AND (("jsonb_array_length"("artists") >= 1) AND ("jsonb_array_length"("artists") <= 25)) AND ("pg_column_size"("artists") <= 8192) AND ("char_length"("country") <= 120) AND ("char_length"("city") <= 120) AND (("submitted_at" >= ("now"() - '7 days'::interval)) AND ("submitted_at" <= ("now"() + '1 day'::interval)))));

CREATE POLICY "Anyone can submit site rum" ON "tzjill"."site_rum" FOR INSERT TO "authenticated", "anon" WITH CHECK ((("kind" = ANY (ARRAY['vital'::"text", 'error'::"text", 'presence'::"text", 'notfound'::"text"])) AND ("char_length"("name") <= 12) AND (("char_length"("path") >= 1) AND ("char_length"("path") <= 180)) AND ("char_length"("message") <= 280) AND ("char_length"("session_id") <= 64) AND ("char_length"("city") <= 80) AND ("char_length"("country") <= 8) AND (("value" IS NULL) OR (("value" <> 'NaN'::double precision) AND ("abs"("value") < ('1000000000'::numeric)::double precision))) AND (("created_at" >= ("now"() - '01:00:00'::interval)) AND ("created_at" <= ("now"() + '00:05:00'::interval)))));

CREATE POLICY "Authenticated can read CMS content" ON "tzjill"."cms_content" FOR SELECT TO "authenticated" USING (("key" !~~ 'tzjill-rate-limit:%'::"text"));

CREATE POLICY "Authenticated can read all CMS artists" ON "tzjill"."cms_artists" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Authenticated can read all artists" ON "tzjill"."artists" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "CMS can read speed tests" ON "tzjill"."site_speed_tests" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "Editors can delete CMS artists" ON "tzjill"."cms_artists" FOR DELETE TO "authenticated" USING ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can delete CMS content" ON "tzjill"."cms_content" FOR DELETE TO "authenticated" USING ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can delete artists" ON "tzjill"."artists" FOR DELETE TO "authenticated" USING ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can delete media assets" ON "tzjill"."media_assets" FOR DELETE TO "authenticated" USING ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can delete site settings" ON "tzjill"."site_settings" FOR DELETE TO "authenticated" USING ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can delete team members" ON "tzjill"."team_members" FOR DELETE TO "authenticated" USING ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can insert CMS artists" ON "tzjill"."cms_artists" FOR INSERT TO "authenticated" WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can insert CMS content" ON "tzjill"."cms_content" FOR INSERT TO "authenticated" WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can insert artists" ON "tzjill"."artists" FOR INSERT TO "authenticated" WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can insert media assets" ON "tzjill"."media_assets" FOR INSERT TO "authenticated" WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can insert site settings" ON "tzjill"."site_settings" FOR INSERT TO "authenticated" WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can insert speed tests" ON "tzjill"."site_speed_tests" FOR INSERT TO "authenticated" WITH CHECK (( SELECT "tzjill"."cms_is_editor"() AS "cms_is_editor"));

CREATE POLICY "Editors can insert team members" ON "tzjill"."team_members" FOR INSERT TO "authenticated" WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can read booking stats" ON "tzjill"."booking_requests" FOR SELECT TO "authenticated" USING (( SELECT "tzjill"."cms_is_editor"() AS "cms_is_editor"));

CREATE POLICY "Editors can read health cache" ON "tzjill"."site_health_cache" FOR SELECT TO "authenticated" USING (( SELECT "tzjill"."cms_is_editor"() AS "cms_is_editor"));

CREATE POLICY "Editors can read site rum" ON "tzjill"."site_rum" FOR SELECT TO "authenticated" USING (( SELECT "tzjill"."cms_is_editor"() AS "cms_is_editor"));

CREATE POLICY "Editors can update CMS artists" ON "tzjill"."cms_artists" FOR UPDATE TO "authenticated" USING ("tzjill"."cms_is_editor"()) WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can update CMS content" ON "tzjill"."cms_content" FOR UPDATE TO "authenticated" USING ("tzjill"."cms_is_editor"()) WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can update artists" ON "tzjill"."artists" FOR UPDATE TO "authenticated" USING ("tzjill"."cms_is_editor"()) WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can update media assets" ON "tzjill"."media_assets" FOR UPDATE TO "authenticated" USING ("tzjill"."cms_is_editor"()) WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can update site settings" ON "tzjill"."site_settings" FOR UPDATE TO "authenticated" USING ("tzjill"."cms_is_editor"()) WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Editors can update speed tests" ON "tzjill"."site_speed_tests" FOR UPDATE TO "authenticated" USING (( SELECT "tzjill"."cms_is_editor"() AS "cms_is_editor")) WITH CHECK (( SELECT "tzjill"."cms_is_editor"() AS "cms_is_editor"));

CREATE POLICY "Editors can update team members" ON "tzjill"."team_members" FOR UPDATE TO "authenticated" USING ("tzjill"."cms_is_editor"()) WITH CHECK ("tzjill"."cms_is_editor"());

CREATE POLICY "Public can read media assets" ON "tzjill"."media_assets" FOR SELECT TO "authenticated", "anon" USING (true);

CREATE POLICY "Public can read published CMS artists" ON "tzjill"."cms_artists" FOR SELECT TO "authenticated", "anon" USING ((COALESCE(("data" ->> 'status'::"text"), 'published'::"text") = 'published'::"text"));

CREATE POLICY "Public can read site settings" ON "tzjill"."site_settings" FOR SELECT TO "authenticated", "anon" USING (true);

CREATE POLICY "Public can read team members" ON "tzjill"."team_members" FOR SELECT TO "authenticated", "anon" USING (true);

CREATE POLICY "Public can read visible artists" ON "tzjill"."artists" FOR SELECT TO "authenticated", "anon" USING (("visible" = true));

CREATE POLICY "Users can read own role" ON "tzjill"."user_roles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR ("tzjill"."cms_role"() = 'admin'::"text")));

ALTER TABLE "tzjill"."api_rate_limits" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."artists" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."booking_requests" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."cms_artists" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."cms_content" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."media_assets" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."site_health_cache" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."site_rum" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."site_settings" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."site_speed_tests" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."team_members" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tzjill"."user_roles" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON FUNCTION "tzjill"."api_rate_limit_hit"("p_bucket" "text", "p_ip_hash" "text", "p_window_seconds" integer, "p_limit" integer) FROM PUBLIC;

GRANT ALL ON FUNCTION "tzjill"."api_rate_limit_hit"("p_bucket" "text", "p_ip_hash" "text", "p_window_seconds" integer, "p_limit" integer) TO "service_role";

REVOKE ALL ON FUNCTION "tzjill"."cms_ensure_role"() FROM PUBLIC;

GRANT ALL ON FUNCTION "tzjill"."cms_ensure_role"() TO "authenticated";

GRANT ALL ON FUNCTION "tzjill"."cms_ensure_role"() TO "service_role";

REVOKE ALL ON FUNCTION "tzjill"."cms_is_editor"() FROM PUBLIC;

GRANT ALL ON FUNCTION "tzjill"."cms_is_editor"() TO "authenticated";

GRANT ALL ON FUNCTION "tzjill"."cms_is_editor"() TO "service_role";

REVOKE ALL ON FUNCTION "tzjill"."cms_role"() FROM PUBLIC;

GRANT ALL ON FUNCTION "tzjill"."cms_role"() TO "authenticated";

GRANT ALL ON FUNCTION "tzjill"."cms_role"() TO "service_role";

REVOKE ALL ON FUNCTION "tzjill"."set_updated_at"() FROM PUBLIC;

GRANT ALL ON FUNCTION "tzjill"."set_updated_at"() TO "service_role";

GRANT ALL ON TABLE "tzjill"."api_rate_limits" TO "service_role";

GRANT ALL ON TABLE "tzjill"."artists" TO "anon";

GRANT ALL ON TABLE "tzjill"."artists" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."artists" TO "service_role";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."booking_requests" TO "anon";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."booking_requests" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."booking_requests" TO "service_role";

GRANT ALL ON TABLE "tzjill"."cms_artists" TO "anon";

GRANT ALL ON TABLE "tzjill"."cms_artists" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."cms_artists" TO "service_role";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."cms_content" TO "anon";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."cms_content" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."cms_content" TO "service_role";

GRANT ALL ON TABLE "tzjill"."media_assets" TO "anon";

GRANT ALL ON TABLE "tzjill"."media_assets" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."media_assets" TO "service_role";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."site_health_cache" TO "anon";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."site_health_cache" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."site_health_cache" TO "service_role";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."site_rum" TO "anon";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."site_rum" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."site_rum" TO "service_role";

GRANT ALL ON TABLE "tzjill"."site_settings" TO "anon";

GRANT ALL ON TABLE "tzjill"."site_settings" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."site_settings" TO "service_role";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."site_speed_tests" TO "anon";

GRANT SELECT,INSERT,DELETE,MAINTAIN,UPDATE ON TABLE "tzjill"."site_speed_tests" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."site_speed_tests" TO "service_role";

GRANT ALL ON TABLE "tzjill"."team_members" TO "anon";

GRANT ALL ON TABLE "tzjill"."team_members" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."team_members" TO "service_role";

GRANT ALL ON TABLE "tzjill"."user_roles" TO "anon";

GRANT ALL ON TABLE "tzjill"."user_roles" TO "authenticated";

GRANT ALL ON TABLE "tzjill"."user_roles" TO "service_role";
