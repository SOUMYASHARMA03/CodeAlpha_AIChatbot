# CloudGuard — Data Redundancy Removal System

[![CodeAlpha Cloud Computing Internship](https://img.shields.io/badge/CodeAlpha-Cloud%20Computing%20Task%201-blue.svg)](https://www.codealpha.tech)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-lightgrey.svg)](https://expressjs.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61dafb.svg)](https://vitejs.dev)
[![Tests](https://img.shields.io/badge/Tests-30%20Passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-purple.svg)]()

> **Official Task 1 Implementation for the CodeAlpha Cloud Computing Internship.**  
> Built and submitted by **Chahat Kumari** ([@chahat1409](https://github.com/chahat1409) • [chahat343435@gmail.com](mailto:chahat343435@gmail.com)) in repository: [`chahat1409/CodeAlpha_DataRedundancyRemovalSystem`](https://github.com/chahat1409/CodeAlpha_DataRedundancyRemovalSystem).

---

## 1. Problem Statement

In distributed cloud computing and cloud database architectures, data arrives continuously from web portals, mobile clients, automated ingestion workflows, and distributed microservices. Without proactive validation and deduplication:
- **Cloud Storage Inflation:** Storing identical or redundant records wastes expensive cloud storage (e.g., MongoDB Atlas, AWS DocumentDB).
- **Index Degradation:** Duplicate entries bloat B-Tree and compound indexes in RAM, leading to memory thrashing and slow read/write queries.
- **Data Inconsistency:** Divergent copies of the same entity lead to conflicting information across downstream services.
- **Analytics Distortion:** Redundant rows skew business reporting and machine learning feature stores.

---

## 2. Project Objective

**CloudGuard** is an enterprise-grade cloud data redundancy removal and validation system. It acts as an authoritative gateway before data is written into **MongoDB Atlas**:
1. **Validates & Normalizes** incoming records to strip out formatting discrepancies.
2. **Generates SHA-256 Hashes** for $O(1)$ constant-time exact duplicate detection.
3. **Applies Weighted Fuzzy Metrics** (Jaro-Winkler and Levenshtein) to identify near-duplicate typos.
4. **Intelligently Disambiguates False Positives**, ensuring people sharing the same name are correctly recognized as distinct unique entities.
5. **Appends Only Unique & Verified Records** to the cloud database while maintaining an audit trail of every intercepted duplicate.

---

## 3. CodeAlpha Task 1 Requirement Mapping

The table below maps every single requirement from the official CodeAlpha Cloud Computing Tasks & Instructions PDF directly to its implementation in CloudGuard:

| Official Task 1 Requirement (from PDF) | Implementation in CloudGuard | Architectural Component |
|---|---|---|
| **Design a system that identifies and classifies data as redundant or false positive.** | The core `deduplicationService.js` evaluates incoming entries against candidate profiles and classifies them into `UNIQUE`, `REDUNDANT_EXACT`, `REDUNDANT_SIMILAR`, `FALSE_POSITIVE`, or `INVALID`. | [`deduplicationService.js`](backend/src/services/deduplicationService.js)<br>[`similarityService.js`](backend/src/services/similarityService.js) |
| **Implement a validation mechanism to check new data against existing data.** | Dual-layer validation: client-side form validation provides real-time user feedback, while backend Express middleware and service perform authoritative checks against existing MongoDB Atlas records. | [`requestValidator.js`](backend/src/middleware/requestValidator.js)<br>[`recordController.js`](backend/src/controllers/recordController.js) |
| **Prevent duplicate data from being added into the cloud database.** | Records classified as `REDUNDANT_EXACT` or `REDUNDANT_SIMILAR` trigger an immediate `HTTP 409 Conflict`. Database write operations are halted, preventing duplicate persistence. | [`recordController.js`](backend/src/controllers/recordController.js) |
| **Append only unique and verified data entries to the database.** | Only records verified as authentic unique entities (`UNIQUE` or `FALSE_POSITIVE`) call `Record.create()` in MongoDB Atlas, annotated with SHA-256 hashes and verification metadata. | [`Record.js`](backend/src/models/Record.js)<br>[`recordController.js`](backend/src/controllers/recordController.js) |
| **Ensure database accuracy and efficiency by removing or avoiding redundancy.** | B-Tree indexes on `dataHash`, `normalizedEmail`, and `normalizedPhone` enable sub-10ms queries. Redundant writes are prevented upfront, maintaining database cleanliness and efficiency. | [`Record.js`](backend/src/models/Record.js)<br>[`statsController.js`](backend/src/controllers/statsController.js) |

---

## 4. Key Features

- **Authoritative Multi-Stage Deduplication Engine:** Canonical normalization, deterministic SHA-256 fingerprinting, and composite similarity scoring.
- **Smart False Positive Disambiguation:** Differentiates between two individuals who share the same name vs. an actual duplicate submission.
- **Interactive 1-Click Demonstration Toolbar:** Built-in scenario presets designed for live viva examinations and video recording.
- **Live Side-by-Side Comparison Inspector:** Visual modal displaying incoming payload alongside matching MongoDB record with field-level similarity radar.
- **Comprehensive Audit Trail:** Logs every validation attempt, similarity score, decision rationale, and timestamp.
- **Real-Time KPI Analytics:** Displays live counts of Total Cloud Records, Unique Entries, Blocked Duplicates, False Positives, and Redundancy Prevention Rate.
- **Production-Ready Security:** Zero hardcoded secrets, Helmet security headers, CORS origin restrictions, and sanitized error handling.
- **Cloud Database Support:** Native connection to MongoDB Atlas with diagnostic health indicators.

---

## 5. System Architecture

```mermaid
flowchart TD
    Client[React + Vite Frontend\nModern Dark Dashboard]
    API[Express REST API Gateway\nSecurity & CORS Middleware]
    Val[Input Validation Middleware\nrequestValidator.js]
    Norm[Data Normalization Service\nnormalizationService.js]
    Hash[SHA-256 Fingerprint Generator\nhashUtil.js]
    Exact[Exact Match Index Check\nO(1) dataHash Lookup]
    Candidate[Targeted Candidate Retrieval\nemail, phone, name index]
    Fuzzy[Multi-Attribute Similarity Engine\nJaro-Winkler + Levenshtein]
    Disambig{Intelligent Decision Branch}
    
    DB[(MongoDB Atlas Cloud Database\nVerified Records Collection)]
    Audit[(MongoDB Atlas Cloud Database\nValidation Audit Log Collection)]

    Client -->|POST /api/records| API
    API --> Val
    Val -->|Valid| Norm
    Val -->|Invalid| Audit
    Norm --> Hash
    Hash --> Exact
    Exact -->|Hash Matches Existing Record| Disambig
    Exact -->|No Exact Hash| Candidate
    Candidate --> Fuzzy
    Fuzzy --> Disambig

    Disambig -->|REDUNDANT_EXACT| Reject[Reject with HTTP 409\nDuplicate Blocked]
    Disambig -->|REDUNDANT_SIMILAR| Reject
    Disambig -->|FALSE_POSITIVE| Append[Append to MongoDB Atlas\nVerified Unique Entity]
    Disambig -->|UNIQUE| Append

    Append --> DB
    Append --> Audit
    Reject --> Audit
    Audit --> Client
```

---

## 6. Technology Stack

- **Frontend:**
  - React 18
  - Vite 6
  - Modern CSS (Glassmorphism, CSS Variables, Responsive Grid)
  - Lucide React (Icons)
- **Backend:**
  - Node.js (v22+)
  - Express.js
  - Mongoose ODM
  - Helmet (HTTP Security Headers)
  - CORS (Cross-Origin Policy)
  - Morgan (HTTP Request Logging)
  - Crypto (Built-in SHA-256)
- **Cloud Database:**
  - **MongoDB Atlas** (Managed Cloud Database)
- **Testing & Tooling:**
  - Jest & Supertest
  - MongoDB Memory Server (Fast isolated testing)

---

## 7. Folder Structure

```
CodeAlpha_DataRedundancyRemovalSystem/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB Atlas connection & diagnostics
│   │   ├── controllers/
│   │   │   ├── recordController.js   # Deduplication orchestration & record queries
│   │   │   ├── auditController.js    # Audit trail retrieval & clearing
│   │   │   └── statsController.js    # Real-time metrics & efficiency rates
│   │   ├── middleware/
│   │   │   ├── errorHandler.js       # Sanitized error response handler
│   │   │   └── requestValidator.js   # Input validation & schema checking
│   │   ├── models/
│   │   │   ├── Record.js             # Mongoose schema for verified cloud records
│   │   │   └── AuditLog.js           # Mongoose schema for validation audit trails
│   │   ├── routes/
│   │   │   ├── recordRoutes.js       # /api/records endpoints
│   │   │   ├── auditRoutes.js        # /api/audit endpoints
│   │   │   └── statsRoutes.js        # /api/stats endpoints
│   │   ├── services/
│   │   │   ├── deduplicationService.js # Core deduplication & classification engine
│   │   │   ├── normalizationService.js # Canonical data formatting
│   │   │   └── similarityService.js   # Weighted multi-attribute similarity
│   │   ├── utils/
│   │   │   ├── hashUtil.js           # SHA-256 cryptographic hashing
│   │   │   └── stringSimilarity.js   # Levenshtein & Jaro-Winkler algorithms
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server entry point & graceful shutdown
│   ├── tests/
│   │   ├── deduplication.test.js     # Tests for all 5 core requirements
│   │   ├── normalization.test.js     # Tests for normalization & hashing
│   │   ├── similarity.test.js        # Tests for fuzzy string algorithms
│   │   └── api.test.js               # Supertest API endpoint tests
│   ├── scripts/
│   │   └── seed.js                   # Seed script for realistic demo records
│   ├── .env.example                  # Environment template
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg               # CloudGuard shield branding
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Branding, cloud status pill & actions
│   │   │   ├── StatsOverview.jsx     # 6 KPI metric cards
│   │   │   ├── DemoScenarioBar.jsx   # 1-click test scenario presets
│   │   │   ├── AddRecordForm.jsx     # Input form with live normalization preview
│   │   │   ├── ValidationResultModal.jsx # Visual inspection & comparison modal
│   │   │   ├── RecordsTable.jsx      # Verified cloud records table with filters
│   │   │   └── AuditLogTable.jsx     # Audit trail table with classification filter
│   │   ├── services/
│   │   │   └── api.js                # Frontend REST API client
│   │   ├── styles/
│   │   │   └── index.css             # Design system & responsive styles
│   │   ├── App.jsx                   # Central dashboard layout & state
│   │   └── main.jsx                  # React application entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── package.json                      # Root coordination package
└── README.md
```

---

## 8. Deduplication & Disambiguation Algorithm

### Stage 1: Normalization
1. **Full Name:** Whitespace trimmed, multiple internal spaces collapsed to single space.
2. **Email:** Whitespace trimmed, lowercased, trailing dots removed.
3. **Phone:** Non-digit characters (`( ) - . + `) removed, formatted to raw digit sequence.

### Stage 2: Deterministic SHA-256 Hashing
A canonical string is created:
$$\text{payload} = \text{normalizedName} \mid \text{normalizedEmail} \mid \text{normalizedPhone}$$
$$\text{dataHash} = \text{SHA256}(\text{payload})$$
Because MongoDB maintains a unique B-Tree index on `dataHash`, exact duplicates are detected in **$O(1)$ constant time**.

### Stage 3: Multi-Attribute Similarity Scoring
If no exact hash match exists, candidate records matching email, phone, or name are evaluated:
- **Name Similarity ($S_{\text{name}}$):** $\max(\text{Jaro-Winkler}, \text{Levenshtein})$.
- **Email Similarity ($S_{\text{email}}$):** Domain matching + local username similarity.
- **Phone Similarity ($S_{\text{phone}}$):** Levenshtein distance on numeric digits.
- **Weighted Composite Score:**
$$\text{Score} = (0.35 \times S_{\text{email}}) + (0.30 \times S_{\text{phone}}) + (0.20 \times S_{\text{name}}) + (0.10 \times S_{\text{org}}) + (0.05 \times S_{\text{city}})$$

### Stage 4: Decision Matrix

```
┌────────────────────────┬────────────────────────────────────────────┬──────────────────┬──────────────┐
│ Classification         │ Condition                                  │ Database Action  │ HTTP Status  │
├────────────────────────┼────────────────────────────────────────────┼──────────────────┼──────────────┤
│ UNIQUE                 │ Composite score < 50%                      │ INSERTED         │ 201 Created  │
│ REDUNDANT_EXACT        │ Exact SHA-256 dataHash match               │ REJECTED         │ 409 Conflict │
│ REDUNDANT_SIMILAR      │ Name typo + identical credentials (≥ 80%)  │ REJECTED         │ 409 Conflict │
│ FALSE_POSITIVE         │ High name match (≥ 75%) + distinct creds   │ INSERTED         │ 201 Created  │
│ INVALID                │ Schema format validation failure           │ REJECTED         │ 400 Bad Req  │
└────────────────────────┴────────────────────────────────────────────┴──────────────────┴──────────────┘
```

---

## 9. Database Collections Schema

### `Record` Collection (Verified Cloud Store)
```javascript
{
  name: String,               // Display name
  email: String,              // Display email
  phone: String,              // Formatted phone
  city: String,
  organization: String,
  category: String,
  description: String,
  dataHash: String,           // SHA-256 index: true
  contactHash: String,        // SHA-256 index: true
  normalizedName: String,     // index: true
  normalizedEmail: String,    // index: true
  normalizedPhone: String,    // index: true
  validationStatus: String,   // enum: ['UNIQUE', 'FALSE_POSITIVE']
  similarityScore: Number,
  verificationNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### `AuditLog` Collection (Validation Activity)
```javascript
{
  timestamp: Date,            // index: true
  submittedData: Object,      // Raw input payload
  classification: String,     // enum: ['UNIQUE', 'REDUNDANT_EXACT', 'REDUNDANT_SIMILAR', 'FALSE_POSITIVE', 'INVALID']
  similarityScore: Number,
  action: String,             // enum: ['INSERTED', 'REJECTED']
  reason: String,
  matchedRecordId: ObjectId,  // Reference to existing record if matched
  matchedRecordSummary: Object,
  fieldBreakdown: Object,     // { nameScore, emailScore, phoneScore, orgScore, cityScore }
  dataHash: String
}
```

---

## 10. API Documentation

| Method | Endpoint | Description | Expected Status |
|---|---|---|---|
| `GET` | `/api/health` | Service health and cloud DB connection status | 200 OK |
| `GET` | `/api/stats` | Dashboard KPI metrics and redundancy prevention rate | 200 OK |
| `GET` | `/api/records` | Query verified records (search, category, status, pagination) | 200 OK |
| `GET` | `/api/records/:id` | Retrieve single record details | 200 OK |
| `POST` | `/api/records` | Submit record to deduplication engine | 201 Created / 409 Conflict / 400 Bad Req |
| `DELETE` | `/api/records/:id` | Delete a verified record | 200 OK |
| `GET` | `/api/audit` | Query validation audit history with filters | 200 OK |
| `DELETE` | `/api/audit` | Clear audit log history | 200 OK |
| `POST` | `/api/seed` | Seed database with baseline records & historical audits | 200 OK |
| `POST` | `/api/reset` | Clear all records and audit trails for fresh testing | 200 OK |

---

## 11. MongoDB Atlas Setup Guide

To connect CloudGuard to a real cloud database on **MongoDB Atlas**:

1. **Create an Account:** Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (Free M0 Cluster).
2. **Create a Database User:**
   - Go to **Security** → **Database Access**.
   - Click **Add New Database User** (e.g., username `cloudguard_user`, secure password).
   - Assign `Read and write to any database`.
3. **Configure Network Access:**
   - Go to **Security** → **Network Access**.
   - Click **Add IP Address** → select **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
4. **Retrieve Connection String:**
   - Go to **Database** → Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy your connection string (format: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/cloudguard_db?retryWrites=true&w=majority`).
5. **Add to `.env`:**
   - Open `backend/.env` and update:
     ```env
     MONGODB_URI=your_actual_mongodb_atlas_connection_string
     ```

---

## 12. Installation & Running Locally

### Prerequisites
- Node.js (v18, v20, or v22)
- npm (v9+)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/CodeAlpha_DataRedundancyRemovalSystem.git
cd CodeAlpha_DataRedundancyRemovalSystem
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Configure Environment
Copy `.env.example` to `.env` in `backend/`:
```bash
cd ../backend
cp .env.example .env
# Edit .env and enter your MongoDB Atlas URI
```

### Step 4: Run Application
In one terminal, start the Express backend:
```bash
cd backend
npm run dev
# Backend starts on http://localhost:5000
```

In a second terminal, start the Vite React frontend:
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 13. Running Automated Tests

CloudGuard includes a comprehensive test suite covering all 5 core requirements, normalization, hashing, fuzzy algorithms, and REST APIs:

```bash
cd backend
npm test
```

### Test Results
```
PASS tests/deduplication.test.js
PASS tests/api.test.js
PASS tests/normalization.test.js
PASS tests/similarity.test.js

Test Suites: 4 passed, 4 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        4.856 s
```

---

## 14. How to Demonstrate Task 1 (For Evaluators)

CloudGuard includes a dedicated **1-Click Demonstration Toolbar** directly in the UI. Follow these 5 steps to verify all requirements during an internship evaluation:

### Demo 1 — Unique Record
1. Click **"Demo 1 — Unique Record"** in the toolbar (loads *"Dr. Jane Goodall"*).
2. Click **"Verify & Append Record"**.
3. **Observed Result:**
   - Classification: `UNIQUE` (Green badge)
   - Similarity: `0%`
   - Action: `INSERTED` (Appended to MongoDB Atlas)
   - Stored in the Verified Cloud Records table.

### Demo 2 — Exact Duplicate Rejection
1. Click **"Demo 2 — Exact Duplicate"** (loads *"Dr. Sarah Connor"*, already present in baseline data).
2. Click **"Verify & Append Record"**.
3. **Observed Result:**
   - Classification: `REDUNDANT_EXACT` (Red badge)
   - Similarity: `100%`
   - Action: `REJECTED` (Write blocked, HTTP 409)
   - Explains that an identical SHA-256 fingerprint already exists in the cloud database.

### Demo 3 — Similar Typo Duplicate
1. Click **"Demo 3 — Similar Duplicate"** (loads *"Sara Connor"* with minor typo, but identical email and phone).
2. Click **"Verify & Append Record"**.
3. **Observed Result:**
   - Classification: `REDUNDANT_SIMILAR` (Orange badge)
   - Similarity: `92%`
   - Action: `REJECTED` (Write blocked)
   - Prevents typographical variants of existing records from creating redundancy.

### Demo 4 — False Positive Disambiguation
1. Click **"Demo 4 — False Positive"** (loads a new professional named *"Dr. Sarah Connor"*, but with independent email and phone credentials).
2. Click **"Verify & Append Record"**.
3. **Observed Result:**
   - Classification: `FALSE_POSITIVE` (Gold badge)
   - Action: `INSERTED` (Appended to MongoDB Atlas)
   - System confirms that although the name matches 100%, unique primary credentials verify this is a distinct entity.

### Demo 5 — Invalid Data Interception
1. Click **"Demo 5 — Invalid Data"** (loads malformed email and short phone).
2. Click **"Verify & Append Record"**.
3. **Observed Result:**
   - Classification: `INVALID` (Red badge)
   - Action: `REJECTED` (HTTP 400)
   - Intercepted before reaching the database, logged to Audit Trail.

---

## 15. Cloud Deployment Guide

### Backend Deployment (Render or Railway)
1. Push your repository to GitHub.
2. Link repository to [Render](https://render.com) or [Railway](https://railway.app).
3. Set root directory to `backend`.
4. Build command: `npm install`
5. Start command: `node src/server.js`
6. Add Environment Variable:
   - `MONGODB_URI`: your MongoDB Atlas connection string
   - `NODE_ENV`: `production`

### Frontend Deployment (Vercel or Netlify)
1. Link repository to [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Framework preset: **Vite**.
4. Configure API rewrite in `vercel.json` to proxy `/api/*` to your deployed backend URL.

---

## 16. Future Improvements

1. **Distributed Event Ingestion:** Connect to Apache Kafka or AWS SQS for high-throughput batch stream deduplication.
2. **Phonetic Encoding (Double Metaphone / Soundex):** Expand fuzzy matching with phonetic algorithms to catch cross-lingual pronunciation matches.
3. **Automated Merging Workflows:** Allow system administrators to merge duplicate records while preserving relational foreign keys.
4. **Machine Learning Distance Metric Learning:** Train supervised logistic regression models on historical audit decisions to automatically optimize field weights.

---

## 17. License & Attribution
 
This project is developed by **Chahat Kumari** ([@chahat1409](https://github.com/chahat1409) • [chahat343435@gmail.com](mailto:chahat343435@gmail.com)) as part of the **CodeAlpha Cloud Computing Internship (Task 1: Data Redundancy Removal System)**.  
Licensed under the [MIT License](LICENSE).
