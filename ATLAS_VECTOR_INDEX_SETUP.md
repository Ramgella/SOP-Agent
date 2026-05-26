# MongoDB Atlas Vector Search Index Setup

## Why this is needed
OpsMind AI stores 1024-dimensional embedding vectors in the `sopchunks` collection.
Atlas must know about this field to enable semantic search via `$vectorSearch`.

## Step-by-step (Atlas UI)

1. Go to your Atlas cluster → **Search** tab → **Create Search Index**
2. Choose **Atlas Vector Search** (not "Atlas Search")
3. Select database: `opsmind`, collection: `sopchunks`
4. Use **JSON Editor** and paste this configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1024,
      "similarity": "cosine"
    }
  ]
}
```

5. Name the index exactly: `sop_vector_index`
6. Click **Create Index** — Atlas will build it in the background (1-2 min)

## Verification query
After uploading at least one document, run this in MongoDB Compass or Atlas Data Explorer:

```javascript
db.sopchunks.aggregate([
  {
    $vectorSearch: {
      index: "sop_vector_index",
      path: "embedding",
      queryVector: Array(1024).fill(0.01), // dummy vector
      numCandidates: 10,
      limit: 3
    }
  },
  { $project: { source: 1, score: { $meta: "vectorSearchScore" }, text: { $substr: ["$text", 0, 100] } } }
])
```

You should see 3 results with scores between 0 and 1.
