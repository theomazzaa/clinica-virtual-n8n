"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "", apellido: "", email: "", password: "",
    matricula: "", especialidad: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Error al registrarse");
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo_docagent.png" alt="DocAgent" className="w-64 h-64 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">DocAgent</h1>
            <p className="text-xs text-[#64748B]">Panel médico clínica virtual</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
          <h2 className="text-xl font-semibold text-[#1E293B] mb-1">Registro de médico</h2>
          <p className="text-sm text-[#64748B] mb-6">Completá tus datos para acceder al panel</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Nombre</label>
                <input
                  name="nombre" type="text" value={form.nombre} onChange={handleChange}
                  required placeholder="Blas"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Apellido</label>
                <input
                  name="apellido" type="text" value={form.apellido} onChange={handleChange}
                  required placeholder="Mazza"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                required placeholder="doctor@email.com"
                className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Contraseña</label>
              <input
                name="password" type="password" value={form.password} onChange={handleChange}
                required placeholder="••••••••" minLength={6}
                className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Matrícula</label>
                <input
                  name="matricula" type="text" value={form.matricula} onChange={handleChange}
                  required placeholder="90883"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1E293B] mb-1.5">Especialidad</label>
                <input
                  name="especialidad" type="text" value={form.especialidad} onChange={handleChange}
                  placeholder="Clínica médica"
                  className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-colors disabled:opacity-60"
            >
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[#2563EB] hover:underline font-medium">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
