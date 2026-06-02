# LifeLine User Acceptance Testing (UAT) Document

## Document Information
- Project Name: LifeLine
- Environment: Staging
- Created By: Group 7
- Date of Creation: June 2, 2026
- Date of Review: ____________________
- Reviewed By: ____________________

## Instructions
- This is one master UAT document with role-based sections.
- `Student` respondents answer only Student module cases.
- `Counselor` respondent answers only Counselor module cases.
- `Researcher` executes and records end-to-end queue verification cases.
- Record `Pass` or `Fail` in the `Status` column.
- If `Fail`, add a short note in `Remarks`.

## UAT Table Format
| Test Case ID | Module | Tester Type | Test Case | Pre-Condition(s) | Procedure(s) | Sample Test Data | Expected Result | Actual Result | Status | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|

---

## A. Authentication Module
| Test Case ID | Module | Tester Type | Test Case | Pre-Condition(s) | Procedure(s) | Sample Test Data | Expected Result | Actual Result | Status | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|
| AUTH-01 | Login | Student | Sign in with valid student account | User is on Login page | 1) Enter student email 2) Enter password 3) Click Sign In | `student@uic.edu` / `student123` | Student is authenticated and redirected to `/student` |  | Not tested |  |
| AUTH-02 | Login | Counselor | Sign in with valid counselor account | User is on Login page | 1) Enter counselor email 2) Enter password 3) Click Sign In | `counselor@uic.edu` / `counselor123` | Counselor is authenticated and redirected to `/counselor` |  | Not tested |  |
| AUTH-03 | Login | Student | Reject invalid password | Registered email exists | 1) Enter valid email 2) Enter wrong password 3) Click Sign In | `student@uic.edu` / `wrong123` | Login is blocked and password error is shown |  | Not tested |  |
| AUTH-04 | Register | Student | Register valid student account | User is on Register page | 1) Enter full name 2) Enter `@uic.edu` email 3) Enter password and confirm 4) Submit | `Paula Honrada`, `paula@uic.edu`, `secret123` | Account is created and redirected to `/student` |  | Not tested |  |
| AUTH-05 | Register | Student | Reject non-UIC email | User is on Register page | 1) Enter details with non-UIC email 2) Submit | `paula@gmail.com` | Registration is blocked with UIC email requirement message |  | Not tested |  |
| AUTH-06 | Register | Student | Reject counselor self-registration | User is on Register page | 1) Enter counselor-designated email 2) Submit | `counselor@uic.edu` | Registration is blocked with admin-only counselor account message |  | Not tested |  |

---

## B. Student Chat Module
| Test Case ID | Module | Tester Type | Test Case | Pre-Condition(s) | Procedure(s) | Sample Test Data | Expected Result | Actual Result | Status | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|
| STUD-01 | Student Chat | Student | Toggle Chat as Yourself vs Chat Anonymously | Student is logged in and on setup screen | 1) Toggle anonymity on/off 2) Observe helper text and options | N/A | UI text updates correctly; anonymous mode shows alias options |  | Not tested |  |
| STUD-02 | Student Chat | Student | Auto-generate anonymous identity | Anonymous mode enabled | 1) Select Auto Generate name 2) Click Begin Conversation | N/A | Session starts using generated alias format `Student#####` |  | Not tested |  |
| STUD-03 | Student Chat | Student | Use custom anonymous alias | Anonymous mode enabled | 1) Select Custom 2) Enter alias 3) Click Begin Conversation | `blue hoodie` | Session starts with entered alias (or unique-suffixed variant if duplicate) |  | Not tested |  |
| STUD-04 | Student Chat | Student | Begin conversation | Logged in at student setup screen | 1) Choose identity settings 2) Click Begin Conversation | N/A | Student enters active chat interface with no error |  | Not tested |  |
| STUD-05 | Student Chat | Student | Send low-risk message | Active chat session exists | 1) Type message 2) Click Send | `I'm feeling overwhelmed with my assignments.` | Message appears with timestamp; queue remains normal for low risk |  | Not tested |  |
| STUD-06 | Student Chat | Student | Send moderate-risk message | Active chat session exists | 1) Type message 2) Click Send | `alone ko always` | Message appears and risk updates to moderate |  | Not tested |  |
| STUD-07 | Student Chat | Student | Send high-risk message | Active chat session exists | 1) Type message 2) Click Send | `Gusto ko na mamatay` | Message appears and risk updates to high |  | Not tested |  |
| STUD-08 | Student Chat | Student | Block blank message submission | Active chat session exists | 1) Leave input empty 2) Click Send | Blank input | No message is sent |  | Not tested |  |
| STUD-09 | Student Chat | Student | Show real name from chat menu | Anonymous active session exists | 1) Open menu 2) Click Show Real Name | N/A | Display name switches from alias to real name |  | Not tested |  |
| STUD-10 | Student Chat | Student | Delete conversation | Active session exists | 1) Open menu 2) Click Delete Conversation 3) Confirm | N/A | Session is removed; student returns to setup state |  | Not tested |  |
| STUD-11 | Student Chat | Student | Display helpline panel | Active chat screen open | 1) Inspect left support sidebar | N/A | Helpline entries and Facebook links are visible and readable |  | Not tested |  |
| STUD-12 | Student Chat | Student | Log out from student side | Student is logged in | 1) Click Log out | N/A | User is logged out and redirected to Login page |  | Not tested |  |

---

## C. Counselor Dashboard Module
| Test Case ID | Module | Tester Type | Test Case | Pre-Condition(s) | Procedure(s) | Sample Test Data | Expected Result | Actual Result | Status | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|
| COUN-01 | Counselor Dashboard | Counselor | View active sessions list | Counselor logged in | 1) Open dashboard | N/A | Active sessions are listed in left panel |  | Not tested |  |
| COUN-02 | Counselor Dashboard | Counselor | Verify risk label colors | Sessions exist with different risks | 1) Inspect session cards | Low/Moderate/High sessions | Badge colors and labels match risk levels |  | Not tested |  |
| COUN-03 | Counselor Dashboard | Counselor | Verify high-risk prioritization | High-risk and non-high sessions exist | 1) Observe active queue order | Mixed risk sessions | High-risk sessions appear above normal queue |  | Not tested |  |
| COUN-04 | Counselor Dashboard | Counselor | Verify non-high normal queue order | Multiple moderate/low sessions exist | 1) Observe order among non-high entries | Moderate/low sessions | Non-high sessions preserve normal order by arrival/creation |  | Not tested |  |
| COUN-05 | Counselor Dashboard | Counselor | Open session via Respond | Active sessions exist | 1) Click Respond on one card | N/A | Conversation opens on right panel with message history |  | Not tested |  |
| COUN-06 | Counselor Dashboard | Counselor | Send counselor reply | Active selected session exists | 1) Type reply 2) Click Send | `Thank you for reaching out. I'm here to listen.` | Reply appears with timestamp in conversation |  | Not tested |  |
| COUN-07 | Counselor Dashboard | Counselor | Resolve session | Active selected session exists | 1) Click Resolve/Mark Resolved | N/A | Session leaves Active and appears in Archived |  | Not tested |  |
| COUN-08 | Counselor Dashboard | Counselor | Archive risk filter | Archived sessions exist | 1) Open Archived tab 2) Switch risk filter | `high`, `moderate`, `low` | Only matching risk sessions are shown |  | Not tested |  |
| COUN-09 | Counselor Dashboard | Counselor | Archive search filter | Archived sessions exist | 1) Enter search term | Student name, alias, or keyword | Archive list filters by matching content |  | Not tested |  |
| COUN-10 | Counselor Dashboard | Counselor | Archive date filter | Archived sessions exist | 1) Select date | Valid date value | Archive list shows entries matching selected date |  | Not tested |  |
| COUN-11 | Counselor Dashboard | Counselor | Log out from counselor side | Counselor logged in | 1) Click Logout | N/A | User is logged out and redirected to Login page |  | Not tested |  |

---

## D. End-to-End Queue Verification (Researcher-run)
| Test Case ID | Module | Tester Type | Test Case | Pre-Condition(s) | Procedure(s) | Sample Test Data | Expected Result | Actual Result | Status | Remarks |
|---|---|---|---|---|---|---|---|---|---|---|
| E2E-01 | Queue Verification | Researcher | High-risk bypass check | At least one low/moderate active session exists | 1) Send low/moderate message first 2) Send new high-risk message from another student 3) Observe counselor queue | First: `Kapoy kaayo sa school.` Then: `I want to die.` | High-risk session moves above non-high sessions |  | Not tested |  |
| E2E-02 | Queue Verification | Researcher | Moderate does not bypass high | At least one high-risk session exists | 1) Keep a high-risk session active 2) Send moderate message from another student 3) Observe order | `alone ko always` | Moderate session stays below high-risk session |  | Not tested |  |
| E2E-03 | Queue Verification | Researcher | Blank input queue safety | Active sessions exist | 1) Attempt blank message in student chat 2) Observe counselor queue | Blank input | No new message is created; queue order unchanged |  | Not tested |  |
| E2E-04 | Queue Verification | Researcher | Resolve flow end-to-end | Active session exists in dashboard | 1) Resolve active session 2) Check Active and Archived tabs | N/A | Session removed from Active and shown in Archived |  | Not tested |  |

---

## Sign-off
- Student Tester Name(s): ____________________
- Counselor Tester Name: ____________________
- Researcher/Facilitator Name(s): ____________________
- Adviser Review Notes: ____________________
