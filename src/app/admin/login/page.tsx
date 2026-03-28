"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        return;
      }

      router.push("/admin");
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg" />

      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-login-icon-wrap">
            <ShieldCheck size={32} />
          </div>
          <h1>InfantPedia Admin</h1>
          <p>관리자 전용 페이지입니다</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="admin-id">관리자 ID</label>
            <div className="admin-login-input-wrap">
              <User size={18} className="admin-login-input-icon" />
              <input
                id="admin-id"
                type="text"
                placeholder="ID를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-pass">비밀번호</label>
            <div className="admin-login-input-wrap">
              <Lock size={18} className="admin-login-input-icon" />
              <input
                id="admin-pass"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || !id || !password}
          >
            {loading ? (
              <span className="admin-login-spinner" />
            ) : (
              <>
                <Lock size={16} />
                로그인
              </>
            )}
          </button>
        </form>

        <p className="admin-login-footer">
          © 2026 InfantPedia. All rights reserved.
        </p>
      </div>
    </div>
  );
}
