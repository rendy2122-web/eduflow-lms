

| MASTER PIPELINE WEBSITE & APLIKASI Full Team  •  Discovery to Production  •  v1.0 10 Fase  •  Quality Gates  •  Team Roles  •  Security  •  DevOps |
| :---: |

# **CARA MENGGUNAKAN PIPELINE INI**

| Pipeline ini mencakup seluruh lifecycle pengembangan software: dari discovery hingga post-launch. Setiap fase menghasilkan deliverable konkret yang menjadi input fase berikutnya. |
| :---- |

* 5 pertanyaan setup mengunci semua parameter proyek sebelum Fase 1 dimulai

* 10 fase development dengan prompt siap salin ke AI untuk generate dokumen

* 7 Quality Gates — tidak boleh lanjut sebelum gate sebelumnya pass

* RACI Matrix mendefinisikan siapa bertanggung jawab atas apa

* Semua reference tables tersedia: tech stack, git workflow, API contract, security, monitoring

* Launch checklist dan post-launch playbook lengkap

MODE TAMBAHAN — UNIVERSAL AI CODE RUNNER & USER CONFIRMATION  
Bagian ini membuat pipeline dapat dijalankan di berbagai AI coding tool, baik yang bisa membuat file langsung maupun yang hanya dapat menghasilkan instruksi dan kode. Prinsip utamanya: otomatis berjalan fase demi fase, tetapi tetap meminta konfirmasi user pada titik keputusan penting sebelum lanjut.  
TUJUAN MODE INI  
Menjadikan pipeline kompatibel dengan Cursor, Windsurf, Replit Agent, Lovable, Bolt, Claude Code, GitHub Copilot Workspace, ChatGPT, dan AI coding agent lain.  
Memastikan AI dapat membuat website atau aplikasi secara otomatis dengan output konkret: dokumen, folder structure, source code, command, test, dan checklist.  
Menjaga proses tetap aman melalui validasi user: LOCK untuk lanjut, REVISE untuk revisi, ABORT untuk berhenti.  
Memastikan hasil website atau aplikasi selalu dicek kesesuaiannya dengan kebutuhan user sebelum masuk fase berikutnya.  
ATURAN UTAMA UNIVERSAL AI CODE RUNNER  
UNIVERSAL AI CODE RUNNER MODE

Tujuan:  
Pipeline ini harus dapat dijalankan di AI coding tool apa pun, baik yang bisa menulis file langsung maupun hanya menghasilkan instruksi/code.

Aturan utama:  
1\. AI wajib bekerja fase demi fase.  
2\. AI tidak boleh lanjut ke fase berikutnya sebelum user memberi konfirmasi.  
3\. Setelah setiap output besar, AI wajib meminta validasi user.  
4\. Jika AI coding tool bisa membuat file, AI harus membuat file langsung.  
5\. Jika AI coding tool tidak bisa membuat file, AI harus memberikan struktur folder, isi file, dan instruksi copy-paste.  
6\. AI wajib menanyakan kesesuaian website/aplikasi dengan kebutuhan user sebelum melanjutkan development.  
7\. AI wajib menjaga Project State Block di awal setiap fase.  
8\. AI wajib mencatat keputusan user sebagai PROJECT\_CONTEXT.  
9\. Jika ada ketidaksesuaian, AI wajib revisi dulu, bukan lanjut fase.  
UNIVERSAL OUTPUT MODE  
OUTPUT MODE

AI harus mendeteksi kemampuan environment:

A. Jika bisa membuat file:  
   \- Buat struktur folder  
   \- Tulis file source code  
   \- Tulis konfigurasi  
   \- Jalankan test jika tersedia  
   \- Laporkan file yang dibuat

B. Jika tidak bisa membuat file:  
   \- Berikan folder structure  
   \- Berikan isi setiap file dalam code block  
   \- Berikan command untuk menjalankan  
   \- Berikan checklist manual

C. Jika environment tidak jelas:  
   \- Default ke mode universal:  
     1\. Folder structure  
     2\. File-by-file implementation  
     3\. Install command  
     4\. Run command  
     5\. Test command  
AUTO BUILD LOOP  
AUTO BUILD LOOP

Untuk setiap fitur:  
1\. Analyze requirement  
2\. Generate implementation plan  
3\. Create/update files  
4\. Run lint/test/build jika environment mendukung  
5\. Fix error jika ditemukan  
6\. Tampilkan summary perubahan  
7\. Minta konfirmasi user

AI tidak boleh membuat asumsi besar tanpa mencatatnya.  
Jika ada asumsi, tulis di bagian:

ASSUMPTIONS:  
\- \[asumsi 1\]  
\- \[asumsi 2\]

Lalu minta user approve.  
WEBSITE / APP FIT CHECK  
WEBSITE / APP FIT CHECK

Sebelum lanjut, AI wajib menampilkan:  
1\. Ringkasan produk  
2\. Target user  
3\. Masalah yang diselesaikan  
4\. Fitur MVP  
5\. User flow utama  
6\. Tampilan/desain yang direncanakan  
7\. Tech stack  
8\. Halaman/screen yang akan dibuat  
9\. Hal yang belum jelas  
10\. Rekomendasi AI

Pertanyaan wajib:  
"Apakah website/aplikasi ini sudah sesuai dengan yang Anda bayangkan?"

Pilihan jawaban:  
LOCK   \= sesuai, lanjut  
REVISE \= revisi dulu  
DETAIL \= jabarkan lebih detail  
ABORT  \= hentikan proses  
USER CONFIRMATION GATE — WAJIB DI AKHIR SETIAP FASE  
\=== USER CONFIRMATION REQUIRED \===

Review hasil fase ini:  
1\. Apakah tujuan website/aplikasi sudah sesuai?  
2\. Apakah fitur utama sudah sesuai?  
3\. Apakah alur user sudah sesuai?  
4\. Apakah desain/struktur teknis sudah sesuai?  
5\. Apakah ada yang perlu ditambah, dikurangi, atau diubah?

Balas salah satu:  
LOCK   \= setuju, lanjut ke fase berikutnya  
REVISE \= ada revisi, jelaskan bagian yang ingin diubah  
DETAIL \= minta AI menjabarkan lebih detail  
ABORT  \= hentikan proses  
PROMPT MASTER UNTUK AI CODE TOOL  
Anda adalah AI Full Stack Product Builder.

Gunakan pipeline ini untuk membangun website/aplikasi dari discovery sampai production.

Aturan kerja:  
1\. Jalankan fase secara berurutan.  
2\. Jangan lanjut fase sebelum user mengetik LOCK.  
3\. Jika user mengetik REVISE, revisi bagian yang diminta.  
4\. Jika user mengetik DETAIL, jabarkan output lebih detail tanpa lanjut fase.  
5\. Jika user mengetik ABORT, hentikan proses.  
6\. Selalu tampilkan Project State Block di awal respons.  
7\. Simpan semua keputusan user ke PROJECT\_CONTEXT.  
8\. Untuk setiap fase, hasilkan output konkret.  
9\. Jika environment mendukung coding, buat file langsung.  
10\. Jika environment tidak mendukung coding, tampilkan folder structure dan isi file.  
11\. Setelah setiap fase, tanyakan apakah hasil website/aplikasi sudah sesuai.  
12\. Jangan membuat asumsi besar tanpa mencatat dan meminta approval.  
13\. Prioritaskan MVP dulu, lalu fitur lanjutan.  
14\. Pastikan security, testing, deployment, dan documentation ikut dibuat.  
15\. Setiap fitur harus punya acceptance criteria.  
16\. Setiap hasil development harus punya cara menjalankan dan cara mengetes.

Format akhir setiap fase:

SUMMARY:  
\- Apa yang sudah dibuat

FILES CREATED / UPDATED:  
\- Daftar file

HOW TO RUN:  
\- Command install  
\- Command development  
\- Command build  
\- Command test

USER CONFIRMATION:  
Ketik:  
LOCK \= lanjut  
REVISE \= revisi  
DETAIL \= jabarkan lebih detail  
ABORT \= hentikan

# **PROJECT STATE BLOCK**

AI WAJIB mencetak blok ini di awal setiap respons fase.

| \=== STATUS PROYEK \=== Nama Proyek      :  \[PROJECT\_NAME\] Tipe             :  \[Web App / Mobile App / Web \+ Mobile / API Only\] Tech Stack       :  \[STACK\_CHOICE — Option A/B/C\] Metodologi       :  \[AGILE SCRUM / KANBAN / WATERFALL\] Ukuran Tim       :  \[N\] orang — \[daftar role\] Sprint Length    :  \[1 / 2 / 3\] minggu Target Launch    :  \[TANGGAL\] Fase Saat Ini    :  Fase \[X\] / Fase 10 Sprint Saat Ini  :  Sprint \[N\] \==================== |
| :---- |

# **STRUKTUR TIM & TANGGUNG JAWAB**

| ROLE | TANGGUNG JAWAB UTAMA | DELIVERABLE | TOOL UTAMA | FASE AKTIF |
| :---- | :---- | :---- | :---- | :---- |
| **🎯 Product Owner** | Define requirements, prioritize backlog, stakeholder communication | PRD, User Stories, Acceptance Criteria | Jira, Notion, Confluence | Semua fase |
| **📋 Project Manager** | Timeline, resource allocation, risk management, daily standup | Gantt Chart, Sprint Plan, Risk Log | Jira, Asana, Monday.com | Semua fase |
| **🎨 UI/UX Designer** | Wireframe, prototype, design system, user testing | Figma files, Design System, Prototype | Figma, FigJam, Zeplin | Fase 1–4 |
| **⚛️ Frontend Lead** | Frontend architecture, code review, component library | Tech spec, Component docs, PR review | VS Code, GitHub, Storybook | Fase 3–8 |
| **👨‍💻 Frontend Dev** | Implement UI components, integrate API, unit tests | Feature branches, test coverage | React/Vue/Next, TypeScript | Fase 4–8 |
| **🔧 Backend Lead** | API architecture, database design, security, code review | API spec, ERD, Backend docs | Node/Laravel/Django, Postman | Fase 2–8 |
| **👨‍💻 Backend Dev** | Implement endpoints, business logic, database queries | API endpoints, unit tests, migrations | Express/FastAPI, PostgreSQL | Fase 4–8 |
| **📱 Mobile Dev** | Mobile app development (iOS/Android) | App builds, store submission | Flutter/RN, Xcode, Android Studio | Fase 4–8 |
| **🗄️ Database Admin** | Schema design, query optimization, backup, migration | ERD, migration scripts, perf reports | PostgreSQL, Redis, MongoDB | Fase 2–7 |
| **🚀 DevOps Engineer** | CI/CD pipeline, infrastructure, monitoring, security | Docker configs, k8s manifests, IaC | Docker, Kubernetes, AWS/GCP | Fase 6–10 |
| **🧪 QA Engineer** | Test planning, manual testing, automation, bug reporting | Test plan, test cases, bug reports | Playwright, Cypress, Postman | Fase 5–9 |
| **🔐 Security Engineer** | Security audit, penetration testing, compliance | Security report, OWASP checklist | OWASP ZAP, SonarQube | Fase 7–9 |
| 🔬 R\&D / Research & Innovation Team | Market research, competitor benchmarking, technology trend analysis, AI/SEO readiness research, feature opportunity discovery, experiment planning | R\&D brief, feature recommendation backlog, competitor matrix, AI/SEO checklist, experiment hypotheses | Google Trends, Similarweb, Ahrefs/Semrush, Perplexity/ChatGPT/Claude, GA4, Search Console, Figma, Notion | Fase 0–3, Fase 8–10 |

# **RACI MATRIX**

| R \= Responsible (mengerjakan)  A \= Accountable (bertanggung jawab)  C \= Consulted  I \= Informed |
| :---- |

| AKTIVITAS | PM | Tech Lead | Dev | QA |
| :---- | :---- | :---- | :---- | :---- |
| **Requirements gathering** | **R/A** | **C** | **I** | **I** |
| **Architecture design** | **C** | **R/A** | **C** | **I** |
| **Sprint planning** | **R/A** | **C** | **C** | **C** |
| **UI/UX design** | **C** | **C** | **I** | **I** |
| **Frontend development** | **I** | **R** | **A** | **C** |
| **Backend development** | **I** | **R** | **A** | **C** |
| **Database design** | **C** | **R/A** | **C** | **I** |
| **API documentation** | **I** | **A** | **R** | **C** |
| **Unit testing** | **I** | **C** | **R/A** | **C** |
| **Integration testing** | **I** | **C** | **C** | **R/A** |
| **Security testing** | **I** | **C** | **C** | **C** |
| **CI/CD pipeline** | **I** | **C** | **I** | **I** |
| **Deployment to production** | **A** | **C** | **I** | **C** |
| **Production monitoring** | **I** | **C** | **I** | **C** |
| **Incident response** | **A** | **R** | **C** | **C** |
| Feature research & innovation recommendation | C | C | I | I |
| SEO, AI-friendly, and modern web compliance review | A | C | R | C |
| Competitor benchmarking & market trend analysis | C | I | I | I |

# **TECH STACK DECISION FRAMEWORK**

| KATEGORI | OPTION A(Startup / Speed) | OPTION B(Enterprise) | OPTION C(Full Stack Fleksibel) |
| :---- | :---- | :---- | :---- |
| **Frontend Web** | Next.js 14 \+ TypeScript+ Tailwind CSS | React \+ TypeScript+ Material UI | Vue 3 / Nuxt 3+ Tailwind CSS |
| **Backend API** | Node.js \+ Express+ Prisma ORM | Laravel 11 (PHP)+ Eloquent | Python FastAPI+ SQLAlchemy |
| **Database Utama** | PostgreSQL | MySQL / PostgreSQL | PostgreSQL / MongoDB |
| **Database Cache** | Redis | Redis \+ Memcached | Redis |
| **Auth System** | NextAuth / Clerk | Laravel Sanctum / Passport | JWT \+ Refresh Token |
| **File Storage** | AWS S3 / Cloudflare R2 | AWS S3 | Google Cloud Storage |
| **Search** | Meilisearch | Elasticsearch | Algolia / Meilisearch |
| **Mobile** | React Native \+ Expo | Flutter | React Native |
| **Realtime** | Socket.io / Pusher | Laravel Echo \+ Pusher | Socket.io |
| **CI/CD** | GitHub Actions | GitLab CI \+ ArgoCD | GitHub Actions \+ Docker |
| **Hosting** | Vercel \+ Railway | AWS ECS / EKS | GCP Run \+ Cloud SQL |
| **Monitoring** | Sentry \+ Vercel Analytics | Datadog / New Relic | Grafana \+ Prometheus |
| **Cocok untuk** | MVP, startup, tim kecil (3–8 org) | Skala besar, enterprise, \>10 org | Tim fleksibel, proyek mid-scale |

# **PANDUAN METODOLOGI**

| METODOLOGI | KAPAN DIGUNAKAN | STRUKTUR | COCOK TIM |
| :---- | :---- | :---- | :---- |
| **🔄 Agile Scrum** | Requirement berubah, product iteratif, startup, SaaS | Sprint 2 minggu, daily standup, sprint review, retrospective | 5–15 orang, cross-functional |
| **📊 Kanban** | Ongoing maintenance, bug fixes, support team | Board dengan kolom To Do / In Progress / Done, WIP limit | 2–8 orang, operational |
| **📋 Waterfall** | Requirement sangat jelas & fixed, government project, contract fixed | Fase sequential: Req → Design → Dev → Test → Deploy | Tim besar, proyek fixed-scope |
| **🔀 Scaled Agile (SAFe)** | Enterprise dengan multiple teams, large-scale product | Program Increment (PI) planning, multiple scrums | 30+ orang, multi-team |
| **⚡ Scrumban** | Tim transisi dari waterfall ke agile, campuran fitur baru \+ maintenance | Sprint ringan \+ Kanban board | 5–12 orang, campuran |

# **STRUKTUR SPRINT — AGILE SCRUM**

| AKTIVITAS SPRINT | DETAIL & TEMPLATE |
| :---- | :---- |
| **📅 Sprint Planning(Senin pagi, 2–4 jam)** | Input: Backlog yang sudah diestimasiOutput: Sprint goal, sprint backlogTemplate: 'Sprint \[N\] — \[Tanggal\]. Goal: \[kalimat tujuan sprint\]. Committed stories: \[list story points\]' |
| **☀️ Daily Standup(Setiap hari, 15 menit max)** | 3 pertanyaan per orang:1. Kemarin saya mengerjakan: \[X\]2. Hari ini saya akan: \[Y\]3. Blocker: \[Z / tidak ada\]Tidak ada diskusi — parking lot untuk setelah standup |
| **🔍 Sprint Review(Jumat akhir sprint, 1–2 jam)** | Demo fitur yang selesai ke stakeholderReview sprint goal: tercapai / sebagian / tidakFeedback stakeholder masuk ke backlog |
| **🪞 Retrospective(Jumat akhir sprint, 1 jam)** | Format: Start / Stop / ContinueStart: Apa yang harus mulai dilakukan?Stop: Apa yang harus dihentikan?Continue: Apa yang berjalan baik dan dilanjutkan? |
| **📝 Backlog Refinement(Mid-sprint, 1–2 jam)** | Review dan estimasi story points untuk sprint berikutnyaBreak down epic menjadi user storiesAC (Acceptance Criteria) didefinisikan |
| **📏 Story Point Scale** | Fibonacci: 1, 2, 3, 5, 8, 13, 211–2: Sangat kecil (\< 1 hari)3–5: Medium (1–3 hari)8–13: Besar (3–5 hari, pertimbangkan break down)21: Terlalu besar — wajib di-break down |
| **✅ Definition of Done** | Code di-review dan di-merge ke main/developUnit test pass (coverage ≥ 80%)Integration test passQA sign-offDocumentasi updatedDeployed ke staging environment |

# **DOCUMENT REGISTRY — SEMUA DELIVERABLE**

| DOKUMEN | DIBUAT OLEH | FASE | FORMAT |
| :---- | :---- | :---- | :---- |
| **BRD (Business Requirements)** | Product Owner | Fase 1 | Confluence / Notion |
| **PRD (Product Requirements)** | Product Owner | Fase 1 | Confluence / Notion |
| **User Stories & Acceptance Criteria** | PO \+ Dev Team | Fase 1 | Jira |
| **Technical Architecture Document** | Backend Lead | Fase 2 | Confluence \+ Draw.io |
| **ERD (Entity Relationship Diagram)** | DB Admin \+ Backend Lead | Fase 2 | dbdiagram.io / Draw.io |
| **API Specification (OpenAPI/Swagger)** | Backend Lead | Fase 2 | Swagger / Postman |
| **Design System** | UI/UX Designer | Fase 3 | Figma |
| **Wireframes & Prototypes** | UI/UX Designer | Fase 3 | Figma |
| **Frontend Architecture Doc** | Frontend Lead | Fase 3 | Confluence |
| **Database Migration Plan** | DB Admin | Fase 4 | SQL files \+ docs |
| **Test Plan** | QA Lead | Fase 5 | TestRail / Notion |
| **Test Cases** | QA Team | Fase 5–8 | TestRail / Spreadsheet |
| **Security Audit Report** | Security Engineer | Fase 7 | PDF Report |
| **CI/CD Pipeline Docs** | DevOps | Fase 6 | GitHub README / Confluence |
| **Infrastructure Runbook** | DevOps | Fase 6 | Confluence / Notion |
| **Deployment Checklist** | DevOps \+ PM | Fase 9 | Checklist doc |
| **Post-Mortem Template** | PM | Fase 10 | Confluence |
| **API User Documentation** | Backend Dev | Fase 8 | GitBook / Swagger |
| R\&D Research Brief | R\&D Team | Fase 0–1 | Notion / Confluence |
| Feature Recommendation Backlog | R\&D Team \+ Product Owner | Fase 1–3 | Jira / Linear / Notion |
| Competitor Benchmark Matrix | R\&D Team | Fase 1 | Spreadsheet / Notion |
| Modern Web Compliance Checklist (SEO \+ AI \+ A11y) | R\&D Team \+ Frontend Lead \+ QA | Fase 3–9 | Checklist doc / QA report |

# **7 QUALITY GATES — WAJIB PASS SEBELUM LANJUT**

| Quality gates bukan birokrasi — ini adalah titik checkpoint yang mencegah masalah besar di fase berikutnya. Skip \= technical debt yang mahal. |
| :---- |

| QUALITY GATE | KRITERIA PASS | JIKA FAIL |
| :---- | :---- | :---- |
| **Gate 1: Requirements Sign-off(Akhir Fase 1\)** | ✓ BRD/PRD disetujui stakeholder✓ Semua user stories punya AC✓ Tidak ada ambiguitas critical✓ Tech feasibility dikonfirmasi✓ R\&D feature recommendation dan competitor benchmark direview PO✓ Modern web requirements awal: SEO, AI-friendly, accessibility, performance baseline didefinisikan | Iterasi requirements — jangan masuk Fase 2 |
| **Gate 2: Architecture Sign-off(Akhir Fase 2\)** | ✓ Architecture diagram disetujui Tech Lead✓ ERD final divalidasi✓ API spec draft selesai✓ Tech stack dikunci | Revisi arsitektur — jangan mulai coding |
| **Gate 3: Design Sign-off(Akhir Fase 3\)** | ✓ Design system selesai✓ Semua screen utama di-design✓ Prototype di-review stakeholder✓ Developer handoff selesai✓ Design sudah mempertimbangkan SEO structure, semantic layout, accessibility, dan AI-readable content blocks | Revisi design — coding tidak boleh dimulai dengan wireframe |
| **Gate 4: Dev Complete(Akhir Fase 5–6)** | ✓ Semua story di sprint selesai✓ Unit test coverage ≥ 80%✓ Tidak ada critical bug✓ Code review selesai | Bug fix sprint — jangan lanjut ke UAT |
| **Gate 5: QA Sign-off(Akhir Fase 8\)** | ✓ Semua test case dijalankan✓ Zero P1/P2 bugs✓ P3 bugs di-track dan disetujui✓ Performance test pass | Bug fix cycle — jangan deploy ke production |
| **Gate 6: Security Sign-off(Sebelum Launch)** | ✓ OWASP Top 10 checked✓ Penetration test selesai✓ Semua critical vulnerabilities fixed✓ SSL/TLS configured | Mandatory fix — tidak boleh launch |
| **Gate 7: Launch Readiness(Akhir Fase 9\)** | ✓ Staging \= production config✓ Rollback plan tested✓ Monitoring aktif✓ On-call schedule ada✓ SEO technical checklist pass✓ AI-friendly checklist pass: sitemap, robots.txt/llms.txt jika applicable, schema markup, clean content hierarchy✓ Core Web Vitals dan accessibility baseline pass | Re-check semua item — jangan go-live |

# **GIT WORKFLOW — BRANCH STRATEGY**

| BRANCH STRATEGY (Git Flow) | DETAIL |
| :---- | :---- |
| **main / production** | Branch produksi — hanya menerima merge dari release/ atau hotfix/Protected: wajib PR \+ 2 approver \+ CI pass |
| **develop** | Branch development utama — integrasi semua fiturProtected: wajib PR \+ 1 approver \+ CI pass |
| **feature/\[ticket-id\]-\[deskripsi\]** | Contoh: feature/PROJ-123-user-authenticationDibuat dari develop, merge back ke develop via PR |
| **release/\[versi\]** | Contoh: release/1.2.0Dibuat dari develop saat siap releaseHanya boleh bugfix, bukan fitur baruMerge ke main \+ develop saat go-live |
| **hotfix/\[ticket-id\]-\[deskripsi\]** | Contoh: hotfix/PROJ-456-payment-fixDibuat dari main, merge ke main \+ developUntuk critical bug di production |
| **Commit Message Convention** | Format: \[type\](\[scope\]): \[description\]Types: feat / fix / docs / style / refactor / test / choreContoh: feat(auth): add Google OAuth loginContoh: fix(payment): handle failed transaction edge case |
| **PR Template** | \#\# Apa yang berubah?\#\# Kenapa perubahan ini diperlukan?\#\# Cara test?\#\# Screenshot (jika UI change)\#\# Checklist: \[ \] test pass \[ \] docs updated \[ \] reviewed |
| **Code Review Standards** | Reviewer wajib cek: logic correctness, security, performance, readabilityApprove hanya jika semua concern addressedJangan approve code yang tidak dimengertiFeedback harus constructive dan spesifik |

# **API CONTRACT STANDARDS**

| ELEMEN API CONTRACT | FORMAT STANDAR |
| :---- | :---- |
| **Endpoint format** | REST: /api/v1/\[resource\]/\[id\]Verb: GET/POST/PUT/PATCH/DELETE |
| **Request format** | Content-Type: application/jsonAuthorization: Bearer {token}Body: JSON dengan schema terdefinisi |
| **Response format sukses** | { status: 'success', data: {...}, meta: {pagination} } |
| **Response format error** | { status: 'error', code: 'ERROR\_CODE', message: 'Human readable', errors: \[...\] } |
| **HTTP Status Codes** | 200 OK / 201 Created / 204 No Content400 Bad Request / 401 Unauthorized / 403 Forbidden404 Not Found / 422 Validation Error500 Internal Server Error |
| **Versioning** | URL versioning: /api/v1/, /api/v2/Beri deprecation notice 3 bulan sebelum remove versi lama |
| **Authentication** | JWT Bearer Token (expiry 1 jam)Refresh Token (expiry 7–30 hari, rotasi)API Key untuk server-to-server |
| **Rate Limiting** | Header: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-ResetDefault: 100 req/menit per IP |
| **Pagination** | { page, per\_page, total, total\_pages, data: \[...\] }Default: per\_page=20, max=100 |
| **Filtering & Sorting** | ?filter\[field\]=value\&sort=field\&order=asc/descAtau GraphQL jika relasi kompleks |

# **ENVIRONMENT STRATEGY**

| ENVIRONMENT | KONFIGURASI | PURPOSE |
| :---- | :---- | :---- |
| **Local Development** | Docker Compose untuk semua service.env.local untuk environment variablesHot reload aktifSeeding data untuk development | Developer bekerja di mesin masing-masing tanpa konflik |
| **Development (Dev)** | Auto-deploy dari branch developDatabase terpisah dengan data dummySemua logging aktifError detail tampil | Integrasi continuous — selalu up-to-date dengan develop |
| **Staging / UAT** | Mirror konfigurasi productionData anonymized dari production snapshotPerformance testing di siniStakeholder review sebelum go-live | Final validation sebelum production — 'production-like' |
| **Production** | Zero downtime deployment (blue-green atau rolling)Auto-scaling aktifFull monitoring dan alertingBackup otomatis harianSSL/TLS enforced | Live environment — user nyata mengakses |
| **DR (Disaster Recovery)** | Region berbeda dari productionData replication real-time atau near-real-timeRTO \< 4 jam, RPO \< 1 jamTested minimal 2x setahun | Failover jika production total down |

# **MONITORING & OBSERVABILITY**

| AREA | YANG DIMONITOR | ALERT THRESHOLD | TOOL |
| :---- | :---- | :---- | :---- |
| **Availability** | Uptime, health check endpoint | Downtime \> 1 menit | Uptime Robot / Better Uptime |
| **Performance** | Response time, throughput, error rate | P95 latency \> 500ms | Datadog / New Relic / Grafana |
| **Error Tracking** | JS errors, API errors, unhandled exceptions | Error rate \> 1% | Sentry |
| **Infrastructure** | CPU, RAM, disk, network I/O | CPU \> 80% sustained | CloudWatch / Grafana |
| **Database** | Query time, connection pool, slow queries | Query \> 1 detik | pg\_stat / Datadog |
| **Security** | Failed login, unusual API calls, DDoS | 50+ failed login/menit | WAF \+ SIEM |
| **Business Metrics** | Active users, conversion, revenue events | Drop \> 20% dari baseline | Mixpanel / GA4 / Custom |
| **Log Management** | All application logs, audit logs | Error log spike | ELK Stack / Loki \+ Grafana |

# **SECURITY CHECKLIST — OWASP TOP 10**

| SECURITY AREA | CHECKLIST ITEM |
| :---- | :---- |
| **Authentication & Authorization** | ☐ Bcrypt/Argon2 untuk password hashing☐ JWT expiry pendek (\< 1 jam)☐ Refresh token rotation☐ Rate limiting pada login endpoint☐ MFA tersedia untuk admin☐ RBAC (Role Based Access Control) implemented |
| **Input Validation** | ☐ Semua input user di-validate di server side☐ Parameterized queries / ORM (no raw SQL)☐ File upload validation (type, size, scan)☐ Output encoding untuk prevent XSS☐ CSRF protection aktif |
| **API Security** | ☐ HTTPS enforced (HTTP redirect ke HTTPS)☐ Security headers: HSTS, CSP, X-Frame-Options☐ API rate limiting☐ CORS properly configured☐ Sensitive data tidak di URL (gunakan POST) |
| **Data Protection** | ☐ Encryption at rest untuk data sensitif☐ Encryption in transit (TLS 1.2+)☐ PII data di-mask di logs☐ Backup encrypted☐ Data retention policy defined |
| **Infrastructure** | ☐ Principle of least privilege untuk semua service☐ Secret management (tidak ada secret di code)☐ Dependency scanning (Snyk / Dependabot)☐ Container image scanning☐ Network segmentation (VPC/firewall rules) |
| **OWASP Top 10 2023** | ☐ A01: Broken Access Control☐ A02: Cryptographic Failures☐ A03: Injection (SQL, NoSQL, LDAP)☐ A04: Insecure Design☐ A05: Security Misconfiguration☐ A06: Vulnerable Components☐ A07: Auth Failures☐ A08: Software Integrity Failures☐ A09: Logging Failures☐ A10: SSRF |

# **LAUNCH READINESS CHECKLIST**

| KATEGORI | CHECKLIST ITEM | PIC |
| :---- | :---- | :---- |
| **🔧 Technical** | ☐ Semua env variables production dikonfigurasi☐ Database migrations dijalankan di production☐ SSL certificate valid dan auto-renew☐ CDN dikonfigurasi☐ Error monitoring aktif (Sentry)☐ Uptime monitoring aktif | DevOps |
| **🔐 Security** | ☐ Security audit selesai☐ OWASP checklist clear☐ Rate limiting aktif☐ Backup otomatis berjalan☐ DR plan tested | Security \+ DevOps |
| **⚡ Performance** | ☐ Load test sudah dijalankan☐ P95 response time \< 500ms☐ Image optimization aktif☐ Caching strategy implemented☐ Database indexes dioptimasi | Backend \+ DevOps |
| **📋 Product** | ☐ UAT sign-off dari stakeholder☐ Legal review (Privacy Policy, ToS)☐ Content proofread final☐ SEO meta tags (web)☐ App store assets ready (mobile) | PM \+ PO |
| **🔄 Operations** | ☐ Runbook deployment tersedia☐ Rollback plan tested☐ On-call schedule ada☐ Incident response playbook ada☐ Support channel siap | PM \+ DevOps |
| **📊 Analytics** | ☐ Analytics tracking aktif (GA4/Mixpanel)☐ Funnel events terdefinisi☐ Dashboard monitoring siap☐ KPI baseline established | PM \+ Dev |
| 🔎 SEO & AI Readiness | ☐ Sitemap.xml generated dan submit-ready☐ Robots.txt benar dan tidak memblokir halaman penting☐ Metadata title/description canonical lengkap☐ Structured data/schema markup tervalidasi☐ Heading hierarchy H1-H6 rapi☐ Internal linking dan breadcrumb siap☐ Open Graph/Twitter Card siap☐ AI-friendly content structure: FAQ, entity clarity, clean HTML semantics☐ llms.txt / AI guidance file dibuat jika relevan | R\&D \+ Frontend \+ PM |

| FASE 0  — PROJECT SETUP & CONTEXT |
| :---- |

| Jawaban setup ini menentukan semua keputusan teknis dan tim selanjutnya. |
| :---- |

**Prompt untuk disalin ke AI:**

| "Kita akan membangun \[tipe produk\] dari nol dengan full tim. Jawab pertanyaan setup berikut: 1\. APA yang dibangun?    (Contoh: marketplace, SaaS dashboard, mobile banking, e-commerce, CMS, social platform) 2\. SIAPA penggunanya dan apa masalah utama yang dipecahkan?    (Target user \+ core problem \+ unique value proposition) 3\. TECH STACK pilihan? (Option A / B / C dari tabel, atau custom) 4\. METODOLOGI? (Agile Scrum / Kanban / Waterfall / Hybrid) 5\. KOMPOSISI TIM? (Sebutkan role dan jumlah orang) 6\. TIMELINE dan BUDGET rough estimate? 7\. SCOPE AWAL — fitur apa yang masuk MVP vs fase berikutnya? Simpan semua jawaban sebagai \[PROJECT\_CONTEXT\]. Cetak Project State Block. Lanjut ke Fase 1." |
| :---- |

| \=== SETUP SELESAI \=== ✅ Project context dikunci ✅ Tech stack dipilih ✅ Metodologi dikonfirmasi ✅ Project State Block dicetak Lanjut ke Fase 1\. |
| :---- |

| FASE 1  — DISCOVERY & REQUIREMENTS |
| :---- |

| Fase terpenting. 80% masalah di production berasal dari requirements yang tidak jelas. Investasikan waktu di sini. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 1: DISCOVERY & REQUIREMENTS Berdasarkan \[PROJECT\_CONTEXT\], generate dokumen berikut: 1\. BRD (Business Requirements Document) — ringkas, 1–2 halaman:    • Problem statement    • Objectives & success metrics (KPI)    • Scope (in scope / out of scope)    • Assumptions & constraints    • Stakeholders dan approval chain 2\. USER PERSONAS (2–3 persona):    • Nama, usia, pekerjaan, goals, frustrations    • How they use the product 3\. USER JOURNEY MAP untuk user flow utama:    Awareness → Onboarding → Core Action → Return → Advocacy 4\. USER STORIES — tulis minimal 20 user story:    Format: "As a \[role\], I want to \[action\] so that \[benefit\]"    Dengan Acceptance Criteria per story    Priority: Must Have / Should Have / Nice to Have (MoSCoW) 5\. MVP FEATURE LIST — 3 kategori:    • P0: Must have for launch    • P1: Important but can wait Sprint 2–3    • P2: Nice to have / backlog Output dalam format tabel. Konfirmasi: "Ketik LOCK untuk lanjut ke Fase 2." 6\. R\&D FEATURE RECOMMENDATION:   • Competitor benchmark: 3–5 kompetitor langsung/tidak langsung   • Market trend dan user expectation terbaru   • Feature gap analysis   • Rekomendasi fitur tambahan: P0/P1/P2 \+ alasan impact   • Risiko overbuild: fitur yang sebaiknya tidak masuk MVP7\. MODERN WEBSITE REQUIREMENTS:   • SEO friendly requirement   • AI friendly / LLM readable requirement   • Accessibility baseline   • Core Web Vitals target   • Structured data/schema yang relevan |
| :---- |

| \=== GATE 1 — REQUIREMENTS SIGN-OFF \=== ✅ BRD/PRD disetujui stakeholder ✅ ≥20 user stories dengan AC ✅ MVP scope terdefinisi (P0/P1/P2) ✅ User personas dan journey map selesai ⚠️  Ketik LOCK untuk lanjut ke Fase 2\. |
| :---- |

| FASE 2  — TECHNICAL ARCHITECTURE |
| :---- |

| Keputusan arsitektur di fase ini sulit diubah nantinya. Luangkan waktu untuk review bersama seluruh tech team. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 2: TECHNICAL ARCHITECTURE DESIGN 1\. SYSTEM ARCHITECTURE DIAGRAM (deskripsikan dalam teks, buat diagram di draw.io):    • Client layer: Web (browser) \+ Mobile (iOS/Android)    • API Gateway / Load Balancer    • Application services (monolith atau microservices)    • Database layer (primary, replica, cache)    • File storage, CDN    • Third-party integrations    • Auth service 2\. DATABASE DESIGN:    • List semua entitas dan atributnya    • ERD dalam format teks (Table: fields, types, indexes)    • Relationships (1:1, 1:N, N:N)    • Indexing strategy 3\. API CONTRACT DESIGN:    • List semua endpoint yang dibutuhkan MVP    • Method, path, request body, response schema per endpoint    • Auth requirements per endpoint    • Estimasi complexity per endpoint (S/M/L) 4\. TECHNOLOGY DECISIONS (ADR — Architecture Decision Record):    Per keputusan besar: Context → Decision → Rationale → Consequences 5\. NON-FUNCTIONAL REQUIREMENTS:    Performance targets, scalability plan, availability SLA, security requirements Output dokumen lengkap. Ketik LOCK untuk lanjut ke Fase 3\. |
| :---- |

| \=== GATE 2 — ARCHITECTURE SIGN-OFF \=== ✅ System architecture diagram selesai ✅ ERD final divalidasi DBA ✅ API spec draft selesai (semua endpoint MVP) ✅ ADR untuk keputusan besar terdokumentasi ⚠️  Ketik LOCK untuk lanjut ke Fase 3\. |
| :---- |

| FASE 3  — UI/UX DESIGN SYSTEM |
| :---- |

| Design system yang solid menghemat 30–40% waktu frontend development. Jangan skip. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 3: UI/UX DESIGN SYSTEM 1\. DESIGN SYSTEM FOUNDATION:    • Color tokens: primary, secondary, neutral, semantic (success/warning/error)    • Typography scale: heading 1–6, body, caption, label \+ font family    • Spacing scale: 4px base grid (4, 8, 12, 16, 24, 32, 48, 64\)    • Elevation / shadow levels    • Border radius system    • Icon set selection 2\. COMPONENT LIBRARY SPEC:    List semua UI component yang dibutuhkan dengan state-nya:    Button (default/hover/active/disabled/loading)    Input (empty/focused/filled/error/disabled)    Card, Modal, Toast/Snackbar, Table, Pagination, Form, Navigation, dll. 3\. SCREEN INVENTORY:    List semua screen yang perlu di-design untuk MVP.    Prioritas: critical user flows first. 4\. FIGMA FILE STRUCTURE:    Cara mengorganisasi Figma:    Pages: 01\_Design System / 02\_Wireframes / 03\_Final Design / 04\_Prototype 5\. DEVELOPER HANDOFF CHECKLIST:    Yang harus ada sebelum developer mulai coding dari design. Ketik LOCK untuk lanjut ke Fase 4\. 6\. MODERN WEB DESIGN REVIEW:   • Layout mendukung semantic HTML dan SEO heading hierarchy   • Komponen accessible: contrast, focus state, label, keyboard navigation   • Content blocks jelas untuk search engine dan AI crawler   • Mobile-first responsive layout   • Area konten utama tidak hanya berupa gambar |
| :---- |

| \=== GATE 3 — DESIGN SIGN-OFF \=== ✅ Design system (colors, typography, spacing) selesai ✅ Semua screen MVP di-design ✅ Prototype interaktif di-review stakeholder ✅ Developer handoff selesai di Figma ⚠️  Ketik LOCK untuk lanjut ke Fase 4\. |
| :---- |

| FASE 4  — DEVELOPMENT SETUP — SPRINT 0 |
| :---- |

| Sprint 0 bukan waktu buang-buang — setup yang baik menghindari technical debt dari hari pertama. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 4: DEVELOPMENT SETUP & SPRINT 0 Sprint 0 bukan sprint biasa — ini adalah fondasi. 1\. REPOSITORY SETUP:    • Monorepo atau polyrepo? Struktur folder lengkap    • .gitignore, .editorconfig, .eslintrc, .prettierrc    • README.md template    • Branch protection rules    • PR template 2\. DEVELOPMENT ENVIRONMENT:    • docker-compose.yml untuk semua service    • .env.example dengan semua required variables    • Database seeding script    • Makefile / npm scripts untuk common commands 3\. CI/CD PIPELINE SETUP:    • GitHub Actions workflow untuk: lint, test, build, deploy    • Deploy ke staging otomatis saat merge ke develop    • Deploy ke production hanya manual trigger \+ approval 4\. PROJECT MANAGEMENT SETUP:    • Jira/Linear board structure    • Labels, priorities, story point scale    • Sprint calendar untuk 3 bulan ke depan    • Meeting calendar: standup, planning, review, retro 5\. ARCHITECTURE SKELETON:    Generate boilerplate structure untuk frontend, backend, dan mobile.    Pastikan: folder structure, base classes, middleware, error handler. Ketik LOCK untuk lanjut ke Sprint 1\. |
| :---- |

| \=== SPRINT 0 SELESAI \=== ✅ Repository \+ branch protection setup ✅ Docker environment berjalan ✅ CI/CD pipeline aktif (lint \+ test \+ build) ✅ Project board Jira/Linear terisi backlog ✅ Architecture skeleton di-commit ⚠️  Ketik LOCK untuk mulai Sprint 1\. |
| :---- |

| FASE 5  — FRONTEND DEVELOPMENT |
| :---- |

| Jalankan sprint by sprint. Gunakan prompt ini per sprint untuk generate implementation brief per fitur. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 5: FRONTEND DEVELOPMENT Untuk setiap sprint, generate: 1\. COMPONENT ARCHITECTURE:    • Folder structure: components/, pages/, hooks/, services/, store/, utils/    • Atomic design: atoms → molecules → organisms → templates → pages    • State management plan: local state vs global store vs server state    • Data fetching strategy: React Query / SWR / native fetch 2\. PER FEATURE, generate brief:    Feature: \[nama\]    Components needed: \[list\]    API calls: \[endpoints\]    State: \[apa yang disimpan di mana\]    Edge cases: \[loading, error, empty state\]    Accessibility: \[keyboard nav, ARIA labels, color contrast\] 3\. PERFORMANCE CHECKLIST per sprint:    ☐ Bundle size \< 250kb gzipped initial load    ☐ LCP \< 2.5 detik, FID \< 100ms, CLS \< 0.1    ☐ Images: WebP format, lazy loading, proper dimensions    ☐ Code splitting dan lazy import untuk route 4\. TESTING STRATEGY:    Unit test: Jest \+ React Testing Library    Coverage target: ≥ 80% untuk business logic Ketik LOCK untuk lanjut ke Fase 6\. |
| :---- |

| \=== GATE 4A — FRONTEND COMPLETE \=== ✅ Semua P0 stories selesai ✅ Unit test coverage ≥ 80% ✅ Lighthouse score: Performance \>90, A11y \>90 ✅ Code review semua PR selesai ⚠️  Ketik LOCK untuk lanjut ke integrasi. |
| :---- |

| FASE 6  — BACKEND DEVELOPMENT & API |
| :---- |

| Generate implementation brief per endpoint/feature. Gunakan API contract sebagai kontrak antara frontend dan backend. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 6: BACKEND DEVELOPMENT & API 1\. PER ENDPOINT, generate implementasi brief:    Endpoint: \[METHOD\] /api/v1/\[path\]    Auth: \[required/optional/none\] \+ \[roles yang bisa akses\]    Validation rules: \[semua field yang di-validate\]    Business logic: \[step by step\]    Database queries: \[optimized query plan\]    Response: \[sukses \+ semua error cases\]    Rate limiting: \[yes/no, limit\] 2\. DATABASE MIGRATION PLAN:    • Urutan migration yang aman    • Rollback script untuk setiap migration    • Seed data untuk testing    • Index optimization 3\. BACKGROUND JOBS & QUEUES:    List semua proses async: email, notif, report, export, dll.    Tool: Bull/BullMQ (Node) atau Queue (Laravel) 4\. CACHING STRATEGY:    Per data type: apa yang di-cache, TTL, invalidation strategy 5\. ERROR HANDLING & LOGGING:    Standard error response format    Log levels: ERROR/WARN/INFO/DEBUG    Structured logging format (JSON) Ketik LOCK untuk lanjut ke Fase 7\. |
| :---- |

| \=== GATE 4B — BACKEND COMPLETE \=== ✅ Semua P0 endpoints implemented dan documented ✅ Unit test coverage ≥ 80% ✅ API docs (Swagger) up-to-date ✅ Database migrations tested (up \+ down) ✅ Performance: P95 latency \< 200ms di staging ⚠️  Ketik LOCK untuk lanjut ke Fase 7\. |
| :---- |

| FASE 7  — INTEGRATION & MOBILE |
| :---- |

| Integration issues adalah yang paling sering ditemukan terlambat. Lakukan integration testing secepat mungkin. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 7: INTEGRATION, MOBILE & THIRD-PARTY 1\. FRONTEND ↔ BACKEND INTEGRATION CHECKLIST:    Per fitur: API call test, error handling, loading state, optimistic update 2\. MOBILE APP (jika applicable):    • Navigation structure (React Navigation / Go Router)    • Platform-specific considerations: iOS vs Android    • Push notification setup    • Offline support strategy    • Deep linking    • App store preparation: icons, screenshots, description 3\. THIRD-PARTY INTEGRATIONS:    Untuk setiap integrasi (payment, maps, email, SMS, OAuth):    • SDK setup \+ credentials management    • Webhook handling (jika ada)    • Sandbox testing plan    • Fallback jika third-party down 4\. REAL-TIME FEATURES (jika applicable):    WebSocket / Socket.io setup    Rooms/channels structure    Reconnection strategy Ketik LOCK untuk lanjut ke Fase 8\. |
| :---- |

| \=== INTEGRASI SELESAI \=== ✅ Semua API terintegrasi di frontend ✅ Mobile app (jika ada) build success di iOS \+ Android ✅ Third-party services tested di staging ✅ E2E smoke test critical flows pass ⚠️  Ketik LOCK untuk lanjut ke QA. |
| :---- |

| FASE 8  — TESTING & QA |
| :---- |

| Zero P1/P2 bugs adalah syarat mutlak untuk Gate 5\. Tidak ada kompromi. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 8: TESTING & QA 1\. TEST PLAN DOCUMENT:    • Scope: apa yang di-test dan tidak    • Test environments    • Entry/exit criteria    • Risk areas yang butuh focus ekstra 2\. TEST CASES — generate untuk setiap fitur utama:    Test Case ID | Feature | Steps | Expected | Actual | Status    Pastikan cover: happy path, edge cases, error cases 3\. PERFORMANCE TESTING PLAN:    Tools: k6 / Apache JMeter / Artillery    Scenarios: normal load, peak load, spike test, soak test    Targets: define RPS target dan latency threshold 4\. SECURITY TESTING:    Run OWASP checklist    Automated scan: OWASP ZAP / SonarQube    Manual review: auth flow, data exposure, injection 5\. UAT (User Acceptance Testing):    UAT plan untuk stakeholder    Test scenarios dalam bahasa bisnis (bukan teknis)    Sign-off template 6\. BUG TRIAGE PROCESS:    P1 Critical: block launch, fix \< 4 jam    P2 High: fix dalam sprint ini    P3 Medium: fix sprint berikutnya    P4 Low: backlog Ketik LOCK untuk lanjut ke Fase 9\. 7\. SEO & AI-FRIENDLY QA:   • Audit title, meta description, canonical, OG tags   • Audit sitemap.xml dan robots.txt   • Validate schema markup   • Check heading hierarchy dan semantic HTML   • Check AI-friendly content clarity, FAQ, entity consistency   • Lighthouse: SEO, Performance, Accessibility, Best Practices |
| :---- |

| \=== GATE 5 — QA SIGN-OFF \=== ✅ Semua test cases dijalankan ✅ Zero P1 dan P2 bugs ✅ Performance test pass (sesuai NFR) ✅ UAT sign-off dari stakeholder \=== GATE 6 — SECURITY SIGN-OFF \=== ✅ OWASP Top 10 checked ✅ Semua critical vulnerabilities fixed ✅ Penetration test report clean ⚠️  Ketik LOCK untuk lanjut ke DevOps. |
| :---- |

| FASE 9  — DEVOPS & PRODUCTION DEPLOYMENT |
| :---- |

| Infrastructure as Code memastikan environment bisa di-reproduce dan tidak ada 'works on my machine'. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 9: DEPLOYMENT & DEVOPS 1\. INFRASTRUCTURE AS CODE:    Generate Terraform / Pulumi scripts untuk:    • VPC, subnets, security groups    • Database (managed RDS / Cloud SQL)    • Container registry \+ orchestration (ECS/EKS/Cloud Run)    • Load balancer \+ auto-scaling    • CDN dan static hosting    • Secrets Manager setup 2\. CI/CD PIPELINE FINAL:    GitHub Actions workflow:    Push → Lint → Test → Build → Push image → Deploy staging → (manual) Deploy prod 3\. MONITORING SETUP:    • Application monitoring: Sentry DSN configured    • Infrastructure monitoring: Datadog/Grafana connected    • Uptime monitoring: alerting ke Slack/PagerDuty    • Log aggregation: ELK / Loki configured 4\. DEPLOYMENT RUNBOOK:    Step by step: cara deploy ke production    Pre-deploy checklist, deploy command, post-deploy verification    Rollback procedure (\< 5 menit rollback SLA) 5\. BACKUP & RECOVERY:    Database backup: schedule, retention, tested restore    File backup: S3 versioning / GCS lifecycle Ketik LOCK untuk lanjut ke Fase 10\. 6\. SEO / AI READINESS DEPLOYMENT:   • Generate sitemap.xml otomatis   • Setup robots.txt sesuai environment   • Deploy schema markup dan metadata   • Setup redirect/canonical strategy   • Tambahkan llms.txt jika relevan   • Verifikasi indexing readiness sebelum production |
| :---- |

| \=== GATE 7 — LAUNCH READINESS \=== ✅ Staging \= production config (zero perbedaan) ✅ Rollback procedure tested dan \< 5 menit ✅ Monitoring semua aktif dan alerting configured ✅ Backup tested dengan restore berhasil ✅ On-call schedule ada untuk minggu pertama ⚠️  Ketik LOCK untuk Go-Live. |
| :---- |

| FASE 10  — LAUNCH & POST-LAUNCH |
| :---- |

| Launch bukan akhir — ini awal. 24 jam pertama adalah yang paling kritis. |
| :---- |

**Prompt untuk disalin ke AI:**

| FASE 10: LAUNCH & POST-LAUNCH 1\. GO-LIVE CHECKLIST:    Jalankan semua item di Launch Checklist table.    Setiap item wajib ada PIC dan timestamp. 2\. LAUNCH COMMUNICATION:    • Internal announcement: email/Slack ke seluruh tim    • Stakeholder notification    • User communication (jika ada existing user)    • Social media / press release (jika public launch) 3\. WAR ROOM PLAN (24 jam pertama post-launch):    • Siapa on-call: Backend, Frontend, DevOps, PM    • Escalation tree    • Dashboard yang dimonitor setiap 30 menit    • Criteria untuk rollback decision 4\. POST-LAUNCH METRICS REVIEW (hari 1, 3, 7, 30):    • Technical: error rate, latency, uptime    • Product: activation, retention, core action completion    • Business: revenue, conversion, support tickets 5\. POST-MORTEM TEMPLATE:    Setelah 2 minggu post-launch:    What went well / What went wrong / Action items 6\. ROADMAP FASE 2:    Berdasarkan data post-launch, prioritaskan backlog untuk milestone berikutnya. |
| :---- |

| \=== PROYEK SELESAI — PRODUCTION LIVE \=== ✅ Launch checklist 100% complete ✅ War room 24 jam dijalankan ✅ Semua metrik dalam batas normal ✅ Post-mortem dijadwalkan (2 minggu post-launch) ✅ Roadmap Fase 2 diprioritaskan berdasarkan data |
| :---- |

# **MASTER CHECKLIST — SEMUA FASE**

Gunakan ini sebagai tracker utama kemajuan proyek.

| LANGKAH | TUGAS | STATUS |
| :---- | :---- | :---- |
| **Step 0** | Project context dikonfirmasi | \[ \] |
| **Step 0.5** | Tech stack dikunci | \[ \] |
| **Step 0.75** | Team roles & RACI dikonfirmasi | \[ \] |
| **Step 0.8** | Metodologi & sprint length dikunci | \[ \] |
| **Step 0.85** | Tools (Jira/GitHub/Figma) disetup | \[ \] |
| **Fase 1** | BRD \+ PRD selesai, user stories (≥20) dikunci, MVP scope jelas | \[ \] |
| **Fase 1** | Quality Gate 1 pass — stakeholder sign-off | \[ \] |
| **Fase 2** | Architecture diagram, ERD, API spec draft selesai | \[ \] |
| **Fase 2** | Quality Gate 2 pass — tech lead sign-off | \[ \] |
| **Fase 3** | Design system, wireframes, prototype selesai | \[ \] |
| **Fase 3** | Quality Gate 3 pass — stakeholder design review | \[ \] |
| **Fase 4** | Repository, CI/CD, Docker, project board disetup | \[ \] |
| **Fase 5** | Frontend development sprint by sprint | \[ \] |
| **Fase 6** | Backend API development sprint by sprint | \[ \] |
| **Fase 6** | Quality Gate 4 pass — dev complete, test coverage ≥80% | \[ \] |
| **Fase 7** | Integration selesai, mobile (jika ada), third-party terintegrasi | \[ \] |
| **Fase 8** | Test plan, test cases, performance test, security audit selesai | \[ \] |
| **Fase 8** | Quality Gate 5 pass — QA sign-off, zero P1/P2 bugs | \[ \] |
| **Fase 8** | Quality Gate 6 pass — security sign-off | \[ \] |
| **Fase 9** | Infrastructure as code, CI/CD final, monitoring aktif | \[ \] |
| **Fase 9** | Quality Gate 7 pass — launch readiness confirmed | \[ \] |
| **Fase 10** | Launch checklist semua item ✓ | \[ \] |
| **Fase 10** | War room 24 jam dijalankan | \[ \] |
| **Fase 10** | Post-launch review (hari 1, 3, 7, 30\) | \[ \] |
| **Fase 10** | Post-mortem selesai, Roadmap Fase 2 diprioritaskan | \[ \] |
| Step 0.6 | R\&D Team dikonfirmasi: market research, competitor benchmark, dan feature recommendation siap | \[ \] |
| Fase 1 | R\&D brief \+ competitor benchmark \+ feature recommendation backlog selesai | \[ \] |
| Fase 3 | Modern web compliance design review: SEO, AI-friendly, accessibility, responsive, semantic layout | \[ \] |
| Fase 8 | SEO, AI-friendly, accessibility, and Core Web Vitals QA pass | \[ \] |
| Fase 9 | Sitemap, robots.txt, schema markup, metadata, canonical, OG tags, dan llms.txt jika perlu sudah deploy-ready | \[ \] |

| Ship it. Then make it better. | Master Pipeline  •  Website & App  •  Full Team  •  v1.0 |
| :---: | :---: |

**ADDENDUM — R\&D TEAM, FEATURE RECOMMENDATION & MODERN WEB COMPLIANCE**  
Bagian ini menambahkan fungsi R\&D agar setiap website atau aplikasi tidak hanya selesai secara teknis, tetapi juga relevan secara market, kompetitif, SEO friendly, AI friendly, accessible, cepat, dan sesuai standar web modern.  
**1\. R\&D TEAM MANDATE**  
• Melakukan riset tren user, kompetitor, teknologi, regulasi, dan standar website/aplikasi terbaru.  
• Memberikan saran fitur tambahan berdasarkan market gap, user pain points, benchmark kompetitor, data analytics, dan potensi monetisasi.  
• Membuat Feature Recommendation Backlog dengan prioritas P0/P1/P2 dan estimasi impact vs effort.  
• Melakukan review SEO friendly, AI friendly, accessibility, performance, security-by-design, dan content structure sejak fase awal.  
• Menyusun eksperimen: A/B test, prototype test, usability test, landing page validation, dan analytics event plan.  
**2\. R\&D FEATURE RECOMMENDATION OUTPUT**

| Kategori | Pertanyaan Riset | Output | Prioritas | PIC |
| :---- | :---- | :---- | :---- | :---- |
| Market Fit | Masalah user apa yang paling mendesak? | Problem ranking \+ MVP validation notes | P0 | R\&D \+ PO |
| Competitor Benchmark | Fitur apa yang sudah menjadi standar industri? | Competitor matrix \+ gap analysis | P0/P1 | R\&D |
| Growth Feature | Fitur apa yang dapat menaikkan acquisition, activation, retention? | Growth backlog \+ analytics events | P1 | R\&D \+ PM |
| AI Opportunity | Bagian mana yang bisa dibantu AI atau dibuat AI-readable? | AI use-case list \+ risk note | P1/P2 | R\&D \+ Tech Lead |
| UX Improvement | Flow mana yang rawan drop-off? | Usability findings \+ quick wins | P0/P1 | R\&D \+ UI/UX |

**3\. MODERN WEBSITE COMPLIANCE — SEO FRIENDLY**  
• Setiap halaman penting memiliki unique title, meta description, canonical URL, Open Graph, dan Twitter Card.  
• Heading hierarchy rapi: satu H1 utama, H2/H3 untuk struktur konten, tanpa heading lompat secara tidak logis.  
• Sitemap.xml, robots.txt, internal linking, breadcrumb, clean URL, dan 404/redirect strategy tersedia.  
• Structured data/schema markup digunakan jika relevan: Organization, Product, Article, FAQ, BreadcrumbList, LocalBusiness, Course, Event, atau SoftwareApplication.  
• Core Web Vitals ditargetkan: LCP \< 2.5s, INP/FID baik, CLS \< 0.1, image optimized, lazy loading, cache strategy.  
**4\. MODERN WEBSITE COMPLIANCE — AI FRIENDLY / LLM FRIENDLY**  
• Konten dibuat semantic dan mudah dipahami AI: struktur jelas, entity konsisten, FAQ ringkas, dan informasi utama tidak terkunci di gambar saja.  
• HTML menggunakan semantic tags: header, nav, main, section, article, aside, footer, button, form label yang benar.  
• Data penting disajikan sebagai teks/HTML, bukan hanya canvas, image, atau komponen yang tidak terbaca crawler.  
• Tambahkan llms.txt atau AI guidance file jika relevan untuk produk publik, dokumentasi, SaaS, knowledge base, atau marketplace.  
• Pastikan schema markup, sitemap, robots.txt, dan metadata tidak bertentangan dengan tujuan discoverability oleh search engine dan AI answer engine.  
**5\. AI CODE TOOL INSTRUCTION — R\&D & MODERN WEB CHECK**  
AI wajib menjalankan R\&D Review sebelum mengunci MVP dan sebelum launch.

Untuk setiap website/aplikasi, hasilkan:  
1\. Feature Recommendation Backlog dari R\&D Team  
2\. Competitor Benchmark Matrix  
3\. SEO Friendly Checklist  
4\. AI Friendly / LLM Friendly Checklist  
5\. Accessibility Checklist  
6\. Core Web Vitals / Performance Checklist  
7\. Structured Data / Schema Recommendation  
8\. Analytics Event Plan

AI wajib menanyakan:  
"Apakah fitur rekomendasi R\&D dan standar website modern ini sudah sesuai dengan tujuan produk?"

User response:  
LOCK \= setuju dan lanjut  
REVISE \= revisi fitur/checklist  
ABORT \= hentikan

**ADDENDUM 2 \- FINAL PRODUCTION READINESS, AI TOOL MATRIX & GOVERNANCE**

Bagian ini melengkapi pipeline agar lebih siap dipakai sebagai sistem kerja profesional untuk AI coding agent, client project, internal product team, dan website/aplikasi production-ready.

**1\. AI TOOL PROFILE MATRIX**

Gunakan matrix ini untuk memilih cara menjalankan pipeline sesuai kemampuan AI tool yang digunakan. Jika tool tidak bisa mengubah file secara langsung, AI wajib memberikan struktur folder, isi file, dan instruksi copy-paste.

| AI Tool | Edit File | Run Command | Cocok Untuk | File Instruksi |
| :---- | :---- | :---- | :---- | :---- |
| Codex | Ya | Ya | Full repository automation, bug fix, feature build, PR workflow | AGENTS.md |
| Claude Code | Ya | Ya | GitHub repository workflow dan coding agent berbasis task | CLAUDE.md |
| Cursor | Ya | Ya | Local IDE coding, refactor, multi-file edit | .cursor/rules atau rules file |
| Windsurf | Ya | Ya | Agentic IDE workflow dan project-wide coding | Cascade rules / project rules |
| Replit Agent | Ya | Ya | Prototype web app, deploy cepat, full stack sederhana | replit.md / prompt project |
| Lovable / Bolt | Sebagian | Sebagian | Rapid prototype, landing page, MVP UI | Prompt pipeline \+ checklist |
| Claude Web / ChatGPT Web | Tidak langsung | Tidak | Dokumen, planning, code per file, review, artifact | Project instruction / custom prompt |

**2\. DECISION LOG \- WAJIB DIBUAT**

Setiap keputusan penting harus dicatat agar AI, developer, stakeholder, dan client memiliki jejak keputusan yang jelas. Buat file DECISION\_LOG.md di root project.

| Date | Decision | Reason | Approved By | Impact |
| :---- | :---- | :---- | :---- | :---- |
| YYYY-MM-DD | Use Next.js for frontend | SEO friendly, strong ecosystem, fast development | User / PO | Frontend stack locked |
| YYYY-MM-DD | Use PostgreSQL | Relational data, reporting, scalable for MVP | Tech Lead | Database strategy locked |
| YYYY-MM-DD | Use email/password \+ OAuth | Lower onboarding friction and common auth pattern | PO | Auth flow defined |

Prompt tambahan untuk AI: Setiap kali membuat keputusan arsitektur, fitur, desain, keamanan, hosting, atau workflow, update DECISION\_LOG.md. Jangan mengubah keputusan yang sudah locked tanpa meminta user mengetik REVISE atau APPROVE CHANGE.

**3\. ASSUMPTION LOG \- WAJIB DIBUAT**

AI sering membuat asumsi ketika informasi belum lengkap. Semua asumsi harus dicatat agar tidak berubah menjadi requirement palsu. Buat file ASSUMPTIONS.md di root project.

| Assumption | Risk | Need User Confirmation? | Status |
| :---- | :---- | :---- | :---- |
| User login menggunakan email dan password | Medium | Yes | Pending / Approved / Rejected |
| Website menggunakan Bahasa Indonesia sebagai default | Low | Yes | Pending / Approved / Rejected |
| Payment gateway belum masuk MVP | High | Yes | Pending / Approved / Rejected |

Prompt tambahan untuk AI: Jika ada data yang belum diberikan user, tulis di ASSUMPTIONS.md. Untuk asumsi berdampak besar pada fitur, database, biaya, security, atau UX, minta konfirmasi user sebelum implementasi.

**4\. R\&D FEATURE SCORING FRAMEWORK**

Tim R\&D tidak hanya memberi ide fitur, tetapi juga memberi prioritas berbasis dampak, kebutuhan user, potensi bisnis, risiko, dan effort. Gunakan framework ini sebelum fitur masuk MVP.

| Feature Idea | User Need | Business Impact | Revenue Potential | Effort | Risk | Priority |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Google Login | High | Medium | Medium | Medium | Low | P0 / P1 |
| AI Chat Assistant | Medium | High | High | High | Medium | P1 / P2 |
| Admin Analytics Dashboard | High | High | Medium | Medium | Low | P0 / P1 |
| Referral Program | Medium | Medium | High | Medium | Medium | P1 / P2 |

RICE Score optional: Reach x Impact x Confidence / Effort. Gunakan RICE jika proyek membutuhkan prioritas fitur yang lebih kuantitatif.

Prompt tambahan untuk AI: Sebelum mengunci MVP, buat Feature Recommendation Backlog. Pisahkan fitur P0, P1, dan P2. Jelaskan mengapa fitur masuk MVP atau ditunda.

**5\. CONTENT & SEO GOVERNANCE**

Untuk setiap halaman website publik, AI wajib membuat content plan dan SEO checklist. Tujuannya agar website mudah dipahami user, search engine, dan AI answer engine.

• Page purpose jelas dan sesuai kebutuhan user.

• Search intent dan target keyword ditentukan jika halaman bersifat publik.

• Title tag unik, natural, dan relevan.

• Meta description unik dengan value proposition yang jelas.

• H1 hanya satu dan merepresentasikan topik utama halaman.

• Heading H2/H3 rapi dan tidak lompat secara tidak logis.

• Internal link tersedia ke halaman relevan.

• Image alt text tersedia dan deskriptif.

• Canonical URL tersedia untuk mencegah duplikasi.

• Schema markup digunakan jika relevan.

• CTA jelas dan sesuai tujuan halaman.

**6\. ACCESSIBILITY READINESS GATE**

Accessibility harus menjadi bagian dari quality gate, bukan hanya tambahan di akhir. Target minimal: pengalaman dasar yang ramah keyboard, screen reader, dan pengguna dengan keterbatasan visual.

• Keyboard navigation berjalan untuk semua action utama.

• Focus state terlihat jelas.

• Color contrast aman untuk teks dan tombol utama.

• Form label, helper text, dan error message jelas.

• Alt text tersedia untuk gambar informatif.

• ARIA digunakan hanya jika semantic HTML tidak cukup.

• Modal, dropdown, tab, dan menu bisa digunakan tanpa mouse.

• Screen reader basic flow pass untuk halaman utama.

Gate rule: jika critical user flow tidak bisa diakses dengan keyboard, status accessibility belum pass dan tidak boleh launch.

**7\. AI FRIENDLY / LLM FRIENDLY GOVERNANCE**

AI friendly bukan hanya menambahkan llms.txt. Website harus memiliki struktur konten yang jelas, semantic HTML, metadata, schema, sitemap, robots.txt, dan informasi penting yang dapat dibaca sebagai teks.

• Gunakan semantic HTML: header, nav, main, section, article, aside, footer.

• Konten utama jangan hanya berupa gambar, canvas, atau komponen yang tidak terbaca crawler.

• Entity penting konsisten: nama brand, produk, layanan, lokasi, harga, kontak, dan FAQ.

• Schema markup tidak boleh berisi klaim yang tidak tampil di halaman.

• Sitemap.xml dan robots.txt harus sesuai dengan tujuan discoverability.

• llms.txt bersifat optional dan digunakan jika relevan untuk SaaS, dokumentasi, knowledge base, marketplace, website edukasi, atau website layanan profesional.

• Buat halaman About, Contact, Privacy Policy, dan FAQ jika website publik membutuhkan trust signal.

**8\. PRIVACY, LEGAL & COMPLIANCE READINESS**

Bagian ini wajib dicek sebelum website atau aplikasi menerima data user, analytics, form kontak, akun, pembayaran, atau data pelanggan.

• Privacy Policy tersedia dan sesuai data yang dikumpulkan.

• Terms of Service tersedia jika produk memiliki akun, transaksi, atau layanan berkelanjutan.

• Cookie notice / consent banner disiapkan jika menggunakan tracking yang membutuhkan consent.

• Data retention policy didefinisikan.

• User data deletion request flow tersedia jika user dapat membuat akun.

• Contact/support/legal page tersedia.

• Log aplikasi tidak menyimpan password, token, OTP, atau data sensitif.

• API dan database membatasi akses berdasarkan role dan principle of least privilege.

**9\. ANALYTICS EVENT PLAN**

Website/aplikasi harus bisa diukur. AI wajib membuat event tracking plan sebelum launch agar performa produk dapat dievaluasi berdasarkan data.

| Event Name | Trigger | Parameter | Purpose |
| :---- | :---- | :---- | :---- |
| page\_view | User membuka halaman | page\_url, referrer | Traffic analysis |
| cta\_clicked | User klik tombol utama | button\_name, page\_url | Measure CTA performance |
| sign\_up\_started | User mulai daftar | source, method | Funnel tracking |
| sign\_up\_completed | Akun berhasil dibuat | method | Conversion tracking |
| form\_submitted | User submit form | form\_name, page\_url | Lead generation tracking |
| checkout\_started | User mulai pembayaran | product\_id, value | Revenue funnel |
| purchase\_completed | Pembayaran sukses | order\_id, value | Revenue tracking |

Prompt tambahan untuk AI: Untuk setiap fitur utama, tentukan minimal satu event analytics yang relevan. Jangan melacak data sensitif seperti password, token, OTP, nomor kartu, atau data pribadi yang tidak diperlukan.

**10\. HANDOVER PACKAGE**

Jika project akan diserahkan ke client atau tim internal, AI wajib membuat paket handover agar maintenance tidak bergantung pada satu orang.

• README lengkap: setup, install, run, build, test, deploy.

• Admin guide untuk mengelola konten, user, produk, order, atau data utama.

• User guide jika aplikasi memiliki workflow khusus.

• Deployment guide dan rollback guide.

• Backup & restore guide.

• Environment variables list tanpa membocorkan secret value.

• Access inventory: GitHub, hosting, database, analytics, payment, email, domain.

• Known issues dan technical debt list.

• Maintenance schedule dan dependency update plan.

• Roadmap fase berikutnya berdasarkan backlog dan data post-launch.

**11\. FINAL AI CODING AGENT PROMPT ADDITION**

Tambahkan instruksi ini ke AGENTS.md, CLAUDE.md, atau file instruksi agent lain sesuai tool yang digunakan:

Sebelum implementasi fitur besar, cek DECISION\_LOG.md, ASSUMPTIONS.md, Feature Recommendation Backlog, SEO checklist, Accessibility Gate, Privacy/Legal checklist, Analytics Event Plan, dan Handover Package. Jika ada item yang belum jelas, catat sebagai assumption dan minta approval user. Setelah setiap fase, tampilkan Summary, Files Created/Updated, How to Run, How to Test, Risks, dan User Confirmation Gate: LOCK / REVISE / ABORT.

**12\. UPDATED MASTER CHECKLIST ADDITION**

| Langkah Tambahan | Tugas | Status |
| :---- | :---- | :---- |
| Governance 1 | AI Tool Profile Matrix dipilih sesuai platform yang digunakan | \[ \] |
| Governance 2 | DECISION\_LOG.md dibuat dan di-update setiap keputusan penting | \[ \] |
| Governance 3 | ASSUMPTIONS.md dibuat dan semua asumsi besar dikonfirmasi | \[ \] |
| R\&D | Feature Scoring Framework dijalankan sebelum MVP dikunci | \[ \] |
| SEO | Content & SEO Governance selesai untuk semua halaman publik | \[ \] |
| Accessibility | Accessibility Readiness Gate pass | \[ \] |
| AI Friendly | AI/LLM Friendly Governance pass | \[ \] |
| Legal | Privacy, Legal & Compliance Readiness pass | \[ \] |
| Analytics | Analytics Event Plan dibuat dan tracking utama siap | \[ \] |
| Handover | Handover Package lengkap untuk client/tim internal | \[ \] |

**ADDENDUM — SOLO NEWBIE OWNER MODE & LEARNING GUIDE**  
**Bagian ini digunakan jika project dijalankan oleh satu orang, user masih pemula, belum punya tim teknis, atau ingin belajar sambil membangun MVP. Dalam mode ini, AI wajib memperlakukan user sebagai Product Owner / Project Director, bukan sebagai developer yang harus memahami semua detail teknis.**  
**1\. KAPAN MODE INI DIGUNAKAN?**  
User bekerja sendirian atau belum punya tim teknis.  
User masih newbie dan ingin dibimbing step by step.  
Project masih tahap MVP, validasi ide, prototype, atau website sederhana sampai menengah.  
User ingin AI mengerjakan bagian teknis, sedangkan user fokus pada approval, revisi, dan keputusan bisnis.  
AI coding tool yang digunakan adalah Codex, Claude Code, Cursor, Windsurf, Replit Agent, Lovable, Bolt, ChatGPT, atau Claude Web.  
**2\. PERAN USER DAN AI**

| Area | Tugas User | Tugas AI |
| :---- | :---- | :---- |
| Arah project | Menjelaskan kebutuhan, target user, bisnis, dan contoh referensi. | Mengubah kebutuhan menjadi requirement, user story, MVP, dan roadmap. |
| Keputusan | Memilih opsi, menyetujui, menolak, atau meminta revisi. | Memberi rekomendasi terbaik, pro/kontra, dan risiko tiap pilihan. |
| Teknis | Tidak wajib coding; cukup memahami ringkasan dan mencoba hasil. | Membuat struktur folder, kode, database, API, test, deployment guide, dan dokumentasi. |
| Review | Cek apakah hasil sesuai bayangan dan kebutuhan real. | Menampilkan summary, file yang berubah, cara run, cara test, dan confirmation gate. |
| Approval | Ketik LOCK, REVISE, EXPLAIN, TEST, atau ABORT. | Tidak lanjut fase sebelum instruksi user jelas. |

**3\. COMMAND KONFIRMASI UNTUK SOLO USER**

| Command | Arti dan Kapan Digunakan |
| :---- | :---- |
| LOCK | Saya setuju dengan hasil fase ini. Lanjut ke fase berikutnya. |
| REVISE: \[jelaskan revisi\] | Ada bagian yang perlu diubah. AI wajib revisi dulu dan tidak boleh lanjut. |
| EXPLAIN | Jelaskan ulang dengan bahasa lebih sederhana karena user belum paham. |
| TEST | Berikan langkah manual yang harus user coba untuk mengecek hasil. |
| DETAIL | Jabarkan lebih lengkap sebelum user memberi approval. |
| ABORT | Hentikan proses atau jangan lanjut mengerjakan project. |

**4\. ATURAN AI DALAM SOLO NEWBIE OWNER MODE**  
AI wajib menjelaskan istilah teknis dengan bahasa sederhana sebelum meminta user mengambil keputusan.  
AI tidak boleh membuat arsitektur terlalu kompleks untuk MVP pemula. Hindari microservices, Kubernetes, event-driven architecture kompleks, dan CI/CD enterprise kecuali user meminta.  
AI wajib membedakan fitur: Wajib Sekarang, Bisa Nanti, dan Tidak Perlu untuk MVP.  
AI wajib memberi rekomendasi default jika user bingung memilih.  
AI wajib memberi checklist testing manual yang mudah dicoba user.  
AI wajib menyederhanakan backend, security, deployment, dan QA agar tetap aman tetapi tidak menakutkan untuk pemula.  
AI wajib mencatat keputusan penting ke DECISION\_LOG.md dan asumsi ke ASSUMPTIONS.md.  
AI wajib menampilkan risiko jika user ingin skip security, backup, privacy, atau testing.  
**5\. JALUR EKSEKUSI SOLO NEWBIE**  
Gunakan jalur ringan ini sebelum memakai seluruh Full Team Production Mode:  
Ide Project  
↓  
Fase 0: Setup sederhana  
↓  
Fase 1: MVP dan fitur utama  
↓  
Fase 3: Design direction sederhana  
↓  
Sprint 0: Struktur project  
↓  
Frontend \+ Backend dasar  
↓  
Testing manual  
↓  
SEO, security, privacy dasar  
↓  
Deploy ke hosting beginner-friendly  
↓  
Launch MVP  
↓  
Perbaiki berdasarkan feedback user  
**6\. BAGIAN BERAT — LEARNING GUIDE UNTUK PEMULA**  
Jika user belum paham bagian teknis berat, AI wajib memakai format belajar berikut sebelum eksekusi:  
Untuk setiap topik berat, jelaskan:  
1\. Apa maksudnya?  
2\. Kenapa penting?  
3\. Contoh sederhananya apa?  
4\. Kapan digunakan?  
5\. Kesalahan pemula yang sering terjadi?  
6\. Checklist pengerjaan  
7\. Prompt belajar  
8\. Prompt eksekusi

| Topik Berat | Yang Harus Dijelaskan AI |
| :---- | :---- |
| Backend & API | Jelaskan frontend, backend, API, request, response, endpoint, CRUD, validation, dan error handling dengan contoh form order. |
| Database | Jelaskan table, column, row, primary key, relationship, migration, seed, dan contoh desain database sederhana. |
| Authentication | Jelaskan register, login, logout, password hashing, session/token, role user, protected page, dan reset password. |
| Deployment | Jelaskan development, staging, production, domain, hosting, SSL, environment variable, dan alur deploy dari GitHub. |
| Security | Jelaskan HTTPS, password hashing, input validation, secret management, rate limiting, RBAC, backup, dan log sensitif. |
| QA & Testing | Jelaskan test case, bug, happy path, edge case, error case, UAT, dan checklist testing manual. |
| SEO & Analytics | Jelaskan title, meta description, heading, alt text, sitemap, robots.txt, schema, event tracking, dan conversion. |
| Handover | Jelaskan README, admin guide, user guide, deployment guide, backup guide, access inventory, known issues, dan roadmap. |

**7\. PROMPT WAJIB UNTUK MENGAKTIFKAN SOLO NEWBIE OWNER MODE**  
Tempel prompt ini di awal percakapan atau di AGENTS.md / CLAUDE.md / project instruction jika ingin AI menjalankan pipeline dengan mode pemula:  
Aktifkan SOLO NEWBIE OWNER MODE.

Saya bekerja sendirian dan masih pemula. Perlakukan saya sebagai Product Owner / Project Director, bukan sebagai developer.

Tugas AI:  
1\. Jalankan master pipeline fase demi fase.  
2\. Jangan lanjut sebelum saya mengetik LOCK.  
3\. Jika saya mengetik REVISE, revisi dulu.  
4\. Jika saya mengetik EXPLAIN, jelaskan dengan bahasa lebih sederhana.  
5\. Jika saya mengetik TEST, berikan langkah testing manual.  
6\. Jangan membuat arsitektur terlalu kompleks untuk MVP.  
7\. Beri rekomendasi default jika saya bingung.  
8\. Catat keputusan ke DECISION\_LOG.md dan asumsi ke ASSUMPTIONS.md.  
9\. Setelah setiap fase, tampilkan Summary, Files Changed, How to Run, How to Test, dan User Confirmation.  
10\. Prioritaskan MVP, security dasar, SEO dasar, privacy dasar, dan deployment yang mudah.

Mulai dari Fase 0 dan tanyakan pertanyaan setup satu per satu.  
**8\. PROMPT BELAJAR BAGIAN BERAT**  
Gunakan prompt ini kapan pun user merasa bagian tertentu terlalu berat:  
Saya pemula dan belum paham bagian \[NAMA TOPIK\].

Jelaskan dengan format:  
1\. Apa maksudnya?  
2\. Kenapa penting?  
3\. Contoh sederhananya apa?  
4\. Kapan digunakan?  
5\. Kesalahan pemula yang sering terjadi?  
6\. Checklist pengerjaan  
7\. Prompt belajar  
8\. Prompt eksekusi

Gunakan contoh project saya, jangan langsung coding dulu sebelum konsepnya jelas.  
**9\. CHECKLIST SOLO USER SEBELUM LOCK**  
Saya paham tujuan fase ini secara umum.  
Saya tahu file atau output apa yang dibuat AI.  
Saya sudah membaca summary dan keputusan penting.  
Saya sudah mencoba langkah testing manual jika ada hasil yang bisa dicoba.  
Saya sudah memberi revisi jika ada yang tidak sesuai.  
Saya tidak melihat asumsi besar yang belum saya setujui.  
Saya siap lanjut ke fase berikutnya dengan mengetik LOCK.  
**10\. UPDATED MASTER CHECKLIST — SOLO NEWBIE ADDITION**

| Langkah | Tugas Tambahan | Status |
| :---- | :---- | :---- |
| Solo Mode | Solo Newbie Owner Mode diaktifkan jika user bekerja sendiri / pemula. | \[ \] |
| Solo Mode | AI menjelaskan peran user sebagai approver, reviewer, dan decision maker. | \[ \] |
| Learning | Guide bagian berat digunakan untuk backend, database, deployment, security, QA, SEO, analytics, dan handover. | \[ \] |
| Review | AI menyediakan command LOCK, REVISE, EXPLAIN, TEST, DETAIL, dan ABORT. | \[ \] |
| Testing | User menerima checklist testing manual sebelum approval fase development. | \[ \] |
| Decision | Keputusan penting dicatat ke DECISION\_LOG.md dan asumsi ke ASSUMPTIONS.md. | \[ \] |

**Catatan akhir: Mode ini tidak menghapus Full Team Production Mode. Mode ini hanya membuat pipeline lebih ramah untuk solo builder dan pemula. Jika project sudah besar, memiliki banyak user, pembayaran, data sensitif, atau client enterprise, gunakan kembali Full Team Production Mode dan libatkan reviewer teknis bila memungkinkan.**

**ADDENDUM — PREMIUM UI/UX DIRECTION MODE**  
Bagian ini membuat AI tidak hanya membuat website yang berfungsi, tetapi juga mampu merancang arah visual, struktur halaman, animasi, interaksi, dan kualitas UI/UX yang terasa profesional seperti website agensi premium, enterprise, atau project bernilai tinggi.  
**1\. Tujuan Premium UI/UX Direction Mode**  
• Memaksa AI membuat arahan desain terlebih dahulu sebelum coding UI.  
• Menghindari hasil website yang terlihat generik, template biasa, atau setengah matang.  
• Membantu user pemula menilai desain dengan checklist yang jelas.  
• Membuat setiap halaman punya fungsi bisnis, flow, visual hierarchy, CTA, dan pengalaman interaksi yang matang.  
• Menyelaraskan tampilan dengan standar website modern: mobile-first, SEO friendly, accessible, conversion-focused, dan AI-friendly bila relevan.  
**2\. Aturan Utama Premium UI/UX Direction Mode**  
PREMIUM UI/UX DIRECTION MODE

Mode ini wajib aktif sebelum AI membuat UI website/aplikasi.

Aturan utama:  
1\. AI tidak boleh langsung coding tampilan sebelum membuat Style Direction.  
2\. AI wajib membuat Page Section Blueprint untuk setiap halaman utama.  
3\. AI wajib menjelaskan visual hierarchy, CTA, content flow, dan user intent per section.  
4\. AI wajib memberi rekomendasi animation dan micro-interaction yang halus, bukan berlebihan.  
5\. AI wajib memastikan UI terlihat profesional, bukan template mentah.  
6\. AI wajib menjaga performance: animasi tidak boleh merusak Core Web Vitals.  
7\. AI wajib membuat Design QA Gate sebelum user memberi LOCK UI.  
8\. AI wajib mengerjakan UI page-by-page dan section-by-section, bukan semua sekaligus.  
9\. AI wajib memberi alasan kenapa desain tersebut cocok untuk target user dan brand.  
10\. AI wajib meminta approval user sebelum implementasi UI besar.  
**3\. Style Direction Brief — Wajib Dibuat Sebelum UI**  
Sebelum membuat halaman, AI wajib menghasilkan dokumen Style Direction Brief. Ini menjadi arah seni website/aplikasi agar tampilannya konsisten dan premium.

| Elemen | Yang Harus Dijelaskan AI |
| :---- | :---- |
| Brand Personality | Contoh: premium, trustworthy, modern, warm, professional, playful, elegant, luxury, tech-forward. |
| Target Visual Impression | Kesan pertama yang harus dirasakan user dalam 3 detik pertama. |
| Color System | Primary, secondary, accent, neutral, background, surface, border, semantic colors. |
| Typography Direction | Font style, hierarchy, heading, body, caption, button label, readability. |
| Layout Principle | Grid, spacing, whitespace, section rhythm, container width, visual balance. |
| Imagery Direction | Foto, ilustrasi, icon, 3D, mockup, pattern, texture, atau editorial style. |
| Component Style | Button, card, navbar, form, modal, pricing card, testimonial, table, badge. |
| Motion Personality | Animasi calm, premium, subtle, fast, playful, cinematic, atau minimal. |
| UX Tone | Bahasa CTA, microcopy, error message, empty state, onboarding copy. |

**4\. Page Section Blueprint — Wajib untuk Setiap Halaman**  
AI wajib memecah setiap halaman menjadi section yang jelas. Setiap section harus punya tujuan, isi konten, elemen visual, CTA, dan status implementasi.

| Section | Tujuan | Elemen UI | CTA / Action | Status |
| :---- | :---- | :---- | :---- | :---- |
| Hero | Menjelaskan value utama dalam 3 detik | Headline, subheadline, image/mockup, CTA utama | Hubungi / Mulai / Lihat Demo | Required |
| Problem | Membuat user merasa dipahami | Pain points, icon, short copy | Lanjut baca | Optional sesuai produk |
| Solution | Menjelaskan produk/jasa sebagai solusi | Cards, bullets, visual comparison | Pelajari layanan | Required |
| Features / Services | Menampilkan fitur/layanan utama | Cards, icons, benefit copy | Pilih layanan | Required |
| Social Proof | Meningkatkan trust | Testimoni, logo client, rating, case study | Lihat portfolio | Strongly recommended |
| Process / How It Works | Membuat user paham alur | Step cards, timeline, arrows | Mulai konsultasi | Recommended |
| Portfolio / Case Study | Membuktikan kualitas | Gallery, before-after, result metrics | Lihat detail | Recommended |
| Pricing / Offer | Membantu keputusan beli | Pricing cards, package comparison | Pilih paket | Jika relevan |
| FAQ | Mengurangi keraguan user | Accordion, questions, short answers | Hubungi kami | Recommended |
| Final CTA | Mendorong tindakan terakhir | CTA block, trust note, contact link | WhatsApp / Book call | Required |

**5\. Premium Visual Standard Checklist**  
• Hero section tidak boleh kosong atau generik; wajib punya value proposition yang kuat.  
• CTA utama harus terlihat jelas, konsisten, dan berada di area strategis.  
• Whitespace harus cukup; jangan membuat halaman terlalu padat.  
• Typography harus punya hierarchy: H1, H2, body, caption, label, button.  
• Card dan section harus konsisten dari sisi radius, shadow, border, spacing, dan hover state.  
• Warna harus konsisten menggunakan design tokens, bukan warna acak per komponen.  
• Mobile layout harus diprioritaskan, bukan hanya versi desktop diperkecil.  
• Setiap section harus punya alasan bisnis: trust, clarity, conversion, education, atau retention.  
• Tidak boleh ada layout yang terlihat seperti default template tanpa penyesuaian brand.  
• UI harus memiliki polish: hover state, focus state, loading state, empty state, dan error state jika relevan.  
**6\. Animation & Micro-Interaction Direction**  
Animasi harus membantu pengalaman user, bukan sekadar hiasan. Untuk website profesional, animasi sebaiknya halus, ringan, dan konsisten.

| Area | Rekomendasi Animasi | Catatan |
| :---- | :---- | :---- |
| Hero | Fade up / subtle slide / staggered entrance | Durasi pendek, tidak mengganggu LCP. |
| Cards | Hover lift 2-6px, soft shadow, border accent | Jangan terlalu melompat. |
| Buttons | Hover color transition, icon move 2-4px | CTA terasa hidup tapi tetap elegan. |
| Navbar | Sticky blur / subtle shadow on scroll | Pastikan tetap readable. |
| Section Reveal | Intersection fade-in ringan | Optional, jangan semua elemen dibuat berat. |
| FAQ | Smooth accordion open/close | Harus accessible keyboard. |
| Form | Focus ring, validation feedback, success state | Utamakan kejelasan dan usability. |
| Page Transition | Minimal transition | Hindari animasi besar yang memperlambat navigasi. |

**7\. Professional UX Layer yang Wajib Dipikirkan AI**  
• Conversion Flow: alur dari user masuk halaman sampai melakukan action utama.  
• Trust Layer: testimoni, angka, logo client, sertifikasi, garansi, case study, atau proof lain.  
• Clarity Layer: copywriting singkat, tidak bertele-tele, manfaat jelas.  
• Friction Reduction: kurangi langkah user, buat form pendek, CTA mudah ditemukan.  
• Decision Support: pricing, FAQ, comparison, benefit, dan proses kerja yang mudah dipahami.  
• Retention/Return Layer: newsletter, resource, dashboard, saved item, reminder, atau follow-up jika relevan.  
• Accessibility Layer: keyboard navigation, contrast, label form, aria jika perlu, dan semantic HTML.  
• SEO/AI Layer: heading rapi, internal link, schema, sitemap, robots.txt, konten mudah dipahami mesin pencari dan AI crawler.  
**8\. UI/UX Premium Quality Gate**  
UI/UX PREMIUM QUALITY GATE

Sebelum user mengetik LOCK UI, AI wajib memastikan:

\- Style Direction Brief selesai  
\- Page Section Blueprint selesai  
\- Semua section punya tujuan bisnis  
\- CTA utama jelas dan konsisten  
\- Visual hierarchy rapi  
\- Typography readable di desktop dan mobile  
\- Spacing dan whitespace konsisten  
\- Component state tersedia: default, hover, focus, disabled, loading  
\- Mobile responsive dicek  
\- Accessibility dasar dicek  
\- SEO dasar tersedia untuk halaman utama  
\- Animation tidak berlebihan dan tidak merusak performance  
\- Tidak ada layout yang terlihat unfinished  
\- User mendapat checklist testing visual

Jika salah satu belum terpenuhi, UI belum boleh dianggap DONE.  
**9\. Page-by-Page Premium Execution Rule**  
Untuk mencegah banyak halaman setengah jadi, AI wajib menyelesaikan satu halaman sampai siap review sebelum lanjut ke halaman berikutnya.  
PAGE-BY-PAGE PREMIUM EXECUTION RULE

1\. AI hanya boleh mengerjakan 1 halaman aktif dalam satu waktu.  
2\. AI wajib membuat blueprint halaman sebelum coding.  
3\. AI wajib menyelesaikan semua section P0 pada halaman tersebut.  
4\. AI wajib mengecek responsive desktop/tablet/mobile.  
5\. AI wajib memberi visual QA checklist kepada user.  
6\. AI wajib meminta LOCK PAGE sebelum lanjut halaman berikutnya.  
7\. Jika halaman belum rapi, AI wajib revisi dulu, bukan lanjut halaman lain.

Command:  
LOCK UI \= Style direction disetujui  
LOCK PAGE \= Halaman ini selesai dan boleh lanjut  
REVISE UI \= Revisi arah desain  
REVISE PAGE \= Revisi halaman tertentu  
TEST UI \= Berikan panduan cek tampilan  
**10\. Prompt Siap Pakai — Meminta Style Direction Premium**  
Aktifkan PREMIUM UI/UX DIRECTION MODE.

Sebelum coding UI, buatkan Style Direction Brief untuk website/aplikasi ini.

Output wajib berisi:  
1\. Brand personality  
2\. Target visual impression  
3\. Color system  
4\. Typography direction  
5\. Layout principle  
6\. Imagery direction  
7\. Component style  
8\. Motion/animation direction  
9\. UX tone dan microcopy  
10\. Referensi kualitas: website premium, modern, conversion-focused

Jangan coding dulu.  
Setelah selesai, minta saya mengetik LOCK UI atau REVISE UI.  
**11\. Prompt Siap Pakai — Membuat Page Section Blueprint**  
Buat Page Section Blueprint untuk halaman \[nama halaman\].

Untuk setiap section, jelaskan:  
1\. Nama section  
2\. Tujuan bisnis/UX  
3\. Konten utama  
4\. Elemen visual  
5\. CTA  
6\. Animasi/micro-interaction  
7\. SEO/heading consideration  
8\. Mobile layout note  
9\. Definition of Done

Jangan coding dulu sebelum saya mengetik LOCK PAGE PLAN.  
**12\. Prompt Siap Pakai — Implementasi UI Premium Satu Halaman**  
LOCK PAGE PLAN.

Implementasikan hanya halaman \[nama halaman\].  
Jangan mengerjakan halaman lain.

Ikuti Style Direction Brief dan Page Section Blueprint.

Definition of Done:  
1\. Semua section P0 selesai  
2\. Desktop rapi  
3\. Mobile rapi  
4\. CTA bisa diklik  
5\. Hover/focus state ada  
6\. Animasi halus dan ringan  
7\. Tidak ada error console  
8\. SEO title/meta/heading dasar benar  
9\. Accessibility dasar aman  
10\. Berikan checklist testing manual

Setelah selesai, tampilkan:  
\- Summary  
\- Files changed  
\- Cara run  
\- Cara test visual  
\- Status halaman  
\- Hal yang belum selesai jika ada

Jangan lanjut halaman lain sebelum saya mengetik LOCK PAGE.  
**13\. Tambahan Master Checklist — Premium UI/UX**

| Langkah | Tugas | Status |
| :---- | :---- | :---- |
| UI-0 | Premium UI/UX Direction Mode diaktifkan | \[ \] |
| UI-1 | Style Direction Brief selesai dan disetujui | \[ \] |
| UI-2 | Design tokens: warna, typography, spacing, radius, shadow dikunci | \[ \] |
| UI-3 | Page Section Blueprint dibuat untuk semua halaman MVP | \[ \] |
| UI-4 | Animation & micro-interaction direction disetujui | \[ \] |
| UI-5 | Homepage selesai dan mendapat LOCK PAGE | \[ \] |
| UI-6 | Halaman layanan/fitur selesai dan mendapat LOCK PAGE | \[ \] |
| UI-7 | Halaman kontak/CTA selesai dan mendapat LOCK PAGE | \[ \] |
| UI-8 | Mobile responsive visual QA pass | \[ \] |
| UI-9 | Accessibility dasar pass | \[ \] |
| UI-10 | SEO dasar per halaman pass | \[ \] |
| UI-11 | Premium UI/UX Quality Gate pass | \[ \] |

**14\. Catatan Penting untuk User Pemula**  
Website terlihat mahal bukan berarti harus penuh animasi atau fitur rumit. Biasanya yang membuat website terasa premium adalah kejelasan pesan, visual hierarchy, spacing rapi, copywriting kuat, trust element, CTA jelas, konsistensi komponen, mobile experience yang bagus, dan detail kecil yang dipoles.  
Gunakan command ini ketika review UI:  
LOCK UI     \= arah visual sudah sesuai  
REVISE UI   \= revisi arah visual  
LOCK PAGE   \= halaman sudah selesai dan boleh lanjut  
REVISE PAGE \= revisi halaman tertentu  
TEST UI     \= minta checklist cara mengecek tampilan  
EXPLAIN     \= jelaskan konsep UI/UX dengan bahasa lebih sederhana

**ADDENDUM FINAL — AGENT-PROOF EXECUTION, PAGE COMPLETENESS & FEATURE SUGGESTION**

Bagian ini ditambahkan untuk mencegah AI coding agent membuat halaman kosong, fitur setengah jadi, desain generik, atau langsung coding tanpa strategi. Addendum ini wajib dibaca bersama Master Pipeline utama dan aktif terutama saat memakai Antigravity, Codex, Claude Code, Cursor, Windsurf, Replit Agent, Lovable, Bolt, atau AI code tool lain.

**A. STRICT MVP EXECUTION & FEATURE COMPLETION CONTROL**

**A1. Strict MVP Execution Mode**

Mode ini wajib aktif jika user bekerja sendirian, masih pemula, atau memakai AI coding agent. Tujuannya adalah menyelesaikan MVP secara disiplin, bukan membuat banyak fitur setengah jadi.

AI tidak boleh mengerjakan banyak fitur sekaligus.

AI hanya boleh mengerjakan 1 fitur aktif dalam satu waktu.

Setiap fitur wajib selesai sampai bisa dites sebelum lanjut.

AI wajib membuat Definition of Done untuk setiap fitur.

AI wajib membuat daftar fitur yang belum selesai.

AI tidak boleh lanjut ke fitur berikutnya sebelum user mengetik LOCK FEATURE.

Jika fitur terlalu besar, AI wajib memecahnya menjadi sub-fitur kecil.

Jika AI tidak bisa menyelesaikan fitur, AI wajib jujur menulis blocker.

AI tidak boleh membuat fitur baru di luar MVP tanpa approval user.

**A2. One Feature at a Time Rule**

| ONE FEATURE AT A TIME RULE Alur wajib: 1\. Pilih 1 fitur aktif. 2\. Jelaskan tujuan fitur. 3\. Jelaskan file yang akan diubah. 4\. Implementasikan fitur. 5\. Jalankan lint/build/test jika environment mendukung. 6\. Perbaiki error. 7\. Berikan cara test manual. 8\. Tampilkan status fitur. 9\. Tunggu LOCK FEATURE sebelum lanjut. |
| :---- |

**A3. Feature Completion Gate**

Sebelum fitur dianggap selesai, semua item berikut wajib terpenuhi:

UI tampil sesuai requirement.

Fitur bisa digunakan end-to-end.

Tidak ada error utama di console.

Tidak ada broken link.

Responsive di mobile.

Loading state ada jika dibutuhkan.

Empty state ada jika dibutuhkan.

Error state ada jika dibutuhkan.

Data tersimpan/terkirim jika fitur memakai backend.

User mendapat instruksi testing yang jelas.

**A4. Unfinished Feature Tracker**

| Fitur | Status | Sudah Selesai | Belum Selesai | Blocker | Next Action |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Homepage | IN PROGRESS | Navbar, hero | CTA belum aktif, mobile belum dicek | \- | Selesaikan CTA dan mobile QA |
| Contact Form | NOT STARTED | \- | Form UI, validasi, submit handling | Belum ada email target | Minta user pilih WhatsApp/email |
| Portfolio | BLOCKED | Section layout | Content real belum ada | Data portfolio belum tersedia | Gunakan premium seed content sementara |

AI wajib update tracker setelah setiap perubahan besar.

AI tidak boleh mulai fitur baru jika masih ada fitur P0 berstatus BLOCKED atau IN PROGRESS.

Status yang digunakan: NOT STARTED, IN PROGRESS, NEEDS TESTING, DONE, BLOCKED.

**A5. Approval Commands untuk Feature Control**

| Command | Arti | Kapan Dipakai |
| :---- | :---- | :---- |
| LOCK FEATURE | Fitur sudah dicek user dan boleh lanjut fitur berikutnya. | Setelah fitur lolos test manual. |
| REVISE FEATURE | Fitur belum sesuai dan perlu direvisi. | Saat UI, flow, atau behavior belum cocok. |
| LOCK FIX | Setuju memperbaiki fitur tertentu. | Setelah AI melakukan audit dan merekomendasikan fix. |
| AUDIT FIRST | AI harus audit dulu, jangan coding. | Saat project sudah kacau atau banyak fitur setengah jadi. |

**A6. Audit Existing Project Prompt**

| Aktifkan STRICT MVP EXECUTION MODE. Jangan mengerjakan semua fitur sekaligus. Baca PROJECT\_CONTEXT.md, MASTER\_PIPELINE.md, dan AGENTS.md. Tugas sekarang: 1\. Audit project yang sudah dibuat. 2\. Buat daftar semua fitur yang sudah ada. 3\. Tentukan status tiap fitur: DONE, IN PROGRESS, BROKEN, NOT STARTED, BLOCKED. 4\. Jangan membuat fitur baru dulu. 5\. Fokus hanya menyelesaikan fitur yang belum selesai. 6\. Prioritaskan fitur P0. 7\. Berikan laporan dalam tabel. Setelah audit selesai, tanya fitur mana yang ingin diselesaikan lebih dulu. Jangan coding sebelum user mengetik LOCK FIX. |
| :---- |

**A7. Fix Unfinished Feature Prompt**

| LOCK FIX. Selesaikan hanya fitur: \[NAMA FITUR\]. Jangan mengerjakan fitur lain. Definition of Done: 1\. \[kriteria 1\] 2\. \[kriteria 2\] 3\. \[kriteria 3\] 4\. Bisa dijalankan lokal. 5\. Bisa dites manual oleh user. Setelah selesai, tampilkan: \- file yang diubah \- cara menjalankan \- cara test manual \- status fitur \- apakah masih ada yang belum selesai Jangan lanjut ke fitur lain sebelum user mengetik LOCK FEATURE. |
| :---- |

**B. MANDATORY FEATURE SUGGESTION ENGINE**

**B1. R\&D Feature Suggestion Gate**

AI wajib memberikan rekomendasi fitur sebelum MVP dikunci. R\&D tidak boleh hanya menjadi role pasif; R\&D wajib menghasilkan output nyata.

AI tidak boleh hanya menjalankan fitur yang disebut user.

AI wajib bertindak sebagai Product Strategist, R\&D Team, UX Strategist, dan Business Analyst.

AI wajib memberi saran fitur sebelum coding.

AI wajib memisahkan fitur menjadi P0, P1, P2, dan Features to Avoid.

AI tidak boleh lanjut coding sebelum user mengetik LOCK MVP.

**B2. Proactive Suggestion Rule**

| PROACTIVE SUGGESTION RULE Jika user hanya memberi ide umum, AI wajib melengkapi dengan saran profesional. AI wajib berkata: "Berdasarkan jenis website/aplikasi ini, saya menyarankan fitur tambahan berikut..." Minimal output: \- 5 fitur P0 \- 5 fitur P1 \- 5 fitur P2 \- 3 fitur yang sebaiknya ditunda \- alasan bisnis/UX untuk tiap fitur penting |
| :---- |

**B3. Suggestion Before Coding Rule**

AI tidak boleh mulai coding sebelum memberikan Feature Suggestion Report.

User wajib memilih fitur yang masuk MVP.

AI wajib mengunci MVP Scope.

User mengetik LOCK MVP sebelum development dimulai.

**B4. Feature Suggestion Report Format**

| Kategori | Isi Wajib |
| :---- | :---- |
| Core MVP Features | Fitur minimal agar produk dapat dipakai dan diluncurkan. |
| Recommended Professional Features | Fitur yang membuat website/aplikasi terlihat lebih matang. |
| Conversion Features | CTA, lead form, WhatsApp, booking, trial, checkout, atau funnel. |
| Trust-Building Features | Testimoni, portfolio, logo client, sertifikasi, FAQ, case study. |
| SEO / Content Features | Blog, landing pages, metadata, FAQ schema, internal linking. |
| Automation Features | Email notification, auto-reply, CRM, export data. |
| AI-Powered Features | Chatbot, recommendation, content helper jika relevan. |
| Admin / Operation Features | Dashboard admin, data management, user management. |
| Future Growth Features | Fitur skala lanjutan untuk fase 2/3. |
| Features to Avoid for Now | Fitur yang terlalu mahal, kompleks, atau belum dibutuhkan. |

**B5. Feature Opportunity Matrix**

| Fitur | Tujuan | Dampak Bisnis | Effort | Prioritas | Masuk MVP? |
| :---- | :---- | :---- | :---- | :---- | :---- |
| WhatsApp CTA | Memudahkan lead | High | Low | P0 | Ya |
| Before-After Gallery | Membangun trust visual | High | Medium | P0/P1 | Tergantung project |
| Blog SEO | Traffic organik | Medium | Medium | P1 | Nanti |
| AI Chatbot | Support otomatis | Medium | High | P2 | Tidak dulu |
| Payment Gateway | Transaksi online | High | High | P2 | Tunda jika MVP jasa |

**B6. AI Must Recommend, Not Just Ask**

AI tidak boleh hanya bertanya “fitur apa yang Anda mau?”. AI wajib memberi rekomendasi berdasarkan jenis bisnis, target user, tujuan website, standar industri, conversion best practice, SEO opportunity, operational efficiency, dan future scalability.

| SUGGEST FEATURE COMMAND Gunakan command ini jika AI lupa memberi saran fitur: SUGGEST FEATURE. Berikan rekomendasi fitur untuk project ini berdasarkan jenis bisnis, target user, tujuan konversi, SEO, trust building, operasi bisnis, dan peluang AI. Pisahkan menjadi P0, P1, P2, dan fitur yang sebaiknya ditunda. |
| :---- |

**C. PAGE BLUEPRINT, SECTION GENERATOR & PAGE-BY-PAGE CONTROL**

**C1. Page Blueprint System**

AI wajib membuat blueprint halaman sebelum coding. Blueprint mencegah halaman kosong, section generik, dan desain tanpa arah.

| Elemen Blueprint | Penjelasan |
| :---- | :---- |
| Page Purpose | Tujuan utama halaman. |
| Target User Intent | Apa yang dicari user saat membuka halaman ini. |
| Conversion Goal | Aksi utama yang diharapkan. |
| Section List | Daftar section berurutan. |
| Section Purpose | Tujuan tiap section. |
| Content Direction | Arah copywriting. |
| CTA Strategy | CTA utama dan sekunder. |
| Visual Hierarchy | Prioritas visual dan layout. |
| Responsive Plan | Perubahan layout di mobile/tablet. |
| SEO Intent | Target keyword/search intent. |

**C2. Page Section Generator**

| SECTION DETAIL FORMAT Section Name: \[contoh: Hero Section\] Purpose: Menjelaskan value utama dalam 5 detik pertama. Content: \- Eyebrow text \- Headline \- Subheadline \- Primary CTA \- Secondary CTA \- Trust indicator Visual: \- Layout split 2 kolom \- Background gradient soft \- Badge floating / visual card / illustration Animation: \- Headline fade up \- CTA hover lift \- Visual floating subtle Responsive: \- Mobile stack vertical \- CTA full width \- Spacing disesuaikan |
| :---- |

**C3. Page-by-Page Execution Rule**

AI hanya boleh mengerjakan 1 halaman dalam satu waktu.

AI wajib membuat Page Blueprint terlebih dahulu.

User approval: LOCK PAGE BLUEPRINT.

AI implement page sesuai blueprint.

AI test page dan polish page.

User approval: LOCK PAGE.

Baru lanjut ke halaman berikutnya.

**C4. Missing Details Auto-Fill Rule**

Jika user belum memberi detail halaman, AI tidak boleh berhenti. AI wajib membuat usulan profesional berdasarkan jenis bisnis, target user, tujuan halaman, standar website modern, conversion best practice, dan SEO best practice. Namun AI tetap wajib meminta approval sebelum coding.

**C5. Section Minimum Requirement per Page Type**

| Page Type | Minimum Sections |
| :---- | :---- |
| Home Page | Navbar, Hero, Trust Indicator, Problem, Services Overview, Why Choose Us, Portfolio/Proof, Process, Testimonial, FAQ, Final CTA, Footer |
| About Page | Hero, Story, Mission/Vision, Values, Team/Founder, Trust Proof, CTA |
| Service Page | Hero Service, Service Explanation, Benefits, Process, Deliverables, Pricing/Estimate Note, FAQ, CTA |
| Portfolio Page | Hero, Filter/Category, Project Cards, Case Study Highlights, Before-After if relevant, CTA |
| Contact Page | Contact Hero, Contact Options, Form/WhatsApp, Business Hours, Location/Map if relevant, FAQ, Trust Note |
| Pricing Page | Hero, Pricing Cards, Feature Comparison, FAQ, Guarantee/Risk Reducer, CTA |
| Blog/Article Page | SEO Header, Author/Date, TOC if long, Article Body, Related Posts, CTA |

**C6. Page Completion Gate**

Semua section dari blueprint sudah dibuat.

Copywriting tidak kosong.

CTA berfungsi.

Layout desktop rapi.

Layout tablet rapi.

Layout mobile rapi.

Animasi tidak berlebihan.

SEO metadata ada.

Heading structure benar.

Image alt text ada.

Tidak ada placeholder mentah.

Tidak ada broken component.

Tidak ada console error.

**C7. LOCK PAGE Commands**

| Command | Arti |
| :---- | :---- |
| LOCK PAGE BLUEPRINT | Blueprint halaman sudah disetujui, AI boleh coding halaman. |
| REVISE PAGE BLUEPRINT | Blueprint halaman harus direvisi dulu. |
| LOCK PAGE | Halaman sudah selesai dan boleh lanjut ke halaman berikutnya. |
| REVISE PAGE | Halaman belum sesuai dan perlu diperbaiki. |
| TEST PAGE | AI harus memberi langkah testing manual khusus halaman. |

**D. PREMIUM UI/UX, STORYTELLING, COPYWRITING & MOTION CONTROL**

**D1. Premium UI/UX Creative Director Mode**

AI wajib bertindak sebagai Creative Director, UX Strategist, Conversion Copywriter, Interaction Designer, Page Architect, dan Visual QA sebelum coding UI.

Tampilan tidak boleh template generik.

Spacing harus lega dan konsisten.

Typography harus punya hierarchy kuat.

CTA harus prominent.

Section harus punya storytelling.

Animasi harus halus dan punya tujuan UX.

Mobile experience dipikirkan dari awal.

Empty state, error state, dan loading state harus dirancang.

**D2. Style Direction Options**

AI wajib memberi minimal 3 opsi style direction sebelum UI dikunci.

| Option | Cocok Untuk | Ciri Visual |
| :---- | :---- | :---- |
| A. Corporate Premium | Jasa profesional, legal, konstruksi, konsultan | Clean, trustful, navy/white, grid rapi, CTA jelas |
| B. Modern Startup | SaaS, aplikasi digital, tech product | Bold typography, gradient subtle, card modern, motion halus |
| C. Luxury Editorial | Premium service, interior, fashion, hospitality | Whitespace besar, serif/display font, visual editorial, aksen gold |
| D. Friendly Local Business | UMKM, sekolah, kursus, jasa lokal | Warm, approachable, rounded UI, ilustrasi ringan |

**D3. Website Storytelling Framework**

| WEBSITE STORYTELLING FLOW 1\. Hook: tangkap perhatian dalam 5 detik. 2\. Problem: jelaskan masalah user. 3\. Agitate: tunjukkan risiko jika masalah dibiarkan. 4\. Solution: perkenalkan produk/jasa sebagai solusi. 5\. Proof: tampilkan bukti, portfolio, testimoni, data. 6\. Process: jelaskan cara kerja agar user merasa aman. 7\. Offer: jelaskan layanan/paket/value. 8\. Objection Handling: jawab keraguan lewat FAQ/trust notes. 9\. CTA: ajak user melakukan tindakan. |
| :---- |

**D4. Professional Copywriting Mode**

AI wajib membuat copywriting per section sebelum coding.

Copywriting harus jelas, tidak generik, sesuai target user, dan punya benefit nyata.

AI wajib membuat headline, subheadline, CTA, benefit bullets, FAQ, microcopy form, error message, dan empty state jika relevan.

| COPY BLOCK FORMAT Headline: \[headline utama\] Subheadline: \[penjelasan singkat yang memperkuat value\] CTA: \[tombol utama\] Benefit Bullets: \- \[benefit 1\] \- \[benefit 2\] \- \[benefit 3\] Microcopy: \[teks kecil untuk membantu user mengambil aksi\] |
| :---- |

**D5. Component Design Specification**

| Component | Spec Wajib |
| :---- | :---- |
| Button | Height 48-56px, radius konsisten, hover/focus state, label jelas, mobile full width jika di hero. |
| Card | Padding lega, hierarchy jelas, hover state subtle, tidak kosong. |
| Navbar | Logo, menu, CTA, sticky behavior jika relevan, mobile menu rapi. |
| Footer | Kontak, link penting, CTA sekunder, legal links, social links jika relevan. |
| Form | Label jelas, validation, error state, success state, loading state. |
| FAQ Accordion | Keyboard accessible, jawaban ringkas, mendukung SEO/FAQ. |
| Testimonial Card | Nama, konteks, quote, rating/logo jika relevan. |
| Pricing Card | Harga, benefit, CTA, highlight recommended plan jika relevan. |

**D6. Motion & Animation System**

Animation harus halus, cepat, tidak mengganggu, dan punya tujuan UX.

Gunakan page load fade/slide ringan, scroll reveal secukupnya, hover interaction subtle.

Mobile animation harus ringan.

Wajib menghormati prefers-reduced-motion.

Jangan membuat animasi berlebihan yang menurunkan performance.

**D7. Conversion & Business Layer**

| Layer | Yang Harus Ditentukan |
| :---- | :---- |
| Primary Conversion Goal | Aksi utama: WhatsApp, submit form, sign up, booking, checkout. |
| Secondary Conversion Goal | Aksi pendukung: lihat portfolio, baca case study, download brochure. |
| CTA Mapping | CTA per section dan tujuannya. |
| Lead Capture Strategy | Form, WhatsApp, newsletter, free consultation. |
| Trust Placement | Testimonial, logo, sertifikat, case study ditempatkan strategis. |
| Objection Handling | FAQ, guarantee, process, transparency notes. |
| Analytics Event | Event untuk CTA utama: whatsapp\_clicked, form\_submitted, booking\_started. |

**D8. Design QA / UI Polish Pass**

Spacing audit.

Typography audit.

Color contrast audit.

Alignment audit.

Mobile audit.

CTA visibility audit.

Section rhythm audit.

Visual consistency audit.

Animation subtlety audit.

Accessibility quick check.

**D9. Reference-Based Quality Calibration**

AI wajib menjelaskan standar kualitas visual yang dipakai, tanpa meniru persis brand tertentu. Contoh standar: premium SaaS, award-style agency, luxury service, modern fintech, education platform, enterprise dashboard, local business premium.

**E. NO BLANK PAGE, CONTENT COMPLETENESS & VISUAL QA**

**E1. No Blank Page Rule**

AI dilarang membuat halaman kosong, layout kosong, section kosong, atau placeholder mentah.

Setiap halaman wajib memiliki konten nyata atau draft copywriting yang layak tampil.

Setiap halaman wajib memiliki minimal section sesuai Page Blueprint.

Setiap halaman wajib memiliki CTA yang jelas.

Setiap halaman wajib memiliki visual treatment.

Setiap halaman wajib responsive.

Setiap halaman wajib memiliki SEO metadata.

Tidak boleh ada teks lorem ipsum, TODO, coming soon, placeholder, dummy text kecuali diminta user.

**E2. Visual Completeness Gate**

Halaman terlihat penuh dan niat.

Tidak ada area kosong yang tidak disengaja.

Tidak ada section setengah jadi.

Tidak ada card kosong.

Tidak ada button tanpa fungsi.

Tidak ada gambar rusak.

Tidak ada copywriting mentah.

Tidak ada komponen yang cuma skeleton.

Semua section punya tujuan jelas.

Tampilan mobile tetap rapi.

**E3. Real Content First Rule**

| REAL CONTENT FIRST RULE Urutan wajib sebelum coding halaman: 1\. Buat page objective. 2\. Buat section structure. 3\. Buat copywriting per section. 4\. Buat CTA per section. 5\. Buat visual direction. 6\. Baru coding. AI dilarang coding dulu lalu mengisi konten belakangan. |
| :---- |

**E4. Anti-Placeholder Rule**

Tidak boleh meninggalkan Lorem ipsum.

Tidak boleh meninggalkan TODO.

Tidak boleh meninggalkan Coming soon.

Tidak boleh meninggalkan placeholder image tanpa alasan.

Tidak boleh ada empty card/empty section.

Tidak boleh ada button tanpa link/action.

Tidak boleh ada form tanpa behavior.

Jika data asli belum tersedia, AI wajib membuat draft content profesional yang bisa direvisi user.

**E5. Premium Seed Content Rule**

Jika data asli belum tersedia, AI wajib membuat seed content profesional agar halaman terlihat hidup. Seed content harus relevan dengan jenis bisnis dan mudah diganti user nanti.

Layanan/benefit sample.

Testimonial sample.

FAQ sample.

Portfolio sample.

Process steps.

Trust badges.

Pricing sample jika relevan.

Case study placeholder yang profesional.

**E6. Design Density Rule**

AI wajib menjaga keseimbangan: tidak terlalu kosong, tidak terlalu padat, setiap section punya breathing space, above the fold jelas, dan mobile tidak berisi whitespace panjang yang tidak perlu.

**E7. Above The Fold Gate**

Dalam 5 detik pertama user harus paham website ini tentang apa.

User harus paham untuk siapa website ini dibuat.

User harus paham manfaat utamanya.

User melihat trust indicator awal.

User melihat tombol tindakan utama.

**E8. CTA Functionality Gate**

Setiap CTA punya label jelas.

Setiap CTA punya tujuan jelas.

Setiap CTA bisa diklik.

CTA mengarah ke halaman, section, WhatsApp, form, booking, checkout, atau action yang benar.

CTA dilacak sebagai analytics event jika analytics aktif.

**E9. Content Quality Gate**

Copywriting jelas.

Tidak generik.

Sesuai target user.

Punya benefit nyata.

Tidak terlalu panjang.

Tidak terlalu kaku.

Punya CTA.

Tidak memakai jargon berlebihan.

**E10. Ask Less, Propose More Rule**

Jika detail belum diberikan user, AI tidak boleh berhenti terlalu cepat. AI wajib mengusulkan 2-3 opsi profesional berdasarkan konteks project. AI boleh bertanya hanya untuk keputusan penting. Untuk detail umum, AI harus membuat rekomendasi terbaik lalu minta approval.

**E11. Browser Visual QA Rule**

Setelah implementasi halaman, AI wajib menjalankan project lokal jika environment mendukung.

AI wajib membuka halaman di browser.

AI wajib cek tampilan desktop.

AI wajib cek tampilan mobile/responsive.

AI wajib catat masalah visual.

AI wajib memperbaiki masalah utama sebelum minta approval user.

**E12. Page Screenshot Evidence**

Jika tool mendukung screenshot/preview, AI wajib memberikan bukti visual atau ringkasan visual: tampilan desktop, tampilan mobile, masalah yang ditemukan, apa yang sudah diperbaiki, dan apa yang masih perlu review user.

**E13. Implementation Scope Lock**

| IMPLEMENTATION SCOPE LOCK Sebelum coding, AI wajib menampilkan: 1\. Halaman/fitur yang akan dikerjakan sekarang. 2\. Yang tidak akan dikerjakan sekarang. 3\. File yang akan disentuh. 4\. Definition of Done. 5\. Risiko/asumsi. 6\. Approval yang dibutuhkan. AI tidak boleh melebar ke halaman/fitur lain tanpa approval. |
| :---- |

**F. RECOVERY, REPAIR & AUDIT PROMPTS**

**F1. Project Recovery Mode**

Gunakan jika project sudah dibuat tapi hasilnya tidak sesuai, banyak fitur setengah jadi, halaman kosong, atau AI sebelumnya bekerja terlalu melebar.

AI wajib audit semua halaman.

AI wajib deteksi halaman kosong/setengah jadi.

AI wajib deteksi fitur broken.

AI wajib deteksi placeholder.

AI wajib deteksi komponen tidak terpakai.

AI wajib membuat recovery plan.

AI wajib prioritaskan halaman Home dulu.

AI tidak boleh tambah fitur baru sampai halaman utama selesai.

**F2. Project Recovery Prompt**

| Aktifkan PROJECT RECOVERY MODE. Audit project ini. Cari halaman kosong, fitur setengah jadi, placeholder, tombol tidak berfungsi, section kosong, UI yang belum rapi, dan komponen yang tidak terpakai. Jangan coding dulu. Berikan laporan: 1\. Apa yang sudah selesai. 2\. Apa yang belum selesai. 3\. Apa yang rusak. 4\. Halaman mana yang harus diperbaiki dulu. 5\. Rencana recovery step-by-step. 6\. Fitur/halaman yang tidak boleh ditambah dulu. Tunggu approval LOCK RECOVERY sebelum memperbaiki. |
| :---- |

**F3. UI/UX Repair Prompt**

| Audit halaman \[NAMA HALAMAN\] yang sudah dibuat. Cari: 1\. section kosong 2\. copywriting lemah 3\. spacing buruk 4\. CTA tidak jelas 5\. mobile issue 6\. animasi berlebihan 7\. fitur belum selesai 8\. placeholder/dummy text 9\. visual hierarchy lemah Jangan coding dulu. Berikan laporan dan rencana perbaikan. |
| :---- |

**F4. Page Repair Prompt**

| LOCK PAGE REPAIR. Perbaiki hanya halaman: \[NAMA HALAMAN\]. Jangan ubah halaman lain kecuali ada komponen shared yang wajib diperbaiki. Prioritas: 1\. Hilangkan blank/empty section. 2\. Lengkapi copywriting. 3\. Perbaiki layout desktop/mobile. 4\. Pastikan CTA berfungsi. 5\. Tambahkan SEO metadata. 6\. Jalankan visual QA. Setelah selesai, tampilkan checklist Page Completion Gate. |
| :---- |

**F5. Codebase Audit Prompt**

| Audit codebase ini tanpa coding dulu. Cari: 1\. file/komponen tidak terpakai 2\. route kosong 3\. broken imports 4\. fitur setengah jadi 5\. TODO/lorem ipsum/placeholder 6\. tombol tanpa fungsi 7\. form tanpa submit behavior 8\. page tanpa SEO metadata 9\. masalah responsive utama 10\. potensi error build Berikan laporan prioritas P0/P1/P2 dan rekomendasi urutan perbaikan. |
| :---- |

**F6. Incomplete Work Recovery Prompt**

| Aktifkan INCOMPLETE WORK RECOVERY. Tujuan: menyelesaikan pekerjaan yang sudah dimulai, bukan menambah fitur baru. Langkah: 1\. Baca Unfinished Feature Tracker. 2\. Pilih fitur P0 yang belum DONE. 3\. Tampilkan Definition of Done. 4\. Perbaiki hanya fitur itu. 5\. Test fitur. 6\. Update tracker. 7\. Minta user mengetik LOCK FEATURE. |
| :---- |

**G. MASTER EXECUTION COMMANDS — FINAL**

| Command | Fungsi |
| :---- | :---- |
| LOCK | Setuju lanjut fase berikutnya. |
| REVISE | Revisi hasil fase/keputusan. |
| EXPLAIN | Jelaskan lebih sederhana. |
| DETAIL | Jabarkan lebih detail. |
| TEST | Berikan langkah testing manual. |
| LOCK MVP | MVP scope disetujui, boleh lanjut development. |
| SUGGEST FEATURE | AI wajib memberikan rekomendasi fitur. |
| LOCK FEATURE | Fitur selesai dan boleh lanjut fitur berikutnya. |
| LOCK PAGE BLUEPRINT | Blueprint halaman disetujui, boleh coding halaman. |
| LOCK PAGE | Halaman selesai dan boleh lanjut halaman berikutnya. |
| LOCK UI | Style direction UI disetujui. |
| AUDIT FIRST | Audit project dulu, jangan coding. |
| LOCK RECOVERY | Setuju menjalankan recovery plan. |
| LOCK DEPLOY | Setuju deploy/live setelah checklist pass. |
| ABORT | Hentikan proses. |

**H. FINAL AI CODING AGENT STARTER PROMPT**

| Baca AGENTS.md dan MASTER\_PIPELINE.md. Aktifkan mode berikut: 1\. SOLO NEWBIE OWNER MODE 2\. STRICT MVP EXECUTION MODE 3\. MANDATORY FEATURE SUGGESTION ENGINE 4\. PREMIUM UI/UX CREATIVE DIRECTOR MODE 5\. NO BLANK PAGE RULE 6\. PAGE-BY-PAGE EXECUTION RULE Saya masih pemula. Jangan coding dulu. Jangan install package dulu. Jangan deploy dulu. Mulai dari Fase 0\. Tanyakan setup project satu per satu. Setelah saya menjawab, buat: 1\. Project Context 2\. Feature Suggestion Report 3\. MVP Scope P0/P1/P2 4\. Style Direction Options 5\. Page Blueprint awal untuk Home Page Jangan lanjut sebelum saya memilih dan mengetik LOCK MVP atau REVISE MVP. |
| :---- |

**I. FINAL MASTER CHECKLIST ADDITION**

| Area | Checklist Tambahan | Status |
| :---- | :---- | :---- |
| Feature Execution | Strict MVP Execution Mode aktif | \[ \] |
| Feature Execution | Unfinished Feature Tracker dibuat | \[ \] |
| Feature Execution | Setiap fitur punya Definition of Done | \[ \] |
| R\&D | Feature Suggestion Report dibuat sebelum coding | \[ \] |
| R\&D | MVP dikunci dengan LOCK MVP | \[ \] |
| Page Planning | Page Blueprint dibuat sebelum coding halaman | \[ \] |
| Page Planning | User memberi LOCK PAGE BLUEPRINT | \[ \] |
| UI/UX | Style Direction Options diberikan | \[ \] |
| UI/UX | Copywriting per section dibuat | \[ \] |
| Content | No Blank Page Rule pass | \[ \] |
| Content | Anti-Placeholder Rule pass | \[ \] |
| Visual QA | Visual Completeness Gate pass | \[ \] |
| Visual QA | Desktop/mobile QA dilakukan | \[ \] |
| Conversion | CTA Functionality Gate pass | \[ \] |
| Recovery | Project Recovery Mode tersedia jika hasil tidak sesuai | \[ \] |
| Approval | Setiap fitur dikunci dengan LOCK FEATURE | \[ \] |
| Approval | Setiap halaman dikunci dengan LOCK PAGE | \[ \] |

*Catatan final: Addendum ini dibuat agar AI coding agent tidak hanya membuat struktur file, tetapi juga benar-benar menyelesaikan fitur, mengisi halaman dengan konten yang layak, memberi saran fitur, menjaga kualitas UI/UX premium, dan selalu meminta approval user sebelum lanjut.*

**J. FINAL COMPLETION PATCH — MOTION, CONVERSION & CREATIVITY**

Bagian ini melengkapi daftar 42 kontrol agent-proof agar AI coding agent tidak hanya membuat halaman yang berjalan secara teknis, tetapi juga punya motion yang profesional, tujuan konversi yang jelas, dan kreativitas yang aktif sebelum coding.

**J1. Motion & Animation System**

Tujuan: memastikan animasi website terasa premium, halus, cepat, dan membantu UX. AI tidak boleh membuat animasi berlebihan, random, berat, atau mengganggu aksesibilitas.

**MOTION RULES:** 

• AI wajib membuat motion direction sebelum coding halaman premium.

• Setiap animasi harus punya tujuan UX: menarik perhatian, memberi feedback, memperjelas transisi, atau meningkatkan affordance.

• Animasi harus subtle, cepat, dan tidak mengganggu fokus user.

• Gunakan durasi wajar: 150-300ms untuk interaction, 300-600ms untuk page/section reveal.

• Gunakan easing yang smooth, bukan linear kaku.

• Hover effect wajib terasa profesional: slight lift, shadow soft, underline motion, atau color transition.

• Scroll reveal boleh digunakan, tetapi tidak boleh membuat konten terasa lambat muncul.

• Navbar/mobile menu wajib punya transisi yang jelas dan tidak patah.

• Loading state, empty state, dan error state harus punya micro-interaction bila relevan.

• Wajib menghormati prefers-reduced-motion: animasi harus bisa dikurangi/dimatikan untuk user yang sensitif terhadap motion.

| Area | Motion Direction | Catatan Implementasi |
| :---- | :---- | :---- |
| Page Load | Fade-up ringan untuk hero headline, CTA, dan visual utama. | Jangan delay terlalu panjang. Konten utama harus cepat terlihat. |
| Scroll Reveal | Section muncul bertahap dengan opacity \+ translate kecil. | Gunakan seperlunya; jangan semua elemen dianimasikan berlebihan. |
| CTA Button | Hover slight lift \+ shadow soft \+ transition warna. | CTA harus tetap jelas dan accessible. |
| Cards | Hover elevation, border highlight, atau image scale sangat halus. | Jangan membuat layout bergeser. |
| Navbar | Sticky shadow muncul saat scroll; mobile menu slide/fade. | Pastikan keyboard dan screen reader tetap aman. |
| Forms | Focus ring, validation feedback, loading spinner kecil. | Error harus jelas, bukan hanya warna. |
| Reduced Motion | Disable reveal/large movement jika user memilih reduced motion. | Gunakan CSS media query prefers-reduced-motion. |

**PROMPT:** Sebelum coding halaman ini, buat Motion & Animation System: page load, scroll reveal, hover state, CTA interaction, card interaction, navbar behavior, form feedback, dan reduced-motion strategy. Jangan coding sebelum motion direction saya approve dengan LOCK MOTION.

**LOCK MOTION \=** motion direction disetujui dan boleh diterapkan pada halaman.

**J2. Conversion & Business Layer**

Tujuan: memastikan website tidak hanya terlihat bagus, tetapi juga membantu bisnis mendapatkan lead, order, pendaftaran, konsultasi, atau aksi utama lain.

AI wajib menentukan conversion layer sebelum halaman dikunci. Untuk setiap halaman utama, AI wajib menjelaskan:

• Primary conversion goal: aksi utama yang paling penting.

• Secondary conversion goal: aksi alternatif jika user belum siap melakukan aksi utama.

• CTA mapping: tombol mana mengarah ke aksi apa.

• Trust element placement: testimoni, logo, sertifikasi, angka, portfolio, garansi, atau bukti sosial.

• Objection handling: bagian yang menjawab keraguan user.

• Lead capture strategy: WhatsApp, form, booking, newsletter, free consultation, atau download asset.

• Analytics event plan: event apa yang perlu dilacak.

• Conversion friction audit: hal apa yang membuat user batal klik/daftar/order.

• Business priority: fitur mana yang berdampak langsung ke revenue atau lead.

| Elemen | Pertanyaan yang Harus Dijawab AI | Contoh |
| :---- | :---- | :---- |
| Primary CTA | Apa aksi utama yang harus dilakukan user? | Konsultasi via WhatsApp, daftar akun, request demo, beli produk. |
| Secondary CTA | Apa aksi aman untuk user yang belum siap? | Lihat portfolio, baca studi kasus, cek pricing, lihat FAQ. |
| Trust Proof | Bukti apa yang membuat user percaya? | Testimoni, project selesai, rating, client logo, before-after. |
| Objection Handling | Keraguan apa yang perlu dijawab? | Harga, durasi, keamanan, garansi, proses, kualitas. |
| Lead Capture | Bagaimana data/prospek dikumpulkan? | Form singkat, WhatsApp prefilled message, booking form. |
| Analytics | Event apa yang harus dicatat? | whatsapp\_clicked, form\_submitted, pricing\_viewed, portfolio\_viewed. |

**CONVERSION GATE:** 

• Setiap halaman wajib punya minimal satu primary CTA yang jelas.

• CTA utama harus terlihat di above-the-fold atau mudah ditemukan.

• Setiap CTA harus memiliki tujuan/action yang benar.

• User tidak boleh bingung harus klik apa setelah membaca section.

• Setiap halaman penting harus punya trust element dan objection handling jika relevan.

• Jika analytics aktif, CTA penting wajib punya event tracking plan.

**PROMPT:** Buat Conversion & Business Layer untuk halaman ini sebelum coding. Tentukan primary CTA, secondary CTA, trust proof, objection handling, lead capture strategy, dan analytics event plan. Jangan coding sebelum saya mengetik LOCK CONVERSION.

**LOCK CONVERSION \=** conversion strategy disetujui dan boleh diterapkan pada halaman.

**J3. AI Creativity Requirement**

Tujuan: mencegah AI menjadi pasif, hanya bertanya, atau hanya membuat template kosong. AI wajib proaktif memberi ide profesional berdasarkan konteks project.

**CREATIVITY RULES:** 

• AI wajib memberi minimal 3 opsi style direction sebelum desain dikunci.

• AI wajib memberi minimal 3 opsi struktur halaman jika detail halaman belum lengkap.

• AI wajib memberi minimal 5 ide section profesional untuk halaman utama.

• AI wajib memberi rekomendasi fitur P0/P1/P2 sebelum MVP dikunci.

• AI wajib memberi saran CTA, trust element, dan conversion improvement.

• AI wajib memberi ide animasi/micro-interaction yang relevan, bukan animasi random.

• AI wajib mengisi detail kosong dengan rekomendasi profesional, lalu meminta approval.

• AI tidak boleh berhenti hanya karena user belum memberi semua detail kecil.

• AI tidak boleh memakai generic template tanpa alasan desain dan bisnis yang jelas.

• AI wajib menjelaskan kenapa rekomendasi tersebut cocok untuk jenis bisnis/user target.

| Situasi | AI Wajib Melakukan | Output Minimum |
| :---- | :---- | :---- |
| User hanya memberi ide umum | AI mengusulkan fitur, halaman, style, dan struktur MVP. | 3 opsi style \+ P0/P1/P2 fitur \+ page list. |
| Detail halaman belum lengkap | AI membuat Page Blueprint profesional. | Goal, sections, copy direction, CTA, visual, SEO. |
| UI terlihat generik | AI melakukan creative polish pass. | Masalah visual \+ rekomendasi perbaikan \+ action plan. |
| Konten belum diberikan | AI membuat draft content berkualitas. | Headline, subheadline, benefit, FAQ, CTA, testimonial sample. |
| Fitur belum jelas | AI membuat Feature Opportunity Matrix. | Tujuan, impact, effort, priority, MVP decision. |

**CREATIVITY GATE:** 

• AI sudah memberi opsi, bukan hanya bertanya.

• AI sudah memberi rekomendasi berdasarkan bisnis dan target user.

• AI sudah menjelaskan alasan rekomendasi.

• AI sudah memisahkan ide wajib sekarang vs bisa nanti.

• AI sudah meminta approval user sebelum coding.

**PROMPT:** Aktifkan AI Creativity Requirement. Sebelum coding, berikan 3 opsi style direction, 3 opsi struktur halaman, minimal 5 ide section, saran CTA, trust element, fitur P0/P1/P2, dan rekomendasi mana yang paling cocok. Jangan coding sebelum saya memilih dan mengetik LOCK CREATIVE.

**LOCK CREATIVE \=** arah kreatif disetujui dan boleh dipakai sebagai dasar Page Blueprint/UI.

**J4. Updated 42-Item Agent-Proof Checklist Confirmation**

Checklist berikut menjadi daftar kontrol final yang harus dikenali AI coding agent. Jika user bertanya apakah semua item sudah masuk, AI wajib melakukan pengecekan terhadap daftar ini.

**1\.** Strict MVP Execution Mode

**2\.** One Feature at a Time Rule

**3\.** Feature Completion Gate

**4\.** Unfinished Feature Tracker

**5\.** LOCK FEATURE Approval

**6\.** Audit Existing Project Prompt

**7\.** Fix Unfinished Feature Prompt

**8\.** Page Blueprint System

**9\.** Page Section Generator

**10\.** Page-by-Page Execution Rule

**11\.** LOCK PAGE BLUEPRINT Approval

**12\.** Page Completion Gate

**13\.** Missing Details Auto-Fill Rule

**14\.** Premium UI/UX Creative Director Mode

**15\.** Style Direction Options

**16\.** Website Storytelling Framework

**17\.** Professional Copywriting Mode

**18\.** Component Design Specification

**19\.** Motion & Animation System

**20\.** Conversion & Business Layer

**21\.** Design QA / UI Polish Pass

**22\.** AI Creativity Requirement

**23\.** Reference-Based Quality Calibration

**24\.** UI/UX Repair Prompt

**25\.** Page Repair Prompt

**26\.** Incomplete Work Recovery Prompt

**27\.** Codebase Audit Prompt

**28\.** No Blank Page Rule

**29\.** Visual Completeness Gate

**30\.** Real Content First Rule

**31\.** Anti-Placeholder Rule

**32\.** Browser Visual QA Rule

**33\.** Page Screenshot Evidence

**34\.** Premium Seed Content Rule

**35\.** Section Minimum Requirement per Page Type

**36\.** Design Density Rule

**37\.** Above The Fold Gate

**38\.** CTA Functionality Gate

**39\.** Content Quality Gate

**40\.** Ask Less, Propose More Rule

**41\.** Implementation Scope Lock

**42\.** Project Recovery Mode