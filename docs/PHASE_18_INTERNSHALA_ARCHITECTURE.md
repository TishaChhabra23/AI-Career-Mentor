# Phase 18: Live Internshala Opportunity Integration - Pre-Implementation Architecture Audit

This document outlines the architectural research, audit findings, and target design for integrating live opportunities into Mentor.AI.

## 1. Integration Source & Authorization Status

* **Status:** **AUTHORIZED API/FEED NOT CONFIRMED**
* **Findings:** Internshala does **NOT** provide a public/open developer API, RSS feed, or official integration partnership feed for general public use. Automated collection or scraping of site content is strictly prohibited under Internshala's Terms of Service.
* **Workaround Status:** Scraping (using Puppeteer, Playwright, Cheerio, undocumented/internal endpoints, or browser automation) is **NOT IMPLEMENTED** to remain fully compliant with site terms.

---

## 2. Abstraction Design (Source Adapter)

To keep Mentor.AI independent of specific third-party structures, a provider abstraction interface is designed:

```typescript
export interface Opportunity {
  id: string;
  source: 'Internshala' | 'Local';
  sourceOpportunityId?: string;
  sourceUrl?: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'On-site' | 'Hybrid';
  stipend?: string;
  duration?: string;
  requiredSkills: string[];
  description: string;
  postedAt?: Date;
  applicationDeadline?: Date;
  fetchedAt?: Date;
}

export interface OpportunityProvider {
  getInternships(filters: any): Promise<Opportunity[]>;
  getJobs(filters: any): Promise<Opportunity[]>;
}
```

### Development Fallback (`NOT_CONFIGURED`)

Since no authorized API or feed is currently available, the default provider implementation will be set to:

```typescript
export const InternshalaProviderStatus = 'NOT_CONFIGURED';
```

When in this state:
* The backend will return an empty list or specific status flag indicating live opportunities are not connected.
* The frontend UI will display a friendly message: **"Live Internshala opportunities are not connected yet."**
* The system will **NOT** silently serve fake seed data disguised as live Internshala opportunities.

---

## 3. Data Model & Cache Strategy

### Permitted Data Fields
If an authorized integration is configured in the future, only the following non-proprietary fields will be stored:
* `source` (always `"Internshala"`)
* `sourceOpportunityId`
* `title`
* `company`
* `location`
* `workMode`
* `stipend`
* `duration`
* `requiredSkills`
* `description`
* `sourceUrl`
* `fetchedAt`

### Caching and Retention
* **Duration:** A backend cache with a maximum TTL (e.g., 1 hour) will be used to prevent aggressive upstream rate limits if permitted by the feed terms.
* **Duplicate Prevention:** Upserts will be indexed on `source` + `sourceOpportunityId`.
* **Stale Detection:** Listings older than 24 hours without updates will be marked as inactive.

---

## 4. Security & User Privacy

* **No Credential Exposure:** All API keys, partner IDs, or access tokens will remain strictly backend-only. No secrets will reach the frontend client.
* **User Isolation:** Student profile details (resumes, academic transcripts, or passwords) will **NEVER** be transmitted to the external data source during matching. Matching scores are computed deterministically inside Mentor.AI.
* **No Cookie Collection:** No Internshala session cookies or user account credentials will be requested, processed, or stored.
* **External Application Redirect:** Applications remain entirely external. Users will be explicitly notified: *"You will be redirected to Internshala to complete your application."* No submissions will be falsely claimed.

---

## 5. UI Error & State Handling

The Internship Match Center will dynamically render the following states based on the provider status:

1. **Not Configured / Unavailable State:**
   * Text: *"Live Internshala opportunities are not connected yet."* (or *"Live opportunity data is temporarily unavailable."* if down).
2. **Success State:**
   * Text: *"Live opportunities"* and *"Source: Internshala"*.
   * Timestamp: *"Last updated: [timestamp]"*.
3. **Context Redirection:**
   * Keeps the `Opportunity Context` dropdown synced with `/profile` using `localStorage` as a view-only selector.
   * Class 11 and Class 12 contexts will render education guidance and roadmaps.

---

## 6. Audit Summary & Conclusion

* **Scraping Workaround:** NOT IMPLEMENTED
* **Phase 18 Status:** **BLOCKED PENDING AUTHORIZATION/API ACCESS**
