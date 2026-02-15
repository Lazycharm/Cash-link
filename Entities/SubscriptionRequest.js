{
  "name": "SubscriptionRequest",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string"
    },
    "package_id": {
      "type": "string",
      "description": "e.g., 'monthly', 'quarterly', 'yearly'"
    },
    "package_name": {
      "type": "string"
    },
    "duration_days": {
      "type": "number"
    },
    "cost": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "paid",
        "completed",
        "rejected"
      ],
      "default": "pending"
    }
  },
  "required": [
    "user_id",
    "package_id",
    "package_name",
    "duration_days",
    "cost"
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