import { useState } from "react";
import { useAuth } from "../context/AuthContext";
export default function Auth() {
  const { login, signup, google, reset } = useAuth();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", pw: "" });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const run = async (fn, ok) => {
    try { await fn(); if (ok) setMsg({ type: "ok", text: ok }); }
    catch (e) { setMsg({ type: "err", text: e.code?.replace("auth/", "").replaceAll("-", " ") || e.message }); }
  };
  const submit = (e) => {
    e.preventDefault();
    if (mode === "login") run(() => login(f.email, f.pw));
    if (mode === "signup") run(() => signup(f.name, f.email, f.pw));
    if (mode === "reset") run(() => reset(f.email), "Reset link sent. Check your inbox.");
  };
  return (
    <main className="auth">
      <section className="auth-art"><div className="logo big"><b>T</b> base</div>
        <h1>Every genre.<br/>Offline when you want it.</h1></section>
      <form className="card" onSubmit={submit}>
        <h2>{mode === "login" ? "Log in" : mode === "signup" ? "Create your account" : "Reset password"}</h2>
        {mode === "signup" && <input placeholder="Your name" value={f.name} onChange={set("name")} required />}
        <input type="email" placeholder="Email" value={f.email} onChange={set("email")} required />
        {mode !== "reset" && <input type="password" placeholder="Password (6+ characters)" minLength={6} value={f.pw} onChange={set("pw")} required />}
        {msg.text && <p className={msg.type}>{msg.text}</p>}
        <button className="primary">{mode === "login" ? "Log in" : mode === "signup" ? "Sign up" : "Send reset link"}</button>
        {mode !== "reset" && <button type="button" className="ghost" onClick={() => run(google)}>Continue with Google</button>}
        <div className="links">
          {mode !== "login" && <a onClick={() => setMode("login")}>Back to log in</a>}
          {mode === "login" && <><a onClick={() => setMode("signup")}>Create account</a><a onClick={() => setMode("reset")}>Forgot password?</a></>}
        </div>
      </form>
    </main>
  );
}
