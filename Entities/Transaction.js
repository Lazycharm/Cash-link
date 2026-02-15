{
  "name": "Transaction",
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": [
        "withdrawal",
        "deposit",
        "payment",
        "subscription",
        "promotion"
      ]
    },
    "customer_id": {
      "type": "string",
      "description": "ID of the customer"
    },
    "agent_id": {
      "type": "string",
      "description": "ID of the agent (for withdrawals/deposits)"
    },
    "amount": {
      "type": "number",
      "description": "Transaction amount"
    },
    "currency": {
      "type": "string",
      "default": "AED"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "completed",
        "cancelled",
        "rejected"
      ],
      "default": "pending"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "mtn_mobile_money",
        "airtel_money",
        "mpesa",
        "flutterwave",
        "cash",
        "bank_transfer"
      ]
    },
    "reference": {
      "type": "string",
      "description": "Transaction reference number"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes"
    },
    "location": {
      "type": "object",
      "properties": {
        "latitude": {
          "type": "number"
        },
        "longitude": {
          "type": "number"
        },
        "address": {
          "type": "string"
        }
      }
    }
  },
  "required": [
    "type",
    "customer_id",
    "amount"
  ],
  "rls": {
    "read": {
      "$or": [
        {
          "customer_id": "{{user.id}}"
        },
        {
          "agent_id": "{{user.id}}"
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
          "customer_id": "{{user.id}}"
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