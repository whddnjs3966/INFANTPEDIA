import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { isLocalAdminEnabled } from "@/lib/supabase/local-admin";
import "../admin.css";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  if (!isLocalAdminEnabled()) notFound();

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-login-icon-wrap"><ShieldCheck size={32} aria-hidden /></div>
          <h1>InfantPedia 관리자</h1>
          <p>지정된 테스트 계정으로 로그인한 뒤 관리자 화면을 다시 열어 주세요.</p>
        </div>
        <div className="admin-login-form">
          <Link className="admin-login-btn" href="/login">소셜 로그인 열기</Link>
          <Link className="admin-login-btn" href="/admin">관리자 화면 열기</Link>
        </div>
      </div>
    </div>
  );
}
