"use client";

import Image from "next/image";

import { getKoreaDate } from "@/lib/utils/date";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBabyStore, type BabyGender } from "@/lib/store/baby-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Plus,
  Check,
  UserPlus,
  Moon,
  Sun,
  LogIn,
  LogOut,
  ChevronRight,
  FileText,
  Info,
  Baby,
} from "lucide-react";
import { useThemeStore } from "@/lib/store/theme-store";
import SharingSection from "@/components/sharing/SharingSection";
import { useAuth } from "@/hooks/useAuth";
import StorageOverview from "@/components/settings/StorageOverview";
import DataLifecyclePanel from "@/components/settings/DataLifecyclePanel";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import "./settings.css";

const settingsTabs = [
  { id: "account", label: "내 계정", shortLabel: "계정" },
  { id: "babies", label: "아기 관리", shortLabel: "아기" },
  { id: "family", label: "가족과 공유", shortLabel: "가족" },
  { id: "app", label: "앱 환경", shortLabel: "환경" },
  { id: "data", label: "데이터 관리", shortLabel: "데이터" },
] as const;
type SettingsTab = typeof settingsTabs[number]["id"];
function tabFromHash(): SettingsTab {
  return settingsTabs.find(tab => window.location.hash === `#settings-${tab.id}`)?.id ?? "account";
}
function scrollToSettingsTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    let restoreFrame = 0;
    const restore = () => {
      setActiveTab(tabFromHash());
      // Run after the browser's history-position restoration without changing its global policy.
      cancelAnimationFrame(restoreFrame);
      restoreFrame = requestAnimationFrame(scrollToSettingsTop);
    };
    restore();
    window.addEventListener("hashchange", restore);
    window.addEventListener("popstate", restore);
    return () => {
      window.removeEventListener("hashchange", restore);
      window.removeEventListener("popstate", restore);
      cancelAnimationFrame(restoreFrame);
    };
  }, []);

  const selectTab = (tab: SettingsTab) => {
    scrollToSettingsTop();
    if (tab === activeTab) return;
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#settings-${tab}`);
    setActiveTab(tab);
  };
  const profile = useBabyStore((s) => s.profile);
  const photos = useBabyStore((s) => s.babyPhotos);
  const babies = useBabyStore((s) => s.babies);
  const activeBabyId = useBabyStore((s) => s.activeBabyId);
  const updateBaby = useBabyStore((s) => s.updateBaby);
  const addBaby = useBabyStore((s) => s.addBaby);
  const setActiveBaby = useBabyStore((s) => s.setActiveBaby);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { user, loading: authLoading, signOut } = useAuth();

  const [name, setName] = useState(profile?.name || "");
  const [loggingOut, setLoggingOut] = useState(false);
  const [birthdate, setBirthdate] = useState(profile?.birthdate || "");
  const [gender, setGender] = useState<BabyGender>(profile?.gender || "male");
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  useLayoutEffect(() => {
    if (activeTab) scrollToSettingsTop();
  }, [activeTab]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBirthdate, setNewBirthdate] = useState("");
  const [newGender, setNewGender] = useState<BabyGender>("male");

  useEffect(() => {
    if (!profile) return;
    const frame=requestAnimationFrame(()=>{
      setName(profile.name);setBirthdate(profile.birthdate);setGender(profile.gender || "male");
    });
    return()=>cancelAnimationFrame(frame);
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthdate || !profile) return;
    updateBaby(profile.id, { name: name.trim(), birthdate, gender });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEditMode(false);
    }, 1500);
  };

  const handleAddBaby = () => {
    if (!newName.trim() || !newBirthdate) return;
    addBaby({ name: newName.trim(), birthdate: newBirthdate, gender: newGender });
    setNewName("");
    setNewBirthdate("");
    setNewGender("male");
    setShowAddForm(false);
  };

  const activeId = profile?.id || activeBabyId;

  const activePhoto = profile && photos[profile.id];

  return (
    <div data-settings-redesign className="settings-page">
      <header className="settings-heading" data-page-header>
        <h1>설정</h1>
        <Image src="/images/redesign/house.webp" alt="" width={96} height={96} className="settings-house" />
      </header>

      <button type="button" data-settings-profile onClick={() => selectTab("babies")} className="settings-card settings-row settings-row-action">
        <span className="settings-avatar">
          {activePhoto ? <Image src={activePhoto} width={52} height={52} unoptimized alt="" /> : <Baby size={25} strokeWidth={1.7} aria-hidden />}
        </span>
        <span className="settings-row-main">
          <span className="settings-profile-name">{profile?.name || "아기 프로필"}</span>
          <span className="settings-note">현재 아기{profile?.birthdate ? ` · ${profile.birthdate}` : ""}</span>
        </span>
        <ChevronRight size={18} className="settings-chevron" aria-hidden />
      </button>

      <div role="tablist" aria-label="설정 항목" className="settings-tabs">
          {settingsTabs.map((item, index) => {
            const selected = activeTab === item.id;
            return <button
            key={item.id}
            ref={element => { tabButtons.current[index] = element; }}
            id={`settings-tab-${item.id}`}
            role="tab"
            type="button"
            aria-label={item.label}
            aria-selected={selected}
            aria-controls={`settings-panel-${item.id}`}
            tabIndex={(activeTab ?? "account") === item.id ? 0 : -1}
            onClick={() => selectTab(item.id)}
            onKeyDown={event => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % settingsTabs.length;
              else if (event.key === "ArrowLeft") next = (index + settingsTabs.length - 1) % settingsTabs.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = settingsTabs.length - 1;
              else return;
              event.preventDefault();
              selectTab(settingsTabs[next].id);
              tabButtons.current[next]?.focus({ preventScroll: true });
            }}
            className="settings-tab"
          >
            <span>{item.shortLabel}</span>
          </button>;
          })}
      </div>
      <section id="settings-panel-account" role="tabpanel" aria-labelledby="settings-tab-account" hidden={activeTab !== "account"} tabIndex={0} className="settings-panel">
        <div className="settings-panel-heading">
          <h2 id="settings-account-title">내 계정</h2>
          <span className="settings-note">{authLoading ? "확인 중" : user ? "로그인됨" : "로그인하지 않음"}</span>
        </div>
        <div className="settings-card">
          {authLoading ? (
            <p role="status" className="settings-row settings-note">로그인 상태를 확인하고 있어요.</p>
          ) : user ? (
            <>
              <div className="settings-row">
                <span className="settings-avatar settings-avatar-account">
                  {user.user_metadata?.avatar_url ? <Image src={user.user_metadata.avatar_url} width={48} height={48} unoptimized alt="" /> : <User size={21} aria-hidden />}
                </span>
                <span className="settings-row-main">
                  <span className="settings-label">{user.user_metadata?.full_name || user.user_metadata?.name || "사용자"}</span>
                  <span className="settings-note">{user.email}</span>
                </span>
              </div>
              <button type="button" onClick={async () => { setLoggingOut(true); try { await signOut(); } finally { setLoggingOut(false); } }} disabled={loggingOut} className="settings-row settings-row-action">
                <span className="settings-row-icon"><LogOut size={18} aria-hidden /></span>
                <span className="settings-label">{loggingOut ? "로그아웃 중…" : "로그아웃"}</span>
              </button>
            </>
          ) : (
            <button type="button" onClick={() => router.push("/login")} className="settings-row settings-row-action">
              <span className="settings-row-icon"><LogIn size={19} aria-hidden /></span>
              <span className="settings-row-main">
                <span className="settings-label">로그인하기</span>
                <span className="settings-note">계정 연결과 가족 공유</span>
              </span>
              <ChevronRight size={18} className="settings-chevron" aria-hidden />
            </button>
          )}
        </div>
      </section>

      <section id="settings-panel-babies" role="tabpanel" aria-labelledby="settings-tab-babies" hidden={activeTab !== "babies"} tabIndex={0} className="settings-panel">
        <div className="settings-panel-heading">
          <h2 id="settings-babies-title">아기 관리</h2>
          <span className="settings-note">{babies.length}명 등록</span>
        </div>

        {babies.length > 1 && (
          <div className="settings-card" role="group" aria-label="아기 전환">
            {babies.map(baby => (
              <button type="button" key={baby.id} onClick={() => setActiveBaby(baby.id)} aria-pressed={baby.id === activeId} className="settings-row settings-row-action settings-baby-option">
                <span className="settings-row-icon settings-row-icon-peach">
                  {photos[baby.id] ? <Image src={photos[baby.id]} width={36} height={36} unoptimized alt="" className="settings-baby-photo" /> : <Baby size={18} aria-hidden />}
                </span>
                <span className="settings-row-main">
                  <span className="settings-label">{baby.name}</span>
                  <span className="settings-note">{baby.birthdate}</span>
                </span>
                {baby.id === activeId && <Check size={18} className="settings-selected-check" aria-hidden />}
              </button>
            ))}
          </div>
        )}

        <div className="settings-card">
          {!editMode ? (
            <>
              <button type="button" onClick={() => setEditMode(true)} className="settings-row settings-row-action" aria-label="아기 프로필 편집">
                <span className="settings-row-icon"><Baby size={18} aria-hidden /></span>
                <span className="settings-label">아기 프로필</span>
                <span className="settings-note settings-end">편집</span>
                <ChevronRight size={18} className="settings-chevron" aria-hidden />
              </button>
              <dl className="settings-facts">
                <div><dt>이름</dt><dd>{profile?.name || "-"}</dd></div>
                <div><dt>성별</dt><dd>{profile ? profile.gender === "female" ? "여아" : "남아" : "-"}</dd></div>
                <div><dt>생년월일</dt><dd>{profile?.birthdate || "-"}</dd></div>
              </dl>
            </>
          ) : (
            <form onSubmit={handleSave} className="settings-form">
              <h3 className="settings-label">아기 프로필 편집</h3>
              <div className="space-y-1.5">
                <Label htmlFor="settings-name">아기 이름</Label>
                <Input id="settings-name" type="text" value={name} onChange={e => setName(e.target.value)} className="min-h-12 rounded-xl text-base" />
              </div>
              <fieldset className="space-y-1.5">
                <legend className="text-sm font-semibold">성별</legend>
                <div className="settings-choice-grid">
                  <button type="button" onClick={() => setGender("male")} aria-pressed={gender === "male"}>남아</button>
                  <button type="button" onClick={() => setGender("female")} aria-pressed={gender === "female"}>여아</button>
                </div>
              </fieldset>
              <div className="space-y-1.5">
                <Label htmlFor="settings-birth">생년월일</Label>
                <Input id="settings-birth" type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} max={getKoreaDate()} className="min-h-12 rounded-xl text-base" />
              </div>
              <div className="settings-form-actions">
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>취소</Button>
                <Button type="submit" className="settings-primary">{saved ? "저장됨!" : "저장"}</Button>
              </div>
            </form>
          )}
        </div>

        <div className="settings-card">
          {!showAddForm ? (
            <button type="button" onClick={() => setShowAddForm(true)} className="settings-row settings-row-action">
              <span className="settings-row-icon settings-row-icon-peach"><UserPlus size={18} aria-hidden /></span>
              <span className="settings-label">아이 추가</span>
              <Plus size={18} className="settings-chevron settings-end" aria-hidden />
            </button>
          ) : (
            <form onSubmit={event => { event.preventDefault(); handleAddBaby(); }} className="settings-form">
              <h3 className="settings-label">새 아이 등록</h3>
              <div className="space-y-1.5">
                <Label htmlFor="settings-new-name">새 아기 이름</Label>
                <Input id="settings-new-name" type="text" placeholder="아기 이름" value={newName} onChange={e => setNewName(e.target.value)} className="min-h-12 rounded-xl text-base" />
              </div>
              <fieldset className="space-y-1.5">
                <legend className="text-sm font-semibold">성별</legend>
                <div className="settings-choice-grid">
                  <button type="button" onClick={() => setNewGender("male")} aria-pressed={newGender === "male"}>남아</button>
                  <button type="button" onClick={() => setNewGender("female")} aria-pressed={newGender === "female"}>여아</button>
                </div>
              </fieldset>
              <div className="space-y-1.5">
                <Label htmlFor="settings-new-birth">새 아기 생년월일</Label>
                <Input id="settings-new-birth" type="date" value={newBirthdate} onChange={e => setNewBirthdate(e.target.value)} max={getKoreaDate()} className="min-h-12 rounded-xl text-base" />
              </div>
              <div className="settings-form-actions">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>취소</Button>
                <Button type="submit" disabled={!newName.trim() || !newBirthdate} className="settings-primary">등록</Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section id="settings-panel-family" role="tabpanel" aria-labelledby="settings-tab-family" hidden={activeTab !== "family"} tabIndex={0} className="settings-panel">
        <div className="settings-panel-heading"><h2 id="settings-family-title">가족과 공유</h2></div>
        <SharingSection />
      </section>

      <section id="settings-panel-app" role="tabpanel" aria-labelledby="settings-tab-app" hidden={activeTab !== "app"} tabIndex={0} className="settings-panel">
        <div className="settings-panel-heading"><h2 id="settings-app-title">앱 환경</h2></div>
        <div className="settings-card">
          <button type="button" onClick={toggleTheme} role="switch" aria-checked={theme === "dark"} aria-label="다크 모드" className="settings-row settings-row-action">
            <span className="settings-row-icon settings-row-icon-lavender">{theme === "dark" ? <Moon size={19} aria-hidden /> : <Sun size={19} aria-hidden />}</span>
            <span className="settings-row-main">
              <span className="settings-label">화면 테마</span>
              <span className="settings-note">{theme === "dark" ? "어두운 테마 사용 중" : "밝은 테마 사용 중"}</span>
            </span>
            <span aria-hidden className="settings-switch" />
          </button>
          <div className="settings-row">
            <span className="settings-row-icon"><Info size={18} aria-hidden /></span>
            <span className="settings-label">버전</span>
            <span className="settings-note settings-end">1.2.0</span>
          </div>
          <button type="button" onClick={() => router.push("/privacy")} className="settings-row settings-row-action">
            <span className="settings-row-icon"><FileText size={18} aria-hidden /></span>
            <span className="settings-label">개인정보처리방침</span>
            <ChevronRight size={18} className="settings-chevron settings-end" aria-hidden />
          </button>
        </div>
        <InstallPrompt />
        <div className="settings-reading-art" aria-hidden="true">
          <Image src="/images/home/moon.webp" alt="" width={77} height={71} />
          <Image src="/images/encyclopedia/book.webp" alt="" width={81} height={66} />
        </div>
      </section>

      <section id="settings-panel-data" role="tabpanel" aria-labelledby="settings-tab-data" hidden={activeTab !== "data"} tabIndex={0} className="settings-panel">
        <div className="settings-panel-heading"><h2 id="settings-data-title">데이터 관리</h2></div>
        <StorageOverview signedIn={!!user} checkingAccount={authLoading} accountId={user?.id} />
        <DataLifecyclePanel key={`data:${activeTab}:${profile?.id ?? "none"}`} />
      </section>
    </div>
  );
}



