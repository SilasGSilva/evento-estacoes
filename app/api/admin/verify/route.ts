import { NextResponse } from "next/server";

type VerifyBody = {
  password?: string;
};

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, message: "Defina ADMIN_PASSWORD nas variaveis de ambiente." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as VerifyBody;

  if (!body.password) {
    return NextResponse.json({ ok: false, message: "Senha obrigatoria." }, { status: 400 });
  }

  if (body.password !== adminPassword) {
    return NextResponse.json({ ok: false, message: "Senha invalida." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
