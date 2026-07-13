import LoginForm from "../../../components/LoginForm";

export default function AdminLoginPage({ searchParams }) {
  const nextPath = typeof searchParams?.next === "string" ? searchParams.next : "/admin";

  return (
    <section className="section auth-section" aria-labelledby="login-title">
      <div className="auth-card">
        <p className="eyebrow">Admin access</p>
        <h2 id="login-title">Sign in to manage ingestion</h2>
        <p>
          Use the admin credentials configured in the local environment to access publication
          ingestion and operational history.
        </p>
        <LoginForm nextPath={nextPath} />
      </div>
    </section>
  );
}
