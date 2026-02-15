{
  "name": "Notification",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string"
    },
    "message": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "info",
        "success",
        "warning",
        "error",
        "transaction"
      ]
    },
    "is_read": {
      "type": "boolean",
      "default": false
    },
    "link": {
      "type": "string",
      "description": "Optional link to a relevant page"
    }
  },
  "required": [
    "user_id",
    "message",
    "type"
  ],
  "rls": {
    "read": {
      "$or": [
        {
          "user_id": "{{user.id}}"
        },
        {
          "user_condition": {
            "role": "admin"
          }
        }
      ]
    },
    "write": {
      "$or": [
        {
          "user_id": "{{user.id}}"
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