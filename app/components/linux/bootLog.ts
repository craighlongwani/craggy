// The boot log BootIntro.tsx plays: an Arch Linux boot, from the bootloader
// through the kernel, the initramfs and systemd to a login prompt, where
// `jed` logs in and runs `tree renzo` (this project's folders, from
// bootTree.ts). Lines print instantly and scroll like a console; only the
// login and the two shell commands are typed.
import { bootLines } from "./bootTree";

export interface BootEvent {
  // Milliseconds from the start of the boot
  at: number;
  // A finished line, as HTML
  html?: string;
  // Or a line typed one character at a time after a prompt (prefix is HTML)
  typed?: { prefix: string; text: string; charMs: number };
}

// Share of the written timing the boot is played at
const PACE = 0.7;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const ok = (s: string) => `[  <span class="lx-boot-ok">OK</span>  ] ${esc(s)}`;
const dim = (s: string) => `<span class="lx-dim">${esc(s)}</span>`;

function build() {
  const events: BootEvent[] = [];
  let t = 0;
  let kernelSeconds = 0;
  let n = 0;

  // A finished line `gap` ms after the previous one
  const line = (html: string, gap = 40) => {
    t += gap;
    events.push({ at: t, html });
  };
  const pause = (ms: number) => {
    t += ms;
  };
  // Line pacing wobbles a little, deterministically, so it reads as work
  const wobble = (base: number) => base + ((n++ * 37) % 23);

  // A kernel message with its timestamp
  const kernel = (msg: string, step = 0.0009) => {
    kernelSeconds += step * (1 + ((n * 13) % 7));
    const stamp = kernelSeconds.toFixed(6).padStart(12);
    line(`[${esc(stamp)}] ${esc(msg)}`, wobble(14));
  };

  // Bootloader
  line("Loading Linux linux ...", 60);
  line("Loading initial ramdisk ...", 90);
  pause(180);

  // Kernel
  kernel("Linux version 6.12.1-arch1-1 (linux@archlinux) #1 SMP PREEMPT_DYNAMIC", 0);
  kernel("Command line: BOOT_IMAGE=/vmlinuz-linux root=UUID=7f3c1a22 rw loglevel=3 quiet");
  kernel("BIOS-provided physical RAM map:");
  kernel("BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable");
  kernel("BIOS-e820: [mem 0x0000000000100000-0x00000000bffdffff] usable");
  kernel("NX (Execute Disable) protection: active");
  kernel("DMI: Jed's laptop, BIOS 1.0 11/04/2026");
  kernel("tsc: Detected 2400.000 MHz processor", 0.04);
  kernel("Memory: 8061436K/8388088K available", 0.02);
  kernel("rcu: Preemptible hierarchical RCU implementation.");
  kernel("smpboot: CPU0: Intel(R) Core(TM) i5 CPU (family: 0x6)", 0.02);
  kernel("pci 0000:00:02.0: [8086:5917] type 00 class 0x030000", 0.03);
  kernel("usb 1-1: new high-speed USB device number 2 using xhci_hcd", 0.05);
  kernel("nvme nvme0: pci function 0000:01:00.0", 0.02);
  kernel("renzo: jed lawrence engbino, information systems, 3rd year", 0.01);
  kernel("renzo: seeking IS / software engineering internships", 0.001);
  kernel("EXT4-fs (nvme0n1p2): mounted filesystem with ordered data mode", 0.03);
  pause(160);

  // Initramfs
  line(":: running early hook [udev]", 50);
  line("Starting systemd-udevd version 257.1-1-arch", 40);
  line(":: running hook [udev]", 60);
  line(":: Triggering uevents...", 70);
  line("/dev/nvme0n1p2: clean, 412903/1310720 files, 3412290/5242880 blocks", 90);
  pause(240);

  // systemd
  line("", 20);
  line("Welcome to <b>Arch Linux</b>!", 40);
  line("", 20);
  const started = (name: string, gap = 55) => {
    line(`         Starting ${esc(name)}...`, wobble(gap - 20));
    line(ok(`Finished ${name}.`), wobble(gap));
  };
  line(ok("Created slice Slice /system/getty."), 60);
  line(ok("Reached target Local File Systems."), 55);
  started("Journal Service");
  started("Create Volatile Files and Directories");
  line(ok("Mounted /home/jed/renzo."), 90);
  line(ok("Started Load projects: VerifAI, Revora, BMS."), 70);
  pause(120);
  started("GitHub contributions");
  line(ok("Started Theme service (gruvbox)."), 60);
  line(ok("Reached target Network."), 50);
  line(ok("Reached target Multi-User System."), 70);
  line(ok("Reached target Graphical Interface."), 50);
  pause(200);

  // Login
  line("", 10);
  line("Arch Linux 6.12.1-arch1-1 (tty1)", 20);
  line("", 10);
  t += 280;
  events.push({
    at: t,
    typed: { prefix: "renzo login: ", text: "jed", charMs: 110 },
  });
  t += 3 * 110 + 220;
  line("Password: ", 10);
  pause(520);

  // tree renzo
  const prompt = `[<span style="font-weight:bold">jed@renzo</span> ~]$ `;
  events.push({
    at: t,
    typed: { prefix: prompt, text: "tree renzo", charMs: 70 },
  });
  t += 10 * 70 + 180;
  let dirs = 0;
  let files = 0;
  for (const l of bootLines) {
    if (l.head.trimEnd().endsWith("/")) dirs++;
    else files++;
    line(`${esc(l.head)}${l.note ? dim(l.note) : ""}`, 24);
  }
  line("", 10);
  line(`${dirs} directories, ${files} files`, 30);
  line("", 10);
  t += 200;
  events.push({
    at: t,
    typed: { prefix: prompt, text: "startx", charMs: 90 },
  });
  t += 6 * 90 + 260;

  // Tuned slower to write, played faster
  const events2 = events.map((e) => ({
    ...e,
    at: e.at * PACE,
    typed: e.typed && { ...e.typed, charMs: e.typed.charMs * PACE },
  }));
  return { events: events2, end: t * PACE };
}

export const { events: bootEvents, end: bootEnd } = build();
