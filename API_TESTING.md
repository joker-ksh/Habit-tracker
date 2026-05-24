# API Testing — Habit Tracker

Base URL: `http://localhost:5000`

> Run these curls in order. After login, replace `TOKEN` with the token from the response.
> After creating a habit, replace `HABIT_ID` with the `_id` from the response.

---

## 1. Health Check

```bash
curl http://localhost:5000/health
```

---

## 2. Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Alice Johnson\", \"email\": \"alice@example.com\", \"password\": \"secret123\"}"
```

**Duplicate email (expect 409):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Alice Again\", \"email\": \"alice@example.com\", \"password\": \"secret123\"}"
```

**Validation error (expect 400):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"\", \"email\": \"not-an-email\", \"password\": \"123\"}"
```

---

## 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"alice@example.com\", \"password\": \"secret123\"}"
```

**Wrong password (expect 401):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"alice@example.com\", \"password\": \"wrongpass\"}"
```

---

## 4. Create Habit

> Replace `TOKEN` with the token from login.

**Full payload:**
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"title\": \"Morning Run\", \"description\": \"Run 5km every morning\", \"frequency\": \"daily\", \"tags\": [\"fitness\", \"health\"], \"reminderTime\": \"06:30\"}"
```

**Minimal payload:**
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"title\": \"Read 20 Pages\", \"frequency\": \"daily\"}"
```

**Weekly habit:**
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"title\": \"Deep Clean\", \"frequency\": \"weekly\", \"tags\": [\"chores\"]}"
```

**Missing fields (expect 400):**
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"description\": \"no title or frequency\"}"
```

**Invalid frequency (expect 400):**
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"title\": \"Yoga\", \"frequency\": \"monthly\"}"
```

**Duplicate title (expect 409):**
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"title\": \"Morning Run\", \"frequency\": \"daily\"}"
```

**No token (expect 401):**
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Yoga\", \"frequency\": \"daily\"}"
```

---

## 5. Get All Habits

```bash
curl http://localhost:5000/api/habits \
  -H "Authorization: Bearer TOKEN"
```

**With pagination:**
```bash
curl "http://localhost:5000/api/habits?page=1&limit=2" \
  -H "Authorization: Bearer TOKEN"
```

**Filter by tag:**
```bash
curl "http://localhost:5000/api/habits?tag=fitness" \
  -H "Authorization: Bearer TOKEN"
```

**Pagination + tag filter:**
```bash
curl "http://localhost:5000/api/habits?tag=health&page=1&limit=5" \
  -H "Authorization: Bearer TOKEN"
```

---

## 6. Get Single Habit

> Replace `HABIT_ID` with the `_id` from the create response.

```bash
curl http://localhost:5000/api/habits/HABIT_ID \
  -H "Authorization: Bearer TOKEN"
```

**Wrong ID (expect 404):**
```bash
curl http://localhost:5000/api/habits/000000000000000000000000 \
  -H "Authorization: Bearer TOKEN"
```

**Invalid ID format (expect 400):**
```bash
curl http://localhost:5000/api/habits/not-a-valid-id \
  -H "Authorization: Bearer TOKEN"
```

---

## 7. Update Habit

```bash
curl -X PUT http://localhost:5000/api/habits/HABIT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"title\": \"Evening Run\", \"reminderTime\": \"18:00\"}"
```

**Change frequency and tags:**
```bash
curl -X PUT http://localhost:5000/api/habits/HABIT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"frequency\": \"weekly\", \"tags\": [\"fitness\", \"evening\"]}"
```

**Rename to a title that already exists (expect 409):**
```bash
curl -X PUT http://localhost:5000/api/habits/HABIT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"title\": \"Read 20 Pages\"}"
```

---

## 8. Track Habit Today

```bash
curl -X POST http://localhost:5000/api/habits/HABIT_ID/track \
  -H "Authorization: Bearer TOKEN"
```

**Same request again — duplicate (expect 409):**
```bash
curl -X POST http://localhost:5000/api/habits/HABIT_ID/track \
  -H "Authorization: Bearer TOKEN"
```

---

## 9. Get History & Streak

```bash
curl http://localhost:5000/api/habits/HABIT_ID/history \
  -H "Authorization: Bearer TOKEN"
```

---

## 10. Delete Habit

```bash
curl -X DELETE http://localhost:5000/api/habits/HABIT_ID \
  -H "Authorization: Bearer TOKEN"
```

**Delete again (expect 404):**
```bash
curl -X DELETE http://localhost:5000/api/habits/HABIT_ID \
  -H "Authorization: Bearer TOKEN"
```
