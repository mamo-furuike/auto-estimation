-- 車両プロジェクト（Neon / PostgreSQL）
-- Neon SQL Editor または psql で実行してください。

CREATE TABLE IF NOT EXISTS vehicle_projects (
  -- 内部 ID（アプリ側の v-1234 形式）
  id TEXT PRIMARY KEY,

  -- プロジェクト ID（画面表示用 #1234）
  display_id TEXT NOT NULL UNIQUE,

  -- 車名
  vehicle_name TEXT NOT NULL,

  -- 元請先名
  prime_contractor_name TEXT NOT NULL,

  -- お客様名
  customer_name TEXT NOT NULL,

  -- ナンバー（4 分割。アプリの formatPlate と一致）
  plate_office TEXT NOT NULL,
  plate_class TEXT NOT NULL,
  plate_hiragana TEXT NOT NULL,
  plate_number TEXT NOT NULL,

  -- 入庫日
  entry_date DATE NOT NULL,

  -- ステータス
  status TEXT NOT NULL CHECK (
    status IN ('awaiting_intake', 'photo_done', 'ai_analyzing')
  ),

  -- 見積・AI 関連（写真以外）。galleryImages は localStorage に保存
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_projects_entry_date
  ON vehicle_projects (entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_vehicle_projects_status
  ON vehicle_projects (status);
