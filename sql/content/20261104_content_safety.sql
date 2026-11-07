-- Prepared content-only migration. NOT applied to production.
-- Review the captured before/after values and take an editorial backup first.
begin;

do $$
declare changed integer;
begin
  update public.parenting_tips set content='수유 후 깨어 있는 아기를 안아 편안하게 돌봐주세요. 잠잘 때는 트림 여부와 관계없이 등을 대고 단단하고 평평한 수면 면에 눕혀요. 옆으로 눕히거나 베개·수건으로 자세를 고정해 재우지 마세요.' where id=12 and content='수유 후 5~10분간 세워 안고 등을 가볍게 두드려 트림시켜 주세요. 트림이 안 나오면 옆으로 눕혀 재워도 됩니다.';
  get diagnostics changed=row_count;
  if changed=0 and not exists(select 1 from public.parenting_tips where id=12 and content='수유 후 깨어 있는 아기를 안아 편안하게 돌봐주세요. 잠잘 때는 트림 여부와 관계없이 등을 대고 단단하고 평평한 수면 면에 눕혀요. 옆으로 눕히거나 베개·수건으로 자세를 고정해 재우지 마세요.') then
    raise exception 'CONTENT_REVISION_CHANGED: parenting_tips/12';
  end if;
end $$;

do $$
declare changed integer;
begin
  update public.activities set content='밤에 깨거나 먹는 양상은 아기마다 달라요. 월령만으로 밤중 수유를 끊거나 줄이지 마세요. 배고픈 신호와 성장·섭취 상태를 살피고, 수유 조절이 필요하면 의료진과 상담하세요. 낮밤의 차이를 알려주는 편안한 돌봄 루틴을 만들어볼 수 있어요.' where id=27 and content='6개월이 되면 영양학적으로 밤중 수유 없이 밤새 잘 수 있습니다. 밤중 수유를 줄이려면 잠들기 전 충분한 수유를 하고, 밤에 깼을 때 바로 수유 대신 토닥임으로 재우기를 시도하세요. 깨시는 120~150분이며, 낮잠은 하루 2~3회로 안정됩니다. 일관된 취침 시간(저녁 7~8시)을 정해 지키는 것이 좋습니다.';
  get diagnostics changed=row_count;
  if changed=0 and not exists(select 1 from public.activities where id=27 and content='밤에 깨거나 먹는 양상은 아기마다 달라요. 월령만으로 밤중 수유를 끊거나 줄이지 마세요. 배고픈 신호와 성장·섭취 상태를 살피고, 수유 조절이 필요하면 의료진과 상담하세요. 낮밤의 차이를 알려주는 편안한 돌봄 루틴을 만들어볼 수 있어요.') then
    raise exception 'CONTENT_REVISION_CHANGED: activities/27';
  end if;
end $$;

commit;
