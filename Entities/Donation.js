{
  "name": "Donation",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "requester_id": {
      "type": "string"
    },
    "target_amount": {
      "type": "number"
    },
    "current_amount": {
      "type": "number",
      "default": 0
    },
    "image": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "completed",
        "closed"
      ],
      "default": "active"
    }
  },
  "required": [
    "title",
    "description",
    "requester_id",
    "target_amount"
  ],
  "rls": {
    "read": {},
    "write": {
      "$or": [
        {
          "requester_id": "{{user.id}}"
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