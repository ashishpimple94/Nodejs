# Search API Documentation

## Search Voters by Name
**Endpoint:** `GET /api/voters/search`

### Features
- ✅ **Auto Language Detection**: Automatically detects if search is in English or Marathi
- ✅ **Smart Results**: Returns data in the same language as the search query
- ✅ **Partial Matching**: Case-insensitive partial name matching
- ✅ **Pagination**: Supports page and limit parameters

---

## API Usage

### 1. Search in English
**Request:**
```bash
GET http://localhost:5000/api/voters/search?query=Satupte
```

**Response:**
```json
{
  "success": true,
  "message": "Found 1 records",
  "searchTerm": "Satupte",
  "searchLanguage": "English",
  "count": 1,
  "totalCount": 1,
  "currentPage": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "68fb1d12f33651b2a0c138be",
      "serialNumber": "1/74",
      "houseNumber": "",
      "name": "Satupte Anand Baburao",
      "gender": "Male",
      "age": 67,
      "voterIdCard": "WZS8120685",
      "mobileNumber": "8999236745",
      "createdAt": "2025-01-30T10:30:00.000Z",
      "updatedAt": "2025-01-30T10:30:00.000Z"
    }
  ]
}
```

---

### 2. Search in Marathi (मराठी)
**Request:**
```bash
GET http://localhost:5000/api/voters/search?query=सत्तुपे
```

**Response:**
```json
{
  "success": true,
  "message": "1 रिकॉर्ड मिले",
  "searchTerm": "सत्तुपे",
  "searchLanguage": "Marathi",
  "count": 1,
  "totalCount": 1,
  "currentPage": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "68fb1d12f33651b2a0c138be",
      "serialNumber": "1/74",
      "houseNumber": "",
      "name": "सत्तुपे आनंद बाबुराव",
      "gender": "पुरुष",
      "age": 67,
      "voterIdCard": "WZS8120685",
      "mobileNumber": "8999236745",
      "createdAt": "2025-01-30T10:30:00.000Z",
      "updatedAt": "2025-01-30T10:30:00.000Z"
    }
  ]
}
```

---

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ Yes | - | Search term (name in English or Marathi) |
| `page` | number | ❌ No | 1 | Page number for pagination |
| `limit` | number | ❌ No | 50 | Number of results per page |

---

## Examples

### Using cURL

**English Search:**
```bash
curl "http://localhost:5000/api/voters/search?query=Anand"
```

**Marathi Search:**
```bash
curl "http://localhost:5000/api/voters/search?query=आनंद"
```

**With Pagination:**
```bash
curl "http://localhost:5000/api/voters/search?query=Satupte&page=1&limit=10"
```

---

### Using JavaScript/Fetch

**English Search:**
```javascript
const searchEnglish = async () => {
  const response = await fetch(
    'http://localhost:5000/api/voters/search?query=Satupte'
  );
  const data = await response.json();
  console.log(data);
};
```

**Marathi Search:**
```javascript
const searchMarathi = async () => {
  const response = await fetch(
    'http://localhost:5000/api/voters/search?query=सत्तुपे'
  );
  const data = await response.json();
  console.log(data);
};
```

---

### Using Postman

1. **Method:** GET
2. **URL:** `http://localhost:5000/api/voters/search`
3. **Params:**
   - Key: `query`, Value: `Satupte` (for English) or `सत्तुपे` (for Marathi)
   - Key: `page`, Value: `1` (optional)
   - Key: `limit`, Value: `50` (optional)

---

## Error Responses

### Missing Query Parameter
```json
{
  "success": false,
  "message": "Please provide a search query",
  "message_mr": "कृपया शोध क्वेरी प्रदान करें"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Server error",
  "message_mr": "सर्वर एरर",
  "error": "Error details..."
}
```

---

## How Language Detection Works

The API automatically detects the language by checking for Devanagari (देवनागरी) characters:

- **Contains Devanagari characters (Unicode: U+0900 to U+097F)** → Searches in `name_mr` field, returns Marathi data
- **No Devanagari characters** → Searches in `name` field, returns English data

### Examples:
- `"Satupte"` → English search
- `"सत्तुपे"` → Marathi search
- `"Anand Baburao"` → English search
- `"आनंद बाबुराव"` → Marathi search

---

## Notes

- Search is **case-insensitive**
- Search supports **partial matching** (e.g., searching "Satu" will find "Satupte")
- Results are sorted by `createdAt` in descending order (newest first)
- If no results found, returns empty array with `count: 0`

---

## Complete API Endpoints List

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/voters/upload` | Upload Excel file with voter data |
| GET | `/api/voters/search` | **Search voters by name (bilingual)** |
| GET | `/api/voters` | Get all voters (paginated) |
| GET | `/api/voters/:id` | Get single voter by ID |
| DELETE | `/api/voters` | Delete all voters |


