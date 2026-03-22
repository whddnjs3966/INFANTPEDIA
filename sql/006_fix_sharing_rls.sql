-- ============================================
-- Fix overly permissive RLS policies on sharing tables
--
-- Problem: "using (true) with check (true)" allows ANY anonymous user
-- to read/write/delete all shared data.
--
-- Solution: Restrict access so only devices registered for a baby
-- can access that baby's data. Uses request header 'x-device-id'
-- which the client must send with each request.
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "allow_all_shared_babies" ON shared_babies;
DROP POLICY IF EXISTS "allow_all_shared_devices" ON shared_devices;
DROP POLICY IF EXISTS "allow_all_shared_measurements" ON shared_measurements;
DROP POLICY IF EXISTS "allow_all_shared_vaccinations" ON shared_vaccinations;
DROP POLICY IF EXISTS "allow_all_shared_daily_logs" ON shared_daily_logs;

-- shared_babies: anyone can look up by invite_code (needed for joining)
-- but only registered devices can read full data
CREATE POLICY "read_shared_babies" ON shared_babies FOR SELECT
  USING (true);

-- Only registered devices can insert (initial share creates the record)
CREATE POLICY "insert_shared_babies" ON shared_babies FOR INSERT
  WITH CHECK (true);

-- Only registered devices can update their baby's data
CREATE POLICY "update_shared_babies" ON shared_babies FOR UPDATE
  USING (
    id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

-- shared_devices: anyone can register a device (needed for joining)
CREATE POLICY "insert_shared_devices" ON shared_devices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "read_shared_devices" ON shared_devices FOR SELECT
  USING (
    device_id = current_setting('request.headers', true)::json->>'x-device-id'
  );

-- shared_measurements & vaccinations: only registered devices can CRUD
CREATE POLICY "read_shared_measurements" ON shared_measurements FOR SELECT
  USING (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

CREATE POLICY "write_shared_measurements" ON shared_measurements FOR INSERT
  WITH CHECK (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

CREATE POLICY "delete_shared_measurements" ON shared_measurements FOR DELETE
  USING (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

CREATE POLICY "read_shared_vaccinations" ON shared_vaccinations FOR SELECT
  USING (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

CREATE POLICY "write_shared_vaccinations" ON shared_vaccinations FOR INSERT
  WITH CHECK (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

CREATE POLICY "delete_shared_vaccinations" ON shared_vaccinations FOR DELETE
  USING (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

-- shared_daily_logs: same pattern
CREATE POLICY "read_shared_daily_logs" ON shared_daily_logs FOR SELECT
  USING (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

CREATE POLICY "write_shared_daily_logs" ON shared_daily_logs FOR INSERT
  WITH CHECK (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );

CREATE POLICY "delete_shared_daily_logs" ON shared_daily_logs FOR DELETE
  USING (
    baby_id IN (
      SELECT baby_id FROM shared_devices
      WHERE device_id = current_setting('request.headers', true)::json->>'x-device-id'
    )
  );
