/**
 * Minimal SMTP client (AUTH LOGIN / AUTH PLAIN) that works both on the edge
 * runtime (cloudflare:sockets) and on Node during local development.
 * Server only.
 */

type Duplex = {
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
  startTls?: () => Duplex;
  close: () => Promise<void> | void;
};

export type SmtpConfig = {
  host: string;
  port: number;
  /** true = implicit TLS (usually port 465); false = plain + STARTTLS upgrade (587/25) */
  secure: boolean;
  username: string;
  password: string;
};

export type SmtpMessage = {
  from: { name: string; email: string };
  to: string;
  subject: string;
  html: string;
  replyTo?: string | null;
};

async function openSocket(cfg: SmtpConfig): Promise<Duplex> {
  try {
    const mod = (await import(/* @vite-ignore */ ("cloudflare" + ":sockets"))) as unknown as {
      connect: (addr: { hostname: string; port: number }, opts?: Record<string, unknown>) => Duplex;
    };
    const { connect } = mod;
    return connect(
      { hostname: cfg.host, port: cfg.port },
      { secureTransport: cfg.secure ? "on" : "starttls", allowHalfOpen: false },
    );
  } catch {
    // Node fallback (vite dev)
    const net = await import(/* @vite-ignore */ "node:net");
    const tls = await import(/* @vite-ignore */ "node:tls");
    const { Readable, Writable } = await import(/* @vite-ignore */ "node:stream");

    const wrap = (sock: import("node:net").Socket): Duplex => ({
      readable: Readable.toWeb(sock) as unknown as ReadableStream<Uint8Array>,
      writable: Writable.toWeb(sock) as unknown as WritableStream<Uint8Array>,
      startTls: () => {
        const upgraded = tls.connect({ socket: sock, servername: cfg.host, rejectUnauthorized: false });
        return wrap(upgraded as unknown as import("node:net").Socket);
      },
      close: () => {
        sock.destroy();
      },
    });

    const sock = cfg.secure
      ? (tls.connect({ host: cfg.host, port: cfg.port, servername: cfg.host }) as unknown as import("node:net").Socket)
      : net.connect({ host: cfg.host, port: cfg.port });
    await new Promise<void>((resolve, reject) => {
      sock.once(cfg.secure ? "secureConnect" : "connect", () => resolve());
      sock.once("error", reject);
    });
    return wrap(sock);
  }
}

class Conn {
  private reader: ReadableStreamDefaultReader<Uint8Array>;
  private writer: WritableStreamDefaultWriter<Uint8Array>;
  private buffer = "";
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();

  constructor(private socket: Duplex) {
    this.reader = socket.readable.getReader();
    this.writer = socket.writable.getWriter();
  }

  async readReply(): Promise<{ code: number; text: string }> {
    // SMTP replies end with a line "NNN <text>" (space, not dash).
    for (;;) {
      const match = /^(?:\d{3}-[^\n]*\n)*(\d{3}) [^\n]*\n/.exec(this.buffer);
      if (match) {
        const consumed = match[0];
        this.buffer = this.buffer.slice(consumed.length);
        return { code: Number(match[1]), text: consumed.trim() };
      }
      const { value, done } = await this.reader.read();
      if (done) throw new Error(`SMTP connection closed unexpectedly: ${this.buffer.trim() || "no reply"}`);
      this.buffer += this.decoder.decode(value, { stream: true });
    }
  }

  async send(line: string) {
    await this.writer.write(this.encoder.encode(`${line}\r\n`));
  }

  async cmd(line: string, expect: number[], label: string) {
    await this.send(line);
    const reply = await this.readReply();
    if (!expect.includes(reply.code)) throw new Error(`SMTP ${label} failed: ${reply.text}`);
    return reply;
  }

  async close() {
    try {
      await this.writer.close();
    } catch {
      /* ignore */
    }
    try {
      await this.socket.close();
    } catch {
      /* ignore */
    }
  }

  detach(): Duplex {
    this.reader.releaseLock();
    this.writer.releaseLock();
    return this.socket;
  }
}

function b64(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function dotStuff(body: string) {
  return body.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

function buildMessage(m: SmtpMessage) {
  const boundaryless = dotStuff(m.html);
  const headers = [
    `From: ${m.from.name ? `${m.from.name} <${m.from.email}>` : m.from.email}`,
    `To: ${m.to}`,
    ...(m.replyTo ? [`Reply-To: ${m.replyTo}`] : []),
    `Subject: ${/[^\x20-\x7e]/.test(m.subject) ? `=?UTF-8?B?${b64(m.subject)}?=` : m.subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${m.from.email.split("@")[1] ?? "localhost"}>`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
  ];
  return `${headers.join("\r\n")}\r\n\r\n${boundaryless}\r\n.`;
}

/** Delivers one message over SMTP. Throws with a readable error on failure. */
export async function sendViaSmtp(cfg: SmtpConfig, m: SmtpMessage): Promise<void> {
  if (!cfg.host?.trim()) throw new Error("No SMTP host saved in admin settings");

  let socket = await openSocket(cfg);
  let conn = new Conn(socket);
  try {
    const greeting = await conn.readReply();
    if (greeting.code !== 220) throw new Error(`SMTP greeting failed: ${greeting.text}`);

    const ehloName = m.from.email.split("@")[1] ?? "localhost";
    let caps = (await conn.cmd(`EHLO ${ehloName}`, [250], "EHLO")).text;

    if (!cfg.secure) {
      await conn.cmd("STARTTLS", [220], "STARTTLS");
      const raw = conn.detach();
      if (!raw.startTls) throw new Error("STARTTLS is not supported on this runtime; use port 465 with SSL/TLS");
      socket = raw.startTls();
      conn = new Conn(socket);
      caps = (await conn.cmd(`EHLO ${ehloName}`, [250], "EHLO (TLS)")).text;
    }

    if (cfg.username) {
      if (/AUTH[^\n]*PLAIN/i.test(caps)) {
        await conn.cmd(`AUTH PLAIN ${b64(`\0${cfg.username}\0${cfg.password}`)}`, [235], "authentication");
      } else {
        await conn.cmd("AUTH LOGIN", [334], "authentication");
        await conn.cmd(b64(cfg.username), [334], "authentication (username)");
        await conn.cmd(b64(cfg.password), [235], "authentication (password)");
      }
    }

    await conn.cmd(`MAIL FROM:<${m.from.email}>`, [250], "MAIL FROM");
    await conn.cmd(`RCPT TO:<${m.to}>`, [250, 251], "RCPT TO");
    await conn.cmd("DATA", [354], "DATA");
    await conn.cmd(buildMessage(m), [250], "message delivery");
    await conn.send("QUIT");
  } finally {
    await conn.close();
  }
}
