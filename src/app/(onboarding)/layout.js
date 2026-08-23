export default function OnboardingLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        {children}
      </div>
    </div>
  );
}
