{
  "name": "LostItem",
  "type": "object",
  "properties": {
    "item_name": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "last_seen_location": {
      "type": "string"
    },
    "image": {
      "type": "string"
    },
    "reporter_id": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "lost",
        "found"
      ],
      "default": "lost"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected",
        "reunited"
      ],
      "default": "pending"
    }
  },
  "required": [
    "item_name",
    "description",
    "reporter_id",
    "type"
  ],
  "rls": {
    "read": {},
    "write": {
      "$or": [
        {
          "reporter_id": "{{user.id}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    }
  }
}