"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Baby,
  Smartphone,
  Ruler,
  Syringe,
  ClipboardList,
  LogOut,
  RefreshCw,
  Trash2,
  Edit2,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./admin.css";

interface Stats {
  totals: {
    babies: number;
    devices: number;
    measurements: number;
    vaccinations: number;
    logs: number;
  };
  charts: {
    genderDistribution: { name: string; value: number }[];
    monthlyRegistrations: { month: string; count: number }[];
    ageDistribution: { age: string; count: number }[];
    logCategories: { name: string; value: number }[];
    dailyLogTrend: { date: string; count: number }[];
  };
}

interface BabyItem {
  id: string;
  name: string;
  birthdate: string;
  gender: string;
  invite_code: string;
  creator_email: string | null;
  created_at: string;
  updated_at: string;
  shared_devices: { count: number }[];
}

interface BabyDetail {
  baby: BabyItem;
  devices: { id: string; device_id: string; role: string; joined_at: string }[];
  measurements: {
    id: string;
    month: number;
    date: string;
    height: number | null;
    weight: number | null;
    head_circumference: number | null;
  }[];
  vaccinations: {
    id: string;
    vaccine_id: string;
    dose_number: number;
    completed_date: string | null;
  }[];
  dailyLogs: {
    id: string;
    date: string;
    time: string;
    category: string;
    amount: number | null;
    duration: number | null;
    note: string | null;
  }[];
}

const PIE_COLORS = ["#818cf8", "#f472b6", "#34d399", "#fbbf24"];
const CHART_COLORS = {
  primary: "#818cf8",
  secondary: "#f472b6",
  accent: "#34d399",
  area: "rgba(129, 140, 248, 0.2)",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [babies, setBabies] = useState<BabyItem[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<BabyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingBaby, setEditingBaby] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", birthdate: "", gender: "" });
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, babiesRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/babies"),
      ]);

      if (statsRes.status === 401 || babiesRes.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const statsData = await statsRes.json();
      const babiesData = await babiesRes.json();

      setStats(statsData);
      setBabies(babiesData.babies || []);
    } catch {
      router.replace("/admin/login");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  const handleViewDetail = async (babyId: string) => {
    if (selectedBaby?.baby.id === babyId && detailOpen) {
      setDetailOpen(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/babies/${babyId}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedBaby(data);
      setDetailOpen(true);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (babyId: string) => {
    try {
      const res = await fetch(`/api/admin/babies?id=${babyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBabies((prev) => prev.filter((b) => b.id !== babyId));
        if (selectedBaby?.baby.id === babyId) {
          setSelectedBaby(null);
          setDetailOpen(false);
        }
        setDeleteConfirm(null);
        handleRefresh();
      }
    } catch {
      // ignore
    }
  };

  const handleEditStart = (baby: BabyItem) => {
    setEditingBaby(baby.id);
    setEditForm({
      name: baby.name,
      birthdate: baby.birthdate,
      gender: baby.gender,
    });
  };

  const handleEditSave = async (babyId: string) => {
    try {
      const res = await fetch(`/api/admin/babies/${babyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingBaby(null);
        handleRefresh();
      }
    } catch {
      // ignore
    }
  };

  const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
      breastfeed: "모유수유",
      formula: "분유",
      babyfood: "이유식",
      diaper: "기저귀",
      sleep: "수면",
      bath: "목욕",
      medicine: "약",
      temperature: "체온",
      pump: "유축",
      snack: "간식",
    };
    return map[category] || category;
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-spinner" />
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <ShieldCheck size={24} />
          <h1>InfantPedia Admin</h1>
        </div>
        <div className="admin-header-right">
          <button
            onClick={handleRefresh}
            className="admin-btn-icon"
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? "spin" : ""} />
          </button>
          <button onClick={handleLogout} className="admin-btn-logout">
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card stat-babies">
          <div className="stat-icon-wrap">
            <Baby size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totals.babies || 0}</span>
            <span className="stat-label">등록된 아기</span>
          </div>
        </div>
        <div className="admin-stat-card stat-devices">
          <div className="stat-icon-wrap">
            <Smartphone size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totals.devices || 0}</span>
            <span className="stat-label">연결된 기기</span>
          </div>
        </div>
        <div className="admin-stat-card stat-measurements">
          <div className="stat-icon-wrap">
            <Ruler size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {stats?.totals.measurements || 0}
            </span>
            <span className="stat-label">성장 기록</span>
          </div>
        </div>
        <div className="admin-stat-card stat-vaccinations">
          <div className="stat-icon-wrap">
            <Syringe size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {stats?.totals.vaccinations || 0}
            </span>
            <span className="stat-label">예방접종</span>
          </div>
        </div>
        <div className="admin-stat-card stat-logs">
          <div className="stat-icon-wrap">
            <ClipboardList size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totals.logs || 0}</span>
            <span className="stat-label">일일 기록</span>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="admin-charts-grid">
        {/* Gender Distribution Pie Chart */}
        <div className="admin-chart-card">
          <h3>성별 분포</h3>
          {stats?.charts.genderDistribution &&
          stats.charts.genderDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.charts.genderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {stats.charts.genderDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e1b4b",
                    border: "1px solid #312e81",
                    borderRadius: "8px",
                    color: "#e0e7ff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">데이터 없음</div>
          )}
        </div>

        {/* Monthly Registrations Bar Chart */}
        <div className="admin-chart-card">
          <h3>월별 가입 추이</h3>
          {stats?.charts.monthlyRegistrations ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.charts.monthlyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e1b4b",
                    border: "1px solid #312e81",
                    borderRadius: "8px",
                    color: "#e0e7ff",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="등록 수"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">데이터 없음</div>
          )}
        </div>

        {/* Age Distribution Bar Chart */}
        <div className="admin-chart-card">
          <h3>연령대 분포</h3>
          {stats?.charts.ageDistribution &&
          stats.charts.ageDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.charts.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
                <XAxis
                  dataKey="age"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e1b4b",
                    border: "1px solid #312e81",
                    borderRadius: "8px",
                    color: "#e0e7ff",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="아기 수"
                  fill={CHART_COLORS.accent}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">데이터 없음</div>
          )}
        </div>

        {/* Daily Log Trend Area Chart */}
        <div className="admin-chart-card">
          <h3>일일 기록 추이 (최근 7일)</h3>
          {stats?.charts.dailyLogTrend ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.charts.dailyLogTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#312e81" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e1b4b",
                    border: "1px solid #312e81",
                    borderRadius: "8px",
                    color: "#e0e7ff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="기록 수"
                  stroke={CHART_COLORS.secondary}
                  fill={CHART_COLORS.area}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">데이터 없음</div>
          )}
        </div>

        {/* Log Categories Pie Chart */}
        {stats?.charts.logCategories &&
          stats.charts.logCategories.length > 0 && (
            <div className="admin-chart-card chart-wide">
              <h3>기록 카테고리 분포</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.charts.logCategories}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {stats.charts.logCategories.map((_, index) => (
                      <Cell
                        key={`cat-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1e1b4b",
                      border: "1px solid #312e81",
                      borderRadius: "8px",
                      color: "#e0e7ff",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#94a3b8", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
      </section>

      {/* Baby List Table */}
      <section className="admin-section">
        <h2>👶 등록된 아기 목록</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>계정</th>
                <th>생년월일</th>
                <th>성별</th>
                <th>초대코드</th>
                <th>기기 수</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {babies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-table-empty">
                    등록된 아기가 없습니다.
                  </td>
                </tr>
              ) : (
                babies.map((baby) => (
                  <tr
                    key={baby.id}
                    className={
                      selectedBaby?.baby.id === baby.id && detailOpen
                        ? "row-selected"
                        : ""
                    }
                  >
                    <td>
                      {editingBaby === baby.id ? (
                        <input
                          className="admin-edit-input"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <button
                          className="admin-name-btn"
                          onClick={() => handleViewDetail(baby.id)}
                        >
                          {baby.name}
                          {selectedBaby?.baby.id === baby.id && detailOpen ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                      )}
                    </td>
                    <td>
                      {baby.creator_email ? (
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                          {baby.creator_email}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600">익명 기기</span>
                      )}
                    </td>
                    <td>
                      {editingBaby === baby.id ? (
                        <input
                          type="date"
                          className="admin-edit-input"
                          value={editForm.birthdate}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              birthdate: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        baby.birthdate
                      )}
                    </td>
                    <td>
                      {editingBaby === baby.id ? (
                        <select
                          className="admin-edit-input"
                          value={editForm.gender}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              gender: e.target.value,
                            }))
                          }
                        >
                          <option value="male">남아</option>
                          <option value="female">여아</option>
                        </select>
                      ) : (
                        <span
                          className={`gender-badge ${baby.gender === "male" ? "male" : "female"}`}
                        >
                          {baby.gender === "male" ? "👦 남아" : "👧 여아"}
                        </span>
                      )}
                    </td>
                    <td>
                      <code className="invite-code">{baby.invite_code}</code>
                    </td>
                    <td>{baby.shared_devices?.[0]?.count || 0}</td>
                    <td>
                      {new Date(baby.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td>
                      <div className="admin-actions">
                        {editingBaby === baby.id ? (
                          <>
                            <button
                              className="admin-btn-sm admin-btn-save"
                              onClick={() => handleEditSave(baby.id)}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className="admin-btn-sm admin-btn-cancel"
                              onClick={() => setEditingBaby(null)}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="admin-btn-sm admin-btn-edit"
                              onClick={() => handleEditStart(baby)}
                            >
                              <Edit2 size={14} />
                            </button>
                            {deleteConfirm === baby.id ? (
                              <div className="delete-confirm">
                                <span>삭제?</span>
                                <button
                                  className="admin-btn-sm admin-btn-danger"
                                  onClick={() => handleDelete(baby.id)}
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  className="admin-btn-sm admin-btn-cancel"
                                  onClick={() => setDeleteConfirm(null)}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="admin-btn-sm admin-btn-delete"
                                onClick={() => setDeleteConfirm(baby.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Baby Detail Panel */}
      {selectedBaby && detailOpen && (
        <section className="admin-detail-panel">
          <div className="detail-header">
            <h2>
              📋 {selectedBaby.baby.name} 상세 정보
            </h2>
            <button
              className="admin-btn-icon"
              onClick={() => setDetailOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Devices */}
          <div className="detail-section">
            <h3>📱 연결된 기기 ({selectedBaby.devices.length})</h3>
            {selectedBaby.devices.length > 0 ? (
              <div className="detail-list">
                {selectedBaby.devices.map((d) => (
                  <div key={d.id} className="detail-item">
                    <span className="detail-item-label">기기 ID</span>
                    <code>{d.device_id.substring(0, 16)}...</code>
                    <span className="detail-item-meta">
                      {d.role} · {new Date(d.joined_at).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="detail-empty">연결된 기기가 없습니다.</p>
            )}
          </div>

          {/* Measurements */}
          <div className="detail-section">
            <h3>📏 성장 기록 ({selectedBaby.measurements.length})</h3>
            {selectedBaby.measurements.length > 0 ? (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>월령</th>
                    <th>날짜</th>
                    <th>키(cm)</th>
                    <th>체중(kg)</th>
                    <th>두위(cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBaby.measurements.map((m) => (
                    <tr key={m.id}>
                      <td>{m.month}개월</td>
                      <td>{m.date}</td>
                      <td>{m.height ?? "-"}</td>
                      <td>{m.weight ?? "-"}</td>
                      <td>{m.head_circumference ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="detail-empty">성장 기록이 없습니다.</p>
            )}
          </div>

          {/* Vaccinations */}
          <div className="detail-section">
            <h3>💉 예방접종 ({selectedBaby.vaccinations.length})</h3>
            {selectedBaby.vaccinations.length > 0 ? (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>백신</th>
                    <th>차수</th>
                    <th>접종일</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBaby.vaccinations.map((v) => (
                    <tr key={v.id}>
                      <td>{v.vaccine_id}</td>
                      <td>{v.dose_number}차</td>
                      <td>{v.completed_date || "미접종"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="detail-empty">예방접종 기록이 없습니다.</p>
            )}
          </div>

          {/* Daily Logs */}
          <div className="detail-section">
            <h3>📝 일일 기록 (최근 50건)</h3>
            {selectedBaby.dailyLogs.length > 0 ? (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>날짜</th>
                    <th>시간</th>
                    <th>카테고리</th>
                    <th>양/시간</th>
                    <th>메모</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBaby.dailyLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.date}</td>
                      <td>{log.time}</td>
                      <td>{getCategoryLabel(log.category)}</td>
                      <td>
                        {log.amount
                          ? `${log.amount}ml`
                          : log.duration
                            ? `${log.duration}분`
                            : "-"}
                      </td>
                      <td>{log.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="detail-empty">일일 기록이 없습니다.</p>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="admin-footer">
        <p>InfantPedia Admin Dashboard · Supabase Project: INFANTPEDIA</p>
      </footer>
    </div>
  );
}
