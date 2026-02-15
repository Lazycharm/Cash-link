{
  "name": "PromotionRequest",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string"
    },
    "entity_type": {
      "type": "string",
      "enum": [
        "marketplace_item",
        "business",
        "event"
      ]
    },
    "entity_id": {
      "type": "string"
    },
    "entity_title": {
      "type": "string"
    },
    "promotion_cost": {
      "type": "number"
    },
    "duration_days": {
      "type": "number",
      "default": 7
    },
    "package_id": {
      "type": "string",
      "default": "basic"
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
    "entity_type",
    "entity_id",
    "entity_title",
    "promotion_cost"
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